function DispatcherPage({ trains, updateTripStatus, loadTrains }) {
  return (
    <section className="panel">
      <h2>Панель диспетчера</h2>

      <table>
        <thead>
          <tr>
            <th>Поезд</th>
            <th>Маршрут</th>
            <th>Статус</th>
            <th>Действие</th>
          </tr>
        </thead>

        <tbody>
          {trains.map((t) => (
            <tr key={t.id}>
              <td>{t.number}</td>
              <td>{t.from_station} → {t.to_station}</td>
              <td>{t.status}</td>
              <td>
                <button
                  onClick={() =>
                    updateTripStatus(
                      t.id,
                      t.status?.includes("Задерж") ? "По расписанию" : "Задерживается на 25 мин"
                    )
                  }
                >
                  Редактировать статус
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="primary" onClick={loadTrains}>Обновить рейсы</button>
    </section>
  );
}

export default DispatcherPage;
