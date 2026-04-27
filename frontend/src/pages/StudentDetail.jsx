import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
import { deleteStudent, getStudent } from "../services/api.js";

function StudentDetail({ isAdmin }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setLoading(true);
        setError("");
        setStudent(await getStudent(id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [id]);

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

  if (loading) return <p className="state-message">Loading profile...</p>;
  if (error) return <p className="state-message error-message">{error}</p>;
  if (!student) return <p className="state-message">Profile not found.</p>;

  const work = student.work || {};
  const socialLinks = student.socialLinks || {};

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
              <p className="eyebrow">Roll {student.rollNumber}</p>
              <h1>{student.name}</h1>
            </div>
            <StatusBadge status={work.status} />
          </div>

          <p className="profile-summary">
            {work.jobTitle || "Career details pending"}
            {work.company ? ` at ${work.company}` : ""}
          </p>

          <div className="detail-grid">
            <DetailItem label="Phone" value={student.phone} />
            <DetailItem label="Email" value={student.email} />
            <DetailItem label="Company" value={work.company} />
            <DetailItem label="Department" value={work.department} />
            <DetailItem label="Location" value={work.location} />
            <DetailItem label="Experience" value={`${work.experienceYears || 0} years`} />
            <DetailItem label="Created" value={new Date(student.createdAt).toLocaleDateString()} />
          </div>

          <div className="link-list">
            {socialLinks.facebook && <a href={socialLinks.facebook}>Facebook</a>}
            {socialLinks.linkedin && <a href={socialLinks.linkedin}>LinkedIn</a>}
            {socialLinks.github && <a href={socialLinks.github}>GitHub</a>}
          </div>

          <div className="profile-actions">
            <Link to={`/students/${student._id}/edit`} className="button button-primary">
              Edit profile
            </Link>
            {isAdmin && (
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
