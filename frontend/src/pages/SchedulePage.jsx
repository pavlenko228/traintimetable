import { money } from "../utils/formatters";

function SchedulePage({ search, setSearch, trains, loadTrains, handleBuyClick }) {
  return (
    <>
      <section className="hero">
        <div>
          <h1>Расписание поездов</h1>
          <p>
            Найдите рейс, посмотрите время отправления, наличие мест и стоимость.
            Покупка билета доступна после входа в систему.
          </p>
        </div>

        <div className="search-card">
          <label>Откуда</label>
          <input value={search.from} onChange={(e) => setSearch({ ...search, from: e.target.value })} />

          <label>Куда</label>
          <input value={search.to} onChange={(e) => setSearch({ ...search, to: e.target.value })} />

          <label>Дата</label>
          <input type="date" value={search.date} onChange={(e) => setSearch({ ...search, date: e.target.value })} />

          <button className="primary" onClick={loadTrains}>Найти рейсы</button>
        </div>
      </section>

      <section className="grid">
        {trains.map((train) => (
          <article className="train-card" key={train.id}>
            <div className="train-head">
              <b>Поезд {train.number}</b>
              <span className={train.status?.includes("Задерж") ? "badge warn" : "badge"}>{train.status}</span>
            </div>

            <div className="route">
              <div>
                <strong>{train.depart}</strong>
                <span>{train.from_station}</span>
              </div>
              <div className="line">{train.duration}</div>
              <div>
                <strong>{train.arrive}</strong>
                <span>{train.to_station}</span>
              </div>
            </div>

            <div className="prices">
              {Object.entries(train.prices || {}).map(([type, price]) => (
                <span key={type}>{type}: от {money(price)} ₽</span>
              ))}
            </div>

            <button onClick={() => handleBuyClick(train)}>Купить билет</button>
          </article>
        ))}
      </section>
    </>
  );
}

export default SchedulePage;
