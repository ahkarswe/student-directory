import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { clearStoredAuth, getStoredAuth } from "./services/api.js";
import Login from "./pages/Login.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import StudentDetail from "./pages/StudentDetail.jsx";
import StudentForm from "./pages/StudentForm.jsx";
import StudentList from "./pages/StudentList.jsx";

function App() {
  const [auth, setAuth] = useState(getStoredAuth);
  const isAdmin = auth?.role === "admin";

  const handleLogout = () => {
    clearStoredAuth();
    setAuth(null);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="UCMS MBA 3rd Batch's Student Directory home">
          UCMS MBA 3rd Batch's Student Directory
        </NavLink>
        <nav className="main-nav" aria-label="Primary navigation">
          {auth && (
            <>
              <NavLink to="/" end>
                Profiles
              </NavLink>
              <NavLink to="/students/new">Add student</NavLink>
              {isAdmin && <NavLink to="/admin/users">Users</NavLink>}
            </>
          )}
          {auth ? (
            <button type="button" className="nav-button" onClick={handleLogout}>
              Logout {auth.username}
            </button>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/login" element={auth ? <Navigate to="/" replace /> : <Login onLogin={setAuth} />} />
          <Route path="/" element={<ProtectedRoute auth={auth}><StudentList isAdmin={isAdmin} /></ProtectedRoute>} />
          <Route path="/students/new" element={<ProtectedRoute auth={auth}><StudentForm /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute auth={auth}><StudentDetail isAdmin={isAdmin} /></ProtectedRoute>} />
          <Route path="/students/:id/edit" element={<ProtectedRoute auth={auth}><StudentForm mode="edit" /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute auth={auth} adminOnly><UserManagement /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={auth ? "/" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

function ProtectedRoute({ auth, adminOnly = false, children }) {
  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && auth.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;
