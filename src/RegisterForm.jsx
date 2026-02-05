import { useState } from "react";

export default function RegisterForm({
                                       email,
                                       setEmail,
                                       passwordReg,
                                       setPasswordReg,
                                       register,
                                     }) {
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Walidacja email
    if (!email) {
      setPasswordError("Email nie może być pusty");
      return;
    }

    if (!email.includes("@")) {
      setPasswordError("Podaj poprawny email (np. konto@konto.pl)");
      return;
    }

    // Walidacja hasła
    if (!passwordReg) {
      setPasswordError("Hasło nie może być puste");
      return;
    }

    if (passwordReg.length < 6) {
      setPasswordError("Hasło musi mieć co najmniej 6 znaków");
      return;
    }

    setPasswordError("");

    try {
      const result = await register(email, passwordReg);

      if (!result?.ok) {
        const errorMap = {
          "auth/email-already-in-use": "Ten email jest już zarejestrowany",
          "auth/invalid-email": "Nieprawidłowy adres email",
          "auth/weak-password": "Hasło jest za słabe (min. 6 znaków)",
        };

        setPasswordError(
            errorMap[result?.code] || "Błąd rejestracji"
        );
      }
    } catch (err) {
      setPasswordError("Wystąpił nieoczekiwany błąd");
    }
  };

  return (
      <form
          className="containerRegistration"
          onSubmit={handleSubmit}
          noValidate
      >
        <div className="registrationbox">
          <input
              className="nameforregister"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
          />

          <input
              className="passwordforregister"
              type="password"
              placeholder="Hasło"
              value={passwordReg}
              onChange={(e) => setPasswordReg(e.target.value)}
              required
          />

          {passwordError && (
              <p style={{ color: "red", marginTop: "4px" }}>
                {passwordError}
              </p>
          )}

          <button className="sendregister" type="submit">
            Zarejestruj się
          </button>
        </div>
      </form>
  );
}
