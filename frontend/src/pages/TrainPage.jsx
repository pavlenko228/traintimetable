import { money } from "../utils/formatters";

function TrainPage({
  selectedTrain,
  currentUser,
  wagonType,
  setWagonType,
  selectedSeats,
  setSelectedSeats,
  seats,
  takenSeats,
  toggleSeat,
  loadSeats,
  passengerForm,
  setPassengerForm,
  total,
  payOrder,
  bookingDone,
  setView,
}) {
  return (
    <section className="panel">
      <button className="ghost" onClick={() => setView("schedule")}>← Назад к расписанию</button>

      <h2>Поезд {selectedTrain.number}: выбор мест</h2>

      <div className="split">
        <div>
          <div className="tabs">
            {Object.keys(selectedTrain.prices || {}).map((type) => (
              <button
                key={type}
                className={wagonType === type ? "active" : ""}
                onClick={() => {
                  setWagonType(type);
                  setSelectedSeats([]);
                  loadSeats(selectedTrain.id, type);
                }}
              >
                {type} · {money(selectedTrain.prices[type])} ₽
              </button>
            ))}
          </div>

          <div className="wagon">
            {seats.map((seatObj) => {
              const seat = seatObj.number;
              return (
                <button
                  key={seatObj.id}
                  className={takenSeats.includes(seat) ? "seat taken" : selectedSeats.includes(seat) ? "seat selected" : "seat"}
                  onClick={() => toggleSeat(seat)}
                >
                  {seat}
                </button>
              );
            })}
          </div>

          <div className="legend">
            <span><i className="free" /> свободно</span>
            <span><i className="selected-dot" /> выбрано</span>
            <span><i className="taken-dot" /> занято</span>
          </div>
        </div>

        <aside className="checkout">
          <h3>Оформление билета</h3>
          <p>Пассажир: {currentUser?.name}</p>
          <p>Вагон: {wagonType}</p>
          <p>Места: {selectedSeats.length ? selectedSeats.join(", ") : "не выбраны"}</p>
          <p>Таймер бронирования: <b>15:00</b></p>

          <h2>{money(total)} ₽</h2>

          <input placeholder="ФИО пассажира" value={passengerForm.passenger_name} onChange={(e) => setPassengerForm({ ...passengerForm, passenger_name: e.target.value })} />
          <input placeholder="Дата рождения" value={passengerForm.birth_date} onChange={(e) => setPassengerForm({ ...passengerForm, birth_date: e.target.value })} />
          <input placeholder="Документ" value={passengerForm.document_number} onChange={(e) => setPassengerForm({ ...passengerForm, document_number: e.target.value })} />
          <input placeholder="Бонусная карта РЖД, если есть" value={passengerForm.bonus_card} onChange={(e) => setPassengerForm({ ...passengerForm, bonus_card: e.target.value })} />

          <button className="primary register-submit" disabled={!selectedSeats.length || !passengerForm.passenger_name || !passengerForm.document_number} onClick={payOrder}>
            Оплатить картой
          </button>

          {bookingDone && <div className="success">Оплата успешна</div>}
        </aside>
      </div>
    </section>
  );
}

export default TrainPage;
