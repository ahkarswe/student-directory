import { useEffect, useState } from "react";
import { createUser, deleteUser, getUsers, updateUser } from "../services/api.js";

const roleOptions = [
  { value: "user", label: "User" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Superadmin" }
];

const roleLabels = {
  user: "👤 User",
  editor: "✏️ Editor",
  admin: "Admin",
  superadmin: "👑 Superadmin"
};

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
  const [editingUserId, setEditingUserId] = useState("");
  const [editValues, setEditValues] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "user",
    password: ""
  });

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

  const startEdit = (user) => {
    setEditingUserId(user.id || user._id);
    setEditValues({
      username: user.username || "",
      fullName: user.fullName || "",
      email: user.email || "",
      role: user.role || "user",
      password: ""
    });
    setMessage("");
    setError("");
  };

  const cancelEdit = () => {
    setEditingUserId("");
    setEditValues({
      username: "",
      fullName: "",
      email: "",
      role: "user",
      password: ""
    });
  };

  const updateEditValue = (event) => {
    setEditValues((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleUpdateUser = async (user) => {
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const updated = await updateUser(user.id || user._id, editValues);
      if (user.id === auth?.id || user._id === auth?.id) {
        setMessage("User updated. Re-login may be required if your role changed.");
      } else {
        setMessage(`${updated.username} updated.`);
      }
      cancelEdit();
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Superadmin tools</p>
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
                {roleOptions.map((roleOption) => (
                  <option key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </option>
                ))}
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
            const isEditing = editingUserId === userId;

            return (
              <div className={`user-row ${isEditing ? "user-row--editing" : ""}`} key={userId}>
                {isEditing ? (
                  <>
                    <label>
                      Username
                      <input name="username" value={editValues.username} onChange={updateEditValue} required />
                    </label>
                    <label>
                      Full name
                      <input name="fullName" value={editValues.fullName} onChange={updateEditValue} />
                    </label>
                    <label>
                      Email
                      <input name="email" value={editValues.email} onChange={updateEditValue} type="email" />
                    </label>
                    <label>
                      Role
                      <select name="role" value={editValues.role} onChange={updateEditValue}>
                        {roleOptions.map((roleOption) => (
                          <option key={roleOption.value} value={roleOption.value}>
                            {roleOption.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      New password
                      <input
                        name="password"
                        value={editValues.password}
                        onChange={updateEditValue}
                        type="password"
                        minLength="8"
                        placeholder="Leave blank to keep current password"
                      />
                    </label>
                    <div className="card-actions">
                      <button type="button" className="button button-primary" onClick={() => handleUpdateUser(user)} disabled={saving}>
                        Save
                      </button>
                      <button type="button" className="button button-secondary" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <strong>{user.fullName || user.username}</strong>
                    <span>{user.email || "No email"}</span>
                    <span>{roleLabels[user.role] || user.role}</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    <div className="card-actions">
                      <button type="button" className="button button-secondary" onClick={() => startEdit(user)}>
                        Edit
                      </button>
                      {!isCurrentUser ? (
                        <button type="button" className="button button-danger" onClick={() => handleDelete(user)}>
                          Delete
                        </button>
                      ) : (
                        <span className="muted">You</span>
                      )}
                    </div>
                  </>
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
