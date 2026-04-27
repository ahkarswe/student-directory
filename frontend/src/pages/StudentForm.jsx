import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createStudent, getStudent, updateStudent } from "../services/api.js";
import { emptyStudent, flattenStudent, toFormData } from "../utils/studentForm.js";

const employmentStatuses = ["Student", "Intern", "Full-time", "Freelancer"];

function StudentForm({ mode = "create" }) {
  const isEdit = mode === "edit";
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(emptyStudent);
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    const loadStudent = async () => {
      try {
        setLoading(true);
        setError("");
        const student = await getStudent(id);
        setValues(flattenStudent(student));
        setCurrentPhoto(student.photo);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [id, isEdit]);

  const updateValue = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    setPhotoFile(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = toFormData(values, photoFile);
      const savedStudent = isEdit ? await updateStudent(id, payload) : await createStudent(payload);
      navigate(`/students/${savedStudent._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="state-message">Loading form...</p>;

  return (
    <section className="page-section narrow-section">
      <Link to={isEdit ? `/students/${id}` : "/"} className="back-link">
        Back
      </Link>

      <div className="page-heading">
        <div>
          <p className="eyebrow">{isEdit ? "Update student profile" : "New student profile"}</p>
          <h1>{isEdit ? "Edit student information." : "Add a student to the directory."}</h1>
        </div>
      </div>

      {error && <p className="state-message error-message">{error}</p>}

      <form className="student-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Student information</legend>
          <div className="form-grid">
            <label>
              Name
              <input name="name" value={values.name} onChange={updateValue} required />
            </label>
            <label>
              Roll number
              <input name="rollNumber" value={values.rollNumber} onChange={updateValue} placeholder="1/MBA-000" required />
            </label>
            <label>
              Phone number
              <input
                name="phone"
                value={values.phone}
                onChange={updateValue}
                placeholder="+95 9 123 456 789"
                required
              />
            </label>
            <label>
              Email
              <input
                name="email"
                value={values.email}
                onChange={updateValue}
                type="email"
                placeholder="student@example.com"
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Work information</legend>
          <div className="form-grid">
            <label>
              Job title
              <input name="jobTitle" value={values.jobTitle} onChange={updateValue} />
            </label>
            <label>
              Company name
              <input name="company" value={values.company} onChange={updateValue} />
            </label>
            <label>
              Department
              <input name="department" value={values.department} onChange={updateValue} />
            </label>
            <label>
              Work location
              <input name="location" value={values.location} onChange={updateValue} placeholder="City, Country" />
            </label>
            <label>
              Employment status
              <select name="status" value={values.status} onChange={updateValue}>
                {employmentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Years of experience
              <input
                name="experienceYears"
                value={values.experienceYears}
                type="number"
                min="0"
                step="0.5"
                onChange={updateValue}
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Social links</legend>
          <div className="form-grid">
            <label>
              Facebook
              <input name="facebook" value={values.facebook} onChange={updateValue} type="url" />
            </label>
            <label>
              LinkedIn
              <input name="linkedin" value={values.linkedin} onChange={updateValue} type="url" />
            </label>
            <label>
              GitHub
              <input name="github" value={values.github} onChange={updateValue} type="url" />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Photo</legend>
          <div className="upload-row">
            {currentPhoto && <img src={currentPhoto} alt="" className="upload-preview" />}
            <label>
              Student photo
              <input name="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
            </label>
          </div>
          <p className="helper-text">Images are stored in the Docker uploads volume and served by the backend.</p>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create student"}
          </button>
          <Link to={isEdit ? `/students/${id}` : "/"} className="button button-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}

export default StudentForm;
