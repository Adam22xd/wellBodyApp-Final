interface LoginProps {
  login: string;
  password: string;
  setLogin: (login: string) => void;
  setPassword: (password: string) => void;
  onLogin: () => void;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({
  login,
  password,
  setLogin,
  setPassword,
  onLogin,
  onClose,
  onSwitchToRegister,
}: LoginProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <form className="oneblock auth-card auth-card-login" onSubmit={handleSubmit}>
      <button
        type="button"
        className="auth-close"
        onClick={onClose}
        aria-label="Zamknij panel logowania"
      >
        x
      </button>

      <div className="auth-kicker">WellBody</div>
      <h2 className="form-title">Witaj ponownie</h2>
      <p className="form-subtitle">Wroc do swoich celow i dzisiejszych wpisow.</p>

      <div className="auth-switch" aria-label="Przelacznik formularza">
        <button type="button" className="auth-switch-tab auth-switch-tab-active">
          Logowanie
        </button>
        <button
          type="button"
          className="auth-switch-tab"
          onClick={onSwitchToRegister}
        >
          Rejestracja
        </button>
      </div>

      <div className="auth-badges">
        <span>Szybki start</span>
        <span>Twoje cele</span>
        <span>Historia postepow</span>
      </div>

      <div className="input-group">
        <label className="auth-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          type="text"
          placeholder="konto@wellbody.pl"
          value={login}
          className="inputLoginName"
          onChange={(e) => setLogin(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label className="auth-label" htmlFor="login-password">
          Haslo
        </label>
        <input
          id="login-password"
          type="password"
          placeholder="Minimum 6 znakow"
          value={password}
          className="inputLoginPassword"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button type="submit" className="logged auth-submit">
        Wejdz do aplikacji
      </button>

      <div className="auth-footer">
        <button type="button" className="forgotpassword" onClick={onClose}>
          Wroc do strony glownej
        </button>
      </div>
    </form>
  );
}
