import { useEffect, useState } from "react";
import { createUser, deleteUser, getUsers } from "../services/api.js";

function UserManagement({ auth }) {
  const [users, setUsers] = useState([]);
  const [values, setValues] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    role: "user"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      setUsers(await getUsers());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
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
      await createUser(values);
      setValues({ username: "", fullName: "", email: "", password: "", role: "user" });
      setMessage("User created.");
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete ${user.username}?`);
    if (!confirmed) return;

    try {
      await deleteUser(user.id || user._id);
      setMessage("User deleted.");
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Admin tools</p>
          <h1>Create users for the directory.</h1>
        </div>
      </div>

      {error && <p className="state-message error-message">{error}</p>}
      {message && <p className="state-message success-message">{message}</p>}

      <form className="student-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>New user</legend>

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
              Password
              <input
                name="password"
                value={values.password}
                onChange={updateValue}
                type="password"
                minLength="8"
                required
              />
            </label>

            <label>
              Role
              <select name="role" value={values.role} onChange={updateValue}>
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? "Creating..." : "Create user"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="state-message">Loading users...</p>
      ) : (
        <div className="user-table">
          {users.map((user) => {
            const userId = user.id || user._id;
            const isCurrentUser = userId === auth?.id;

            return (
              <div className="user-row" key={userId}>
                <strong>{user.fullName || user.username}</strong>

                <span>{user.email || "No email"}</span>

                <span>
                  {user.role === "admin" ? "👑 Admin" : user.role === "editor" ? "✏️ Editor" : "👤 User"}
                </span>

                <span>{new Date(user.createdAt).toLocaleDateString()}</span>

                {!isCurrentUser ? (
                  <button className="button button-danger" onClick={() => handleDelete(user)}>
                    Delete
                  </button>
                ) : (
                  <span className="muted">You</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default UserManagement;
