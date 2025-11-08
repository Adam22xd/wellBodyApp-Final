export default function LoginPanel({
  login,
  setLogin,
  password,
  setPassword,
  handleSaveLogin,
  handleResetLogin
}) {
  return (
    <div className="containerheader">
      <div className="oneblock">
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="adres email lub nazwa użytkownika"
          className="inputLoginName"
        ></input>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Wpisz hasło"
          className="inputLoginPassword"
        ></input>
        <div className="saveloadbtn">
          <button className="logged" onClick={handleSaveLogin}>
            Zaloguj się
          </button>
          <a href="" 
          className="forgotpassword"
          onClick={handleResetLogin}
          >
            nie pamiętasz hasła ?
          </a>
        </div>
      </div>
    </div>
  );
}
