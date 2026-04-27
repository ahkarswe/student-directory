import { useState } from "react";
import { login } from "../services/api.js";

function Login({ onLogin }) {
  const [values, setValues] = useState({ username: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const user = await login(values);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-section narrow-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Private directory</p>
          <h1>Login to access student records.</h1>
        </div>
      </div>

      {error && <p className="state-message error-message">{error}</p>}

      <form className="student-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Login</legend>
          <div className="form-grid">
            <label>
              Username
              <input name="username" value={values.username} onChange={updateValue} autoComplete="username" required />
            </label>
            <label>
              Password
              <input
                name="password"
                value={values.password}
                onChange={updateValue}
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Login;
