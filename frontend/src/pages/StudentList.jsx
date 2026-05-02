import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../components/Pagination.jsx";
import SearchFilters from "../components/SearchFilters.jsx";
import StudentCard from "../components/StudentCard.jsx";
import { deleteStudent, getStudents } from "../services/api.js";

const defaultFilters = {
  search: "",
  status: "",
  location: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: 12
};

function StudentList({ auth }) {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = auth?.role;

  const isAdmin = role === "admin";
  const canEdit = role === "admin" || role === "editor";
  const canDelete = role === "admin";

  const loadStudents = async (nextFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const response = await getStudents(nextFilters);
      setStudents(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    loadStudents(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    loadStudents(defaultFilters);
  };

  const handlePageChange = (page) => {
    const nextFilters = { ...filters, page };
    setFilters(nextFilters);
    loadStudents(nextFilters);
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(`Delete ${student.name}'s profile? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteStudent(student._id);
      loadStudents(filters);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Career-ready student records</p>
          <h2>Find students by name, roll number, role, or company.</h2>
        </div>
        {/* <Link to="/students/new" className="button button-primary"> */}
         {canEdit && (<Link to="/students/new" className="button button-primary">
          Add student
        </Link>)}
      </div>

      <SearchFilters filters={filters} onChange={setFilters} onSubmit={handleSubmit} onReset={handleReset} />

      {loading && <p className="state-message">Loading student profiles...</p>}
      {error && <p className="state-message error-message">{error}</p>}

      {!loading && !error && students.length === 0 && (
        <div className="empty-state">
          <h2>No students found</h2>
          <p>Try a different search or add the first student profile.</p>
        </div>
      )}

      {/* <div className="student-grid">
        {students.map((student) => (
          <StudentCard key={student._id} student={student} canDelete={isAdmin} onDelete={handleDelete} />
        ))}
      </div> */}

       <div className="student-grid">
        {students.map((student) => (
          <StudentCard key={student._id} student={student} canDelete={canDelete} canEdit={canEdit} onDelete={handleDelete} />
        ))}
      </div>


      <Pagination pagination={pagination} onPageChange={handlePageChange} />
    </section>
  );
}

export default StudentList;
