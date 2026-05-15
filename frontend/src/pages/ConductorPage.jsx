function ConductorPage({ manifest }) {
  return (
    <section className="panel">
      <h2>Посадочная ведомость</h2>
      <p className="muted">Данные загружаются с backend</p>

      {!manifest.length && <div className="notice">Ручка /conductor/manifest пока не подключена или ведомость пустая.</div>}

      <div className="split">
        <div className="wagon compact">
          {Array.from({ length: 24 }, (_, i) => i + 1).map((seat) => (
            <button key={seat} className={manifest.some((p) => p.seat === seat) ? "seat taken" : "seat"}>
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
