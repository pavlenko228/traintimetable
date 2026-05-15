import { roleTitle } from "../utils/formatters";

function Header({ currentUser, setView, logout, loadMyOrders, loadUsers, loadManifest }) {
  return (
    <header className="topbar">
      <div>
        <div className="logo">RailFlow</div>
        <div className="muted">Поиск и покупка железнодорожных билетов</div>
      </div>

      <nav>
        <button onClick={() => setView("schedule")}>Расписание</button>

        {currentUser?.role === "passenger" && (
          <button
            onClick={() => {
              setView("tickets");
              loadMyOrders();
            }}
          >
            Мои билеты
          </button>
        )}

        {currentUser?.role === "dispatcher" && (
          <button onClick={() => setView("dispatcher")}>Панель диспетчера</button>
        )}

        {currentUser?.role === "admin" && (
          <button
            onClick={() => {
              setView("admin");
              loadUsers();
            }}
          >
            Админ-панель
          </button>
        )}

        {currentUser?.role === "conductor" && (
          <button
            onClick={() => {
              setView("conductor");
              loadManifest();
            }}
          >
            Посадочная ведомость
          </button>
        )}
      </nav>

      <div className="auth-box">
        {currentUser ? (
          <>
            <div>
              <b>{currentUser.name}</b>
              <span>{roleTitle(currentUser.role)}</span>
            </div>
            <button onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <button className="primary" onClick={() => setView("register")}>
              Регистрация
          </button>
            <button className="primary" onClick={() => setView("login")}>Войти</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
