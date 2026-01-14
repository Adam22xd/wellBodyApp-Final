
export default function RegisterForm({
  name,
  surname,
  regPassword,
  setName,
  setSurname,
  setRegPassword,
  onRegister,
  errors,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="form-title">Rejestracja</h2>

      <div className="containerRegistration">
        <div className="registrationbox">
          <input
            type="text"
            placeholder="Imię"
            value={name}
            className="nameforregister"
            onChange={(e) => setName(e.target.value)}
          />
          {errors?.name && <div className="error">{errors.name}</div>}

          <input
            type="text"
            placeholder="Nazwisko"
            value={surname}
            className="surnameforregister"
            onChange={(e) => setSurname(e.target.value)}
          />
          {errors?.surname && <div className="error">{errors.surname}</div>}

          <input
            type="password"
            placeholder="Hasło"
            value={regPassword}
            className="passwordforregister"
            onChange={(e) => setRegPassword(e.target.value)}
          />
          {errors?.password && <div className="error">{errors.password}</div>}

          <button type="submit" className="sendregister">
            Zarejestruj się
          </button>
        </div>
      </div>
    </form>
  );
}
