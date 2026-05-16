import { useEffect, useState } from "react";
import { createInvitationCode, deactivateInvitationCode, getInvitationCodes } from "../services/api.js";

function InviteCodeManagement() {
  const [codes, setCodes] = useState([]);
  const [values, setValues] = useState({
    department: "",
    batch: "",
    expiresAt: "",
    maxUses: 1
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCodes = async () => {
    try {
      setLoading(true);
      setError("");
      setCodes(await getInvitationCodes());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const updateValue = (event) => {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createInvitationCode({
        ...values,
        maxUses: Number(values.maxUses),
        expiresAt: new Date(values.expiresAt).toISOString()
      });
      setValues({ department: "", batch: "", expiresAt: "", maxUses: 1 });
      setMessage("Invite code created.");
      loadCodes();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (code) => {
    try {
      await deactivateInvitationCode(code._id || code.id);
      setMessage("Invite code disabled.");
      loadCodes();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Admin tools</p>
          <h1>Manage invite codes.</h1>
        </div>
      </div>

      {error && <p className="state-message error-message">{error}</p>}
      {message && <p className="state-message success-message">{message}</p>}

      <form className="student-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Create invite code</legend>
          <div className="form-grid">
            <label>
              Department
              <input name="department" value={values.department} onChange={updateValue} required />
            </label>
            <label>
              Batch
              <input name="batch" value={values.batch} onChange={updateValue} required />
            </label>
            <label>
              Expires at
              <input name="expiresAt" value={values.expiresAt} onChange={updateValue} type="datetime-local" required />
            </label>
            <label>
              Max uses
              <input name="maxUses" value={values.maxUses} onChange={updateValue} type="number" min="1" required />
            </label>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? "Creating..." : "Create invite code"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="state-message">Loading invite codes...</p>
      ) : (
        <div className="admin-list">
          {codes.map((code) => (
            <article className="admin-row" key={code._id || code.id}>
              <div>
                <strong>{code.code}</strong>
                <p className="muted">
                  {code.department} · Batch {code.batch} · Uses {code.usedCount}/{code.maxUses}
                </p>
                <p className="muted">
                  Expires {code.expiresAt ? new Date(code.expiresAt).toLocaleString() : "N/A"} ·{" "}
                  {code.isActive ? "Active" : "Disabled"}
                </p>
              </div>
              <div className="card-actions">
                {code.isActive && (
                  <button type="button" className="button button-danger" onClick={() => handleDeactivate(code)}>
                    Disable
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default InviteCodeManagement;
