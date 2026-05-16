import { useState } from "react";
import { Link } from "react-router-dom";
import { signup } from "../services/api.js";

function Signup({ onSignup }) {
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    password: "",
    studentId: "",
    inviteCode: ""
  });
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
      const auth = await signup(values);
      onSignup(auth);
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
          <p className="eyebrow">Invite-based signup</p>
          <h1>Create your student account.</h1>
        </div>
      </div>

      {error && <p className="state-message error-message">{error}</p>}

      <form className="student-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Account details</legend>
          <div className="form-grid">
            <label>
              Full name
              <input name="fullName" value={values.fullName} onChange={updateValue} autoComplete="name" required />
            </label>
            <label>
              Email
              <input name="email" value={values.email} onChange={updateValue} type="email" autoComplete="email" required />
            </label>
            <label>
              Password
              <input
                name="password"
                value={values.password}
                onChange={updateValue}
                type="password"
                autoComplete="new-password"
                minLength="8"
                required
              />
            </label>
            <label>
              Student ID
              <input name="studentId" value={values.studentId} onChange={updateValue} required />
            </label>
            <label>
              Invite code
              <input name="inviteCode" value={values.inviteCode} onChange={updateValue} required />
            </label>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? "Creating account..." : "Create account"}
          </button>
          <Link to="/login" className="button button-secondary">
            Back to login
          </Link>
        </div>
      </form>
    </section>
  );
}

export default Signup;
