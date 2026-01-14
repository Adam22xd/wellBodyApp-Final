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

      <label>
        Imię:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="error-text">{errors.name}</p>}
      </label>

      <label>
        Nazwisko:
        <input
          type="text"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />
        {errors.surname && <p className="error-text">{errors.surname}</p>}
      </label>

      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label>
        Hasło:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="error-text">{errors.password}</p>}
      </label>

      <button onClick={register}>Utwórz konto</button>
    </div>
  );
}
