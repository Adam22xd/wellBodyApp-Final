import { useState } from "react";

interface RegisterFormProps {
  email: string;
  setEmail: (email: string) => void;
  passwordReg: string;
  setPasswordReg: (password: string) => void;
  onClose: () => void;
  onSwitchToLogin: () => void;
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
  onClose,
  onSwitchToLogin,
  register,
}: RegisterFormProps) {
  const [passwordError, setPasswordError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setPasswordError("Email nie moze byc pusty");
      return;
    }

    if (!email.includes("@")) {
      setPasswordError("Podaj poprawny email, np. konto@konto.pl");
      return;
    }

    if (!passwordReg) {
      setPasswordError("Haslo nie moze byc puste");
      return;
    }

    if (passwordReg.length < 6) {
      setPasswordError("Haslo musi miec co najmniej 6 znakow");
      return;
    }

    setPasswordError("");

    try {
      const result = await register(email, passwordReg);

      if (!result?.ok) {
        const errorMap: Record<string, string> = {
          "auth/email-already-in-use": "Ten email jest juz zarejestrowany",
          "auth/invalid-email": "Nieprawidlowy adres email",
          "auth/weak-password": "Haslo jest za slabe, minimum 6 znakow",
        };

        setPasswordError(errorMap[result?.code ?? ""] || "Blad rejestracji");
      }
    } catch {
      setPasswordError("Wystapil nieoczekiwany blad");
    }
  };

  return (
    <form
      className="registrationbox auth-card auth-card-register"
      onSubmit={handleSubmit}
      noValidate
    >
      <button
        type="button"
        className="auth-close"
        onClick={onClose}
        aria-label="Zamknij panel rejestracji"
      >
        x
      </button>

      <div className="auth-kicker">Nowe konto</div>
      <p className="reg-text">Dolacz do WellBody</p>
      <p className="form-subtitle">
        Ustaw konto i zacznij monitorowac jedzenie oraz nawodnienie.
      </p>

      <div className="auth-switch" aria-label="Przelacznik formularza">
        <button
          type="button"
          className="auth-switch-tab"
          onClick={onSwitchToLogin}
        >
          Logowanie
        </button>
        <button type="button" className="auth-switch-tab auth-switch-tab-active">
          Rejestracja
        </button>
      </div>

      <div className="auth-badges">
        <span>1 konto</span>
        <span>Dzienne cele</span>
        <span>Lepsze nawyki</span>
      </div>

      <label className="auth-label" htmlFor="register-email">
        Email
      </label>
      <input
        id="register-email"
        className="reg-input-email"
        placeholder="konto@wellbody.pl"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label className="auth-label" htmlFor="register-password">
        Haslo
      </label>
      <input
        id="register-password"
        className="reg-input-pass"
        placeholder="Minimum 6 znakow"
        type="password"
        value={passwordReg}
        onChange={(e) => setPasswordReg(e.target.value)}
        required
      />

      {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}

      <button type="submit" className="auth-submit">
        Utworz konto
      </button>

      <div className="auth-footer">
        <button type="button" className="forgotpassword" onClick={onSwitchToLogin}>
          Masz juz konto? Zaloguj sie
        </button>
      </div>
    </form>
  );
}
