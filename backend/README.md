# RailFlow Backend

FastAPI + SQLAlchemy backend для фронтенда RailFlow.

## Запуск

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Swagger: http://localhost:8000/docs

## Тестовые пользователи

- passenger@test.ru / 123
- dispatcher@test.ru / 123
- admin@test.ru / 123
- conductor@test.ru / 123

## Основные ручки

- POST /auth/login
- GET /trips/search?from_station=Москва&to_station=Санкт-Петербург&date=2026-05-14
- GET /trips/{trip_id}/seats
- POST /orders
- GET /orders/my
- POST /orders/{order_id}/pay
- POST /orders/{order_id}/refund
- GET /dispatcher/trips
- PATCH /dispatcher/trips/{trip_id}/status
- GET /admin/users
- PATCH /admin/users/{user_id}
- GET /conductor/trips/{trip_id}/manifest
