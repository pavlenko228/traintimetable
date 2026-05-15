from datetime import date, datetime
from enum import Enum
from sqlalchemy import Date, DateTime, Enum as SAEnum, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.session import Base


class UserRole(str, Enum):
    passenger = "passenger"
    dispatcher = "dispatcher"
    admin = "admin"
    conductor = "conductor"


class TripStatus(str, Enum):
    on_time = "По расписанию"
    delayed = "Задерживается"
    cancelled = "Отменен"


class OrderStatus(str, Enum):
    pending_payment = "Ожидает оплаты"
    paid = "Оплачен"
    refunded = "Возвращен"
    cancelled = "Отменен"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.passenger)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    orders: Mapped[list["Order"]] = relationship(back_populates="user")


class Station(Base):
    __tablename__ = "stations"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    city: Mapped[str] = mapped_column(String(120), index=True)


class Train(Base):
    __tablename__ = "trains"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    train_type: Mapped[str] = mapped_column(String(120))

    trips: Mapped[list["Trip"]] = relationship(back_populates="train")


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True)
    train_id: Mapped[int] = mapped_column(ForeignKey("trains.id"))
    from_station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"))
    to_station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"))
    trip_date: Mapped[date] = mapped_column(Date, index=True)
    depart_time: Mapped[str] = mapped_column(String(5))
    arrive_time: Mapped[str] = mapped_column(String(5))
    duration: Mapped[str] = mapped_column(String(64))
    status: Mapped[TripStatus] = mapped_column(SAEnum(TripStatus), default=TripStatus.on_time)
    delay_minutes: Mapped[int] = mapped_column(Integer, default=0)

    train: Mapped[Train] = relationship(back_populates="trips")
    from_station: Mapped[Station] = relationship(foreign_keys=[from_station_id])
    to_station: Mapped[Station] = relationship(foreign_keys=[to_station_id])
    wagons: Mapped[list["Wagon"]] = relationship(back_populates="trip", cascade="all, delete-orphan")


class Wagon(Base):
    __tablename__ = "wagons"

    id: Mapped[int] = mapped_column(primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"))
    number: Mapped[int] = mapped_column(Integer)
    wagon_type: Mapped[str] = mapped_column(String(64))
    seats_count: Mapped[int] = mapped_column(Integer, default=40)
    base_price: Mapped[int] = mapped_column(Integer)

    trip: Mapped[Trip] = relationship(back_populates="wagons")
    seats: Mapped[list["Seat"]] = relationship(back_populates="wagon", cascade="all, delete-orphan")


class Seat(Base):
    __tablename__ = "seats"

    id: Mapped[int] = mapped_column(primary_key=True)
    wagon_id: Mapped[int] = mapped_column(ForeignKey("wagons.id"))
    number: Mapped[int] = mapped_column(Integer)
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=False)

    wagon: Mapped[Wagon] = relationship(back_populates="seats")
    ticket: Mapped["Ticket | None"] = relationship(back_populates="seat")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[OrderStatus] = mapped_column(SAEnum(OrderStatus), default=OrderStatus.pending_payment)
    total_amount: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    hold_expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped[User] = relationship(back_populates="orders")
    tickets: Mapped[list["Ticket"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"))
    seat_id: Mapped[int] = mapped_column(ForeignKey("seats.id"), unique=True)
    passenger_name: Mapped[str] = mapped_column(String(255))
    birth_date: Mapped[str | None] = mapped_column(String(32), nullable=True)
    document_number: Mapped[str] = mapped_column(String(64))
    price: Mapped[int] = mapped_column(Integer)
    qr_code: Mapped[str] = mapped_column(String(255))
    is_refunded: Mapped[bool] = mapped_column(Boolean, default=False)

    order: Mapped[Order] = relationship(back_populates="tickets")
    trip: Mapped[Trip] = relationship()
    seat: Mapped[Seat] = relationship(back_populates="ticket")
