export default function RegisterForm({
  name,
  setName,
  surname,
  setSurname,
  email,
  setEmail,
  password,
  setPassword,
  register,
  errors,
}) {
  return (
    <div className="register-form">
      <h2>Rejestracja</h2>

      <div className="input-group">
        <input
          type="text"
          placeholder="Imię"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="error-text">{errors.name}</p>}
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="Nazwisko"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />
        {errors.surname && <p className="error-text">{errors.surname}</p>}
      </div>

      <div className="input-group">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="input-group">
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="error-text">{errors.password}</p>}
      </div>

      <button onClick={register}>Utwórz konto</button>
    </div>
  );
}
