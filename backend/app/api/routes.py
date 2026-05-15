from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import create_access_token, hash_password, require_roles, verify_password
from app.db.session import get_db
from app.models.domain import Order, OrderStatus, Seat, Ticket, Trip, User, UserRole, Wagon
from app.schemas.domain import (
    LoginIn, OrderCreateIn, OrderOut, RegisterIn, SeatOut, TicketOut, TokenOut,
    TripSearchOut, TripStatusUpdateIn, UserOut, UserPatchIn,
)

router = APIRouter()


def trip_to_out(trip: Trip) -> TripSearchOut:
    prices = {w.wagon_type: w.base_price for w in trip.wagons}
    status = trip.status.value if trip.delay_minutes == 0 else f"Задерживается на {trip.delay_minutes} мин"
    return TripSearchOut(
        id=trip.id,
        number=trip.train.number,
        from_station=trip.from_station.name,
        to_station=trip.to_station.name,
        depart=trip.depart_time,
        arrive=trip.arrive_time,
        duration=trip.duration,
        type=trip.train.train_type,
        status=status,
        prices=prices,
    )


def order_to_out(order: Order) -> OrderOut:
    tickets = []
    for ticket in order.tickets:
        trip = ticket.trip
        tickets.append(TicketOut(
            id=ticket.id,
            trip_id=trip.id,
            seat_number=ticket.seat.number,
            train_number=trip.train.number,
            route=f"{trip.from_station.city} → {trip.to_station.city}",
            passenger_name=ticket.passenger_name,
            document_number=ticket.document_number,
            price=ticket.price,
            qr_code=ticket.qr_code,
            is_refunded=ticket.is_refunded,
        ))
    return OrderOut(id=order.id, status=order.status, total_amount=order.total_amount,
                    hold_expires_at=order.hold_expires_at, tickets=tickets)


@router.post("/auth/register", response_model=TokenOut)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(409, "Пользователь с таким email уже существует")
    user = User(email=payload.email, hashed_password=hash_password(payload.password), name=payload.name,
                phone=payload.phone, role=UserRole.passenger)
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(access_token=create_access_token(user.email), user=user)


@router.post("/auth/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(401, "Неверный email или пароль")
    if not user.is_active:
        raise HTTPException(403, "Пользователь заблокирован")
    return TokenOut(access_token=create_access_token(user.email), user=user)


@router.get("/trips/search", response_model=list[TripSearchOut])
def search_trips(from_station: str, to_station: str | None = None, date: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Trip)
    if date:
        query = query.filter(Trip.trip_date == datetime.strptime(date, "%Y-%m-%d").date())
    trips = query.all()
    result = []
    for trip in trips:
        haystack_from = f"{trip.from_station.name} {trip.from_station.city}".lower()
        haystack_to = f"{trip.to_station.name} {trip.to_station.city}".lower()
        if from_station.lower() in haystack_from and (not to_station or to_station.lower() in haystack_to):
            result.append(trip_to_out(trip))
    return result


@router.get("/trips/{trip_id}/seats", response_model=list[SeatOut])
def trip_seats(trip_id: int, wagon_type: str | None = None, db: Session = Depends(get_db)):
    wagon_query = db.query(Wagon).filter(Wagon.trip_id == trip_id)
    if wagon_type:
        wagon_query = wagon_query.filter(Wagon.wagon_type == wagon_type)
    wagon = wagon_query.first()
    if not wagon:
        raise HTTPException(404, "Вагон не найден")
    return [SeatOut(id=s.id, number=s.number, status="taken" if s.ticket else "free", is_accessible=s.is_accessible) for s in wagon.seats]


@router.post("/orders", response_model=OrderOut)
def create_order(payload: OrderCreateIn, db: Session = Depends(get_db), user: User = Depends(require_roles(UserRole.passenger))):
    trip = db.get(Trip, payload.trip_id)
    if not trip:
        raise HTTPException(404, "Рейс не найден")
    order = Order(user_id=user.id, hold_expires_at=datetime.utcnow() + timedelta(minutes=15))
    db.add(order)
    db.flush()
    total = 0
    for item in payload.passengers:
        seat = db.get(Seat, item.seat_id)
        if not seat or seat.wagon.trip_id != payload.trip_id:
            raise HTTPException(400, "Некорректное место")
        if seat.ticket:
            raise HTTPException(409, f"Место {seat.number} уже занято")
        price = seat.wagon.base_price
        total += price
        db.add(Ticket(order_id=order.id, trip_id=trip.id, seat_id=seat.id,
                      passenger_name=item.passenger_name, birth_date=item.birth_date,
                      document_number=item.document_number, price=price,
                      qr_code=f"RF-{order.id}-{seat.id}"))
    order.total_amount = total
    db.commit()
    db.refresh(order)
    return order_to_out(order)


@router.get("/orders/my", response_model=list[OrderOut])
def my_orders(db: Session = Depends(get_db), user: User = Depends(require_roles(UserRole.passenger))):
    return [order_to_out(o) for o in db.query(Order).filter(Order.user_id == user.id).all()]


@router.post("/orders/{order_id}/pay", response_model=OrderOut)
def pay_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles(UserRole.passenger))):
    order = db.get(Order, order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(404, "Заказ не найден")
    if order.hold_expires_at and order.hold_expires_at < datetime.utcnow():
        order.status = OrderStatus.cancelled
        db.commit()
        raise HTTPException(409, "Таймер бронирования истек")
    order.status = OrderStatus.paid
    db.commit()
    db.refresh(order)
    return order_to_out(order)


@router.post("/orders/{order_id}/refund", response_model=OrderOut)
def refund_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(require_roles(UserRole.passenger))):
    order = db.get(Order, order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(404, "Заказ не найден")
    order.status = OrderStatus.refunded
    for ticket in order.tickets:
        ticket.is_refunded = True
        ticket.seat_id = ticket.seat_id  # место считается освобожденным бизнес-логикой фронта/запросов
    db.commit()
    db.refresh(order)
    return order_to_out(order)


@router.get("/dispatcher/trips", response_model=list[TripSearchOut])
def dispatcher_trips(db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.dispatcher))):
    return [trip_to_out(t) for t in db.query(Trip).all()]


@router.patch("/dispatcher/trips/{trip_id}/status", response_model=TripSearchOut)
def update_trip_status(trip_id: int, payload: TripStatusUpdateIn, db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.dispatcher))):
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(404, "Рейс не найден")
    trip.status = payload.status
    trip.delay_minutes = payload.delay_minutes
    db.commit()
    db.refresh(trip)
    return trip_to_out(trip)


@router.get("/admin/users", response_model=list[UserOut])
def admin_users(db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.admin))):
    return db.query(User).all()


@router.patch("/admin/users/{user_id}", response_model=UserOut)
def admin_update_user(user_id: int, payload: UserPatchIn, db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.admin))):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Пользователь не найден")
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.get("/conductor/trips/{trip_id}/manifest")
def conductor_manifest(trip_id: int, db: Session = Depends(get_db), _: User = Depends(require_roles(UserRole.conductor))):
    tickets = db.query(Ticket).filter(Ticket.trip_id == trip_id, Ticket.is_refunded == False).all()  # noqa: E712
    return [{"seat": t.seat.number, "name": t.passenger_name, "doc": t.document_number, "status": "Зарегистрирован"} for t in tickets]
