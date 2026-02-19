interface LoginProps {
  login: string;
  password: string;
  setLogin: (login: string) => void;
  setPassword: (password: string) => void;
  onLogin: () => void;
  logout: () => void;
}

export default function LoginForm({
  login,
  password,
  setLogin,
  setPassword,
  onLogin,
  logout,
}: LoginProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="containerheader">
      <form className="oneblock" onSubmit={handleSubmit}>
        <h2 className="form-title">Welcome Back</h2>
        <p className="form-subtitle">Zaloguj się, aby kontynuować</p>

        <div className="input-group">
          <input
            type="text"
            placeholder="Email"
            value={login}
            className="inputLoginName"
            onChange={(e) => setLogin(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            className="inputLoginPassword"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="logged">
          Zaloguj się
        </button>

        <button type="button" className="forgotpassword" onClick={logout}>
          Zapomniałeś hasła?
        </button>
      </form>
    </div>
  );
}
