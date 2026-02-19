import { useState } from "react";

interface RegisterFormProps {
  email: string;
  setEmail: (email: string) => void;
  passwordReg: string;
  setPasswordReg: (password: string) => void;
  register: (
    email: string,
    password: string,
  ) => Promise<{
    ok: boolean;
    code?: string;
  }>;
}

export default function RegisterForm({
  email,
  setEmail,
  passwordReg,
  setPasswordReg,
  register,
}: RegisterFormProps) {
  const [passwordError, setPasswordError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setPasswordError("Email nie może być pusty");
      return;
    }

    if (!email.includes("@")) {
      setPasswordError("Podaj poprawny email (np. konto@konto.pl)");
      return;
    }

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
        const errorMap: Record<string, string> = {
          "auth/email-already-in-use": "Ten email jest już zarejestrowany",
          "auth/invalid-email": "Nieprawidłowy adres email",
          "auth/weak-password": "Hasło jest za słabe (min. 6 znaków)",
        };

        setPasswordError(errorMap[result?.code ?? ""] || "Błąd rejestracji");
      }
    } catch {
      setPasswordError("Wystąpił nieoczekiwany błąd");
    }
  };

  return (
    <form className="containerRegistration" onSubmit={handleSubmit} noValidate>
      <div className="registrationbox">
        <p className="reg-text">Zarejestruj się</p>

        <input
          className="reg-input-email"
          placeholder="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="reg-input-pass"
          placeholder="password"
          type="password"
          value={passwordReg}
          onChange={(e) => setPasswordReg(e.target.value)}
          required
        />

        {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}

        <button type="submit">Zarejestruj się</button>
      </div>
    </form>
  );
}
