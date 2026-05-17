import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProfileStatusBadge from "../components/ProfileStatusBadge.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { approveStudentProfile, assignStudentOwner, deleteStudent, getStudent, getUsers } from "../services/api.js";
import { formatStudentId } from "../utils/studentId.js";

function StudentDetail({ auth }) {
  const role = auth?.role;
  const canManageProfile = role === "admin" || role === "superadmin";
  const isSuperadmin = role === "superadmin";
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [ownerUserId, setOwnerUserId] = useState("");
  const studentId = formatStudentId(student?.studentId || student?.rollNumber);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setLoading(true);
        setError("");
        const loadedStudent = await getStudent(id);
        setStudent(loadedStudent);
        setOwnerUserId(loadedStudent.ownerId || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [id]);

  useEffect(() => {
    if (!isSuperadmin) return;

    const loadUsers = async () => {
      try {
        setUsers(await getUsers());
      } catch (err) {
        setError(err.message);
      }
    };

    loadUsers();
  }, [isSuperadmin]);

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete ${student.name}'s profile? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteStudent(id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApprove = async () => {
    try {
      setSaving(true);
      const updated = await approveStudentProfile(id);
      setStudent(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignOwner = async () => {
    try {
      setSaving(true);
      const updated = await assignStudentOwner(id, ownerUserId);
      setStudent(updated);
      setOwnerUserId(updated.ownerId || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="state-message">Loading profile...</p>;
  if (error) return <p className="state-message error-message">{error}</p>;
  if (!student) return <p className="state-message">Profile not found.</p>;

  const work = student.work || {};
  const socialLinks = student.socialLinks || {};
  const canEditOwnProfile = canManageProfile || (role === "editor" && auth?.id === student.ownerId);
  const department = student.department || student.depardment || work.department;
  const editorUsers = users.filter((user) => user.role === "editor");
  const ownerUser = users.find((user) => (user.id || user._id) === student.ownerId);

  return (
    <section className="page-section">
      <Link to="/" className="back-link">
        Back to profiles
      </Link>

      <article className="profile-layout">
        <div className="profile-photo-panel">
          {student.photo ? (
            <img src={student.photo} alt={student.name} className="profile-photo" />
          ) : (
            <div className="profile-placeholder">{student.name?.charAt(0) || "S"}</div>
          )}
        </div>

        <div className="profile-content">
          <div className="profile-title-row">
            <div>
              <p className="eyebrow">Student ID {studentId || "N/A"}</p>
              <h1>{student.name}</h1>
            </div>
            <div className="badge-stack">
              <StatusBadge status={work.status} />
              <ProfileStatusBadge status={student.profileStatus} />
            </div>
          </div>

          <p className="profile-summary">
            {work.jobTitle || "Career details pending"}
            {work.company ? ` at ${work.company}` : ""}
          </p>

          <div className="detail-grid">
            <DetailItem label="Email" value={student.email} />
            <DetailItem label="Phone" value={student.phone} />
            <DetailItem label="Department" value={department} />
            <DetailItem label="Batch" value={student.batch} />
            {isSuperadmin && (
              <DetailItem label="Linked account" value={ownerUser?.fullName || ownerUser?.username || student.ownerId} />
            )}
            <DetailItem label="Location" value={work.location} />
            <DetailItem label="Experience" value={`${work.experienceYears || 0} years`} />
            <DetailItem label="Created" value={student.createdAt ? new Date(student.createdAt).toLocaleDateString() : ""} />
          </div>

          {isSuperadmin && student.profileStatus !== "approved" && (
            <div className="profile-actions">
              <button type="button" className="button button-primary" onClick={handleApprove} disabled={saving}>
                {saving ? "Approving..." : "Approve profile"}
              </button>
            </div>
          )}

          {isSuperadmin && (
            <div className="owner-assignment">
              <label>
                Linked editor account
                <select value={ownerUserId} onChange={(event) => setOwnerUserId(event.target.value)}>
                  <option value="">No linked account</option>
                  {editorUsers.map((user) => {
                    const userId = user.id || user._id;
                    return (
                      <option key={userId} value={userId}>
                        {user.fullName || user.username} {user.email ? `(${user.email})` : ""}
                      </option>
                    );
                  })}
                </select>
              </label>
              <button type="button" className="button button-secondary" onClick={handleAssignOwner} disabled={saving}>
                {saving ? "Saving..." : "Save linked account"}
              </button>
            </div>
          )}

          <div className="link-list">
            {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
            {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
            {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          </div>

          <div className="profile-actions">
            {canEditOwnProfile && (
              <Link to={`/students/${student._id}/edit`} className="button button-primary">
                Edit profile
              </Link>
            )}
            {isSuperadmin && (
              <button type="button" className="button button-danger" onClick={handleDelete}>
                Delete profile
              </button>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}

export default StudentDetail;
