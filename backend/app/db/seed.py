from datetime import date
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models.domain import User, UserRole, Station, Train, Trip, Wagon, Seat


def seed(db: Session) -> None:
    if db.query(User).first():
        return

    users = [
        User(email="passenger@test.ru", hashed_password=hash_password("123"), name="Иван Пассажиров", role=UserRole.passenger),
        User(email="dispatcher@test.ru", hashed_password=hash_password("123"), name="Мария Диспетчер", role=UserRole.dispatcher),
        User(email="admin@test.ru", hashed_password=hash_password("123"), name="Олег Админов", role=UserRole.admin),
        User(email="conductor@test.ru", hashed_password=hash_password("123"), name="Анна Проводник", role=UserRole.conductor),
    ]
    db.add_all(users)

    stations = {
        "Москва Ленинградский": Station(name="Москва Ленинградский", city="Москва"),
        "Санкт-Петербург Московский": Station(name="Санкт-Петербург Московский", city="Санкт-Петербург"),
        "Москва Казанский": Station(name="Москва Казанский", city="Москва"),
        "Казань Пасс.": Station(name="Казань Пасс.", city="Казань"),
        "Ярославль": Station(name="Ярославль", city="Ярославль"),
        "Москва Ярославский": Station(name="Москва Ярославский", city="Москва"),
    }
    db.add_all(stations.values())
    db.flush()

    data = [
        ("042А", "Скоростной", "Москва Ленинградский", "Санкт-Петербург Московский", "08:40", "12:28", "3ч 48м", [("Сидячий", 1890), ("Купе", 4200), ("СВ", 7900)]),
        ("016М", "Фирменный", "Москва Казанский", "Казань Пасс.", "21:12", "09:05", "11ч 53м", [("Плацкарт", 2450), ("Купе", 5100), ("СВ", 9800)]),
        ("102Я", "Ласточка", "Ярославль", "Москва Ярославский", "06:15", "09:35", "3ч 20м", [("Сидячий", 980), ("Бизнес", 2400)]),
    ]
    taken = {4, 8, 14, 22, 31, 37}
    for number, train_type, frm, to, depart, arrive, duration, wagon_types in data:
        train = Train(number=number, train_type=train_type)
        db.add(train)
        db.flush()
        trip = Trip(train_id=train.id, from_station_id=stations[frm].id, to_station_id=stations[to].id,
                    trip_date=date(2026, 5, 14), depart_time=depart, arrive_time=arrive, duration=duration)
        db.add(trip)
        db.flush()
        for idx, (wagon_type, price) in enumerate(wagon_types, start=1):
            wagon = Wagon(trip_id=trip.id, number=idx, wagon_type=wagon_type, seats_count=40, base_price=price)
            db.add(wagon)
            db.flush()
            for seat_no in range(1, 41):
                db.add(Seat(wagon_id=wagon.id, number=seat_no, is_accessible=(seat_no in {1, 2})))
    db.commit()
