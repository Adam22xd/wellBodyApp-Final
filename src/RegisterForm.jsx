
export default function RegisterForm({
  name,
  surname,
  passwordReg,
  setName,
  setSurname,
  setPasswordReg,
  errors,
  register,
}) {
const handleSubmit = (e) => {
  e.preventDefault();

  const success = register();
  if (success) {
    alert("Rejestracja zakończona sukcesem!");
  }

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
            value={passwordReg}
            className="passwordforregister"
            onChange={(e) => setPasswordReg(e.target.value)}
          />
          {errors?.passwordReg && <div className="error">{errors.passwordReg}</div>}

          <button type="submit" className="sendregister">
            Zarejestruj się
          </button>
        </div>
      </div>
    </form>
  );
}
