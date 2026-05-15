import { roleTitle } from "../utils/formatters";

function AdminPage({ users }) {
  return (
    <section className="panel">
      <h2>Администрирование</h2>

      <h3>Пользователи и роли</h3>

      {!users.length && <div className="notice">Ручка /admin/users пока не подключена или пользователей нет.</div>}

      <div className="cards">
        {users.map((u) => (
          <div className="mini-card" key={u.email}>
            <b>{u.name}</b>
            <p>{u.email}</p>
            <span>{roleTitle(u.role)}</span>
            <button>{u.status === "blocked" ? "Разблокировать" : "Заблокировать"}</button>
          </div>
        ))}
      </div>

      <h3>Тарифы и скидки</h3>

      <div className="tariffs">
        <input defaultValue="Москва — Санкт-Петербург" />
        <input defaultValue="Купе" />
        <input defaultValue="4200" />
        <input defaultValue="Коэффициент 1.25 при заполнении 90%" />
        <button className="primary">Применить тариф</button>
      </div>
    </section>
  );
}

export default AdminPage;
