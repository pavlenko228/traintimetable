import { testUsers } from "../constants";
import { roleTitle } from "../utils/formatters";

function LoginPage({ loginData, setLoginData, login, loginError, setView }) {
  return (
    <section className="login-layout">
      <div className="login-info">
        <h1>Вход в систему</h1>
        <p>После входа интерфейс автоматически изменится в зависимости от роли пользователя.</p>

        <div className="test-users">
          <h3>Тестовые пользователи</h3>
          {testUsers.map((user) => (
            <button key={user.email} onClick={() => setLoginData({ email: user.email, password: user.password })}>
              {roleTitle(user.role)} — {user.email}
            </button>
          ))}
        </div>
      </div>

      <form className="login-card" onSubmit={login}>
        <h2>Авторизация</h2>

        <label>Email</label>
        <input value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />

        <label>Пароль</label>
        <input type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />

        {loginError && <div className="error">{loginError}</div>}

        <button className="primary">Войти</button>
        <button type="button" onClick={() => setView("register")}>Создать аккаунт</button>

        <div className="notice">Для всех тестовых пользователей пароль: <b>123</b></div>
      </form>
    </section>
  );
}

export default LoginPage;
