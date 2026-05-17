import { Link } from "react-router-dom";
import ProfileStatusBadge from "./ProfileStatusBadge.jsx";
import StatusBadge from "./StatusBadge.jsx";
import { formatStudentId } from "../utils/studentId.js";

function StudentCard({ student, auth, canDelete, onDelete }) {
  const work = student.work || {};
  const socialLinks = student.socialLinks || {};
  const canEdit =
    auth?.role === "admin" ||
    auth?.role === "superadmin" ||
    (auth?.role === "editor" && auth?.id === student.ownerId);
  const studentId = formatStudentId(student.studentId || student.rollNumber);
  const department = student.department || student.depardment || work.department;

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
            <p className="muted">{studentId ? `Student ID ${studentId}` : "Student ID not provided"}</p>
          </div>
          <div className="badge-stack">
            <StatusBadge status={work.status} />
            <ProfileStatusBadge status={student.profileStatus} />
          </div>
        </div>

        <p className="job-line">
          {work.jobTitle || "Career details pending"}
          {work.company ? ` at ${work.company}` : ""}
        </p>
        <p className="muted">{department ? `${department} · Batch ${student.batch || "N/A"}` : "Department not provided"}</p>
        <p className="muted">{work.location || "Location not provided"}</p>
        <div className="contact-line">
          <span>{student.phone || "Phone not provided"}</span>
          {student.email && <span>{student.email}</span>}
        </div>

        <div className="social-row">
          {socialLinks.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
          {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
          {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
        </div>

        <div className="card-actions">
          <Link to={`/students/${student._id}`} className="button button-secondary">
            View
          </Link>
          {canEdit && (
            <Link to={`/students/${student._id}/edit`} className="button button-secondary">
              Edit
            </Link>
          )}
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
