from datetime import date, datetime
from pydantic import BaseModel, EmailStr
from app.models.domain import UserRole, TripStatus, OrderStatus


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: UserRole
    is_active: bool
    model_config = {"from_attributes": True}


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str | None = None


class TripSearchOut(BaseModel):
    id: int
    number: str
    from_station: str
    to_station: str
    depart: str
    arrive: str
    duration: str
    type: str
    status: str
    prices: dict[str, int]


class SeatOut(BaseModel):
    id: int
    number: int
    status: str
    is_accessible: bool


class OrderPassengerIn(BaseModel):
    seat_id: int
    passenger_name: str
    birth_date: str | None = None
    document_number: str
    bonus_card: str | None = None


class OrderCreateIn(BaseModel):
    trip_id: int
    passengers: list[OrderPassengerIn]


class TicketOut(BaseModel):
    id: int
    trip_id: int
    seat_number: int
    train_number: str
    route: str
    passenger_name: str
    document_number: str
    price: int
    qr_code: str
    is_refunded: bool


class OrderOut(BaseModel):
    id: int
    status: OrderStatus
    total_amount: int
    hold_expires_at: datetime | None
    tickets: list[TicketOut]


class TripStatusUpdateIn(BaseModel):
    status: TripStatus
    delay_minutes: int = 0


class UserPatchIn(BaseModel):
    role: UserRole | None = None
    is_active: bool | None = None
