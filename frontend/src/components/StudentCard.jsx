import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";

// function StudentCard({ student, canDelete, onDelete }) {
function StudentCard({ student, canDelete, onDelete, isAdmin }) {
  const work = student.work || {};
  const socialLinks = student.socialLinks || {};

  return (
    <article className={`student-card ${work.status === "Full-time" ? "currently-employed" : ""}`}>
      <Link to={`/students/${student._id}`} className="photo-link" aria-label={`Open ${student.name}`}>
        {student.photo ? (
          <img src={student.photo} alt={student.name} className="student-photo" />
        ) : (
          <div className="photo-placeholder" aria-hidden="true">
            {student.name?.charAt(0) || "S"}
          </div>
        )}
      </Link>

      <div className="card-body">
        <div className="card-title-row">
          <div>
            <h2>{student.name}</h2>
            <p className="muted">Roll {student.rollNumber}</p>
          </div>
          <StatusBadge status={work.status} />
        </div>

        <p className="job-line">
          {work.jobTitle || "Career details pending"}
          {work.company ? ` at ${work.company}` : ""}
        </p>
        <p className="muted">{work.location || "Location not provided"}</p>
        <div className="contact-line">
          <span>{student.phone}</span>
          {student.email && <span>{student.email}</span>}
        </div>

        <div className="social-row">
          {socialLinks.facebook && <a href={socialLinks.facebook}>Facebook</a>}
          {socialLinks.linkedin && <a href={socialLinks.linkedin}>LinkedIn</a>}
          {socialLinks.github && <a href={socialLinks.github}>GitHub</a>}
        </div>

        <div className="card-actions">
          <Link to={`/students/${student._id}`} className="button button-secondary">
            View
          </Link>
          {/* <Link to={`/students/${student._id}/edit`} className="button button-secondary"> */}
           {isAdmin && (<Link to={`/students/${student._id}/edit`} className="button button-secondary">
            Edit
          </Link>)}
          {canDelete && (
            <button type="button" className="button button-danger" onClick={() => onDelete(student)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default StudentCard;
