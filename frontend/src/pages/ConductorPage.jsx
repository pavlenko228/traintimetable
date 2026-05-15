function ConductorPage({ manifest, trains, loadManifest }) {
  return (
    <section className="panel">
      <h2>Посадочная ведомость</h2>
      <p className="muted">Выберите рейс, чтобы загрузить список пассажиров</p>

      <div className="tariffs">
        <select onChange={(e) => loadManifest(Number(e.target.value))}>
          <option value="">Выберите поезд</option>
          {trains.map((train) => (
            <option key={train.id} value={train.id}>
              Поезд {train.number}: {train.from_station} → {train.to_station}
            </option>
          ))}
        </select>
      </div>

      {!manifest.length && (
        <div className="notice">
          Для выбранного рейса посадочная ведомость пустая.
        </div>
      )}

      <div className="split">
        <div className="wagon compact">
          {Array.from({ length: 24 }, (_, i) => i + 1).map((seat) => (
            <button
              key={seat}
              className={
                manifest.some((p) => Number(p.seat) === seat)
                  ? "seat taken"
                  : "seat"
              }
            >
              {seat}
            </button>
          ))}
        </div>

        <div className="passenger-list">
          {manifest.map((p) => (
            <div className="mini-card" key={p.seat}>
              <b>Место {p.seat}</b>
              <p>{p.name}</p>
              <p>{p.doc}</p>
              <span className="badge">{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ConductorPage;