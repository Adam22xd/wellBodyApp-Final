
export default function LoginForm({
  login,
  password,
  setLogin,
  setPassword,
  onLogin,
  logout,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <form className="" onSubmit={handleSubmit}>
      <h2 className="form-title">Logowanie</h2>
      <div className="containerheader">
        <div className="oneblock">
          <input
            type="text"
            placeholder="Login (imię)"
            value={login}
            className="inputLoginName"
            onChange={(e) => setLogin(e.target.value)}
          />

          <input
            type="password"
            placeholder="Hasło"
            value={password}
            className="inputLoginPassword"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="logged">
            Zaloguj się
          </button>
          <a href="" className="forgotpassword" onClick={logout} >Zapomniałeś hasła?</a>
        </div>
      </div>
    </form>
  );
}
