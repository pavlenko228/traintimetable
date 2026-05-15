function RegisterPage({ registerData, setRegisterData, register, registerError, setView }) {
  return (
    <section className="login-layout">
      <div className="login-info">
        <h1>Регистрация пассажира</h1>
        <p>Создайте аккаунт пассажира, чтобы покупать билеты и смотреть историю заказов.</p>
      </div>

      <form className="login-card" onSubmit={register}>
        <h2>Новый аккаунт</h2>

        <label>Имя</label>
        <input value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} />

        <label>Email</label>
        <input value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} />

        <label>Пароль</label>
        <input type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} />

        {registerError && <div className="error">{registerError}</div>}

        <button className="primary">Зарегистрироваться</button>
        <button type="button" className="primary register-submit" onClick={() => setView("login")}>Уже есть аккаунт</button>
      </form>
    </section>
  );
}

export default RegisterPage;
