export default function RegisterForm({
  name,
  setName,
  surname,
  setSurname,
  password,
  setPassword,
  handleRegister,
  errors,
}) {
  return (
    <div className="containerRegistration">
      <div className="registrationbox">
        <div className="input-group">
          <input
            placeholder="Tutaj podaj imię"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="nameforregister"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div className="input-group">
          <input
            placeholder="Podaj nazwisko"
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="surnameforregister"
          />
          {errors.surname && <p className="error-text">{errors.surname}</p>}
        </div>

        <div className="input-group">
          <input
            placeholder="Wpisz hasło"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="passwordforregister"
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <div className="send">
          <button className="sendregister" onClick={handleRegister}>
            Zarejestruj się
          </button>
        </div>
      </div>
    </div>
  );
}
