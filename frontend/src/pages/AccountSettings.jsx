import { useState } from "react";
import { getCurrentUser, persistAuthState, updateUser } from "../services/api.js";

function AccountSettings({ auth, onAuthUpdate }) {
  const [values, setValues] = useState({
    username: auth?.username || "",
    fullName: auth?.fullName || "",
    email: auth?.email || "",
    password: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const updateValue = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await updateUser(auth.id, values);
      const currentUser = await getCurrentUser();
      const nextAuth = { ...auth, ...currentUser };
      persistAuthState(nextAuth);
      onAuthUpdate(nextAuth);
      setValues((current) => ({ ...current, password: "" }));
      setMessage("Account updated.");
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
          <p className="eyebrow">Account</p>
          <h1>Edit your account.</h1>
        </div>
      </div>

      {error && <p className="state-message error-message">{error}</p>}
      {message && <p className="state-message success-message">{message}</p>}

      <form className="student-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Login details</legend>
          <div className="form-grid">
            <label>
              Username
              <input name="username" value={values.username} onChange={updateValue} required />
            </label>
            <label>
              Full name
              <input name="fullName" value={values.fullName} onChange={updateValue} />
            </label>
            <label>
              Email
              <input name="email" value={values.email} onChange={updateValue} type="email" />
            </label>
            <label>
              New password
              <input
                name="password"
                value={values.password}
                onChange={updateValue}
                type="password"
                minLength="8"
                placeholder="Leave blank to keep current password"
              />
            </label>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? "Saving..." : "Save account"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AccountSettings;
