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
  const role = auth?.role;

  const isAdmin = role === "admin";
  const isEditor = role === "editor";

  const canEdit = role === "admin" || role === "editor";

  const handleLogout = () => {
    clearStoredAuth();
    setAuth(null);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="Student Directory home">
          Student Directory
        </NavLink>
        <nav className="main-nav" aria-label="Primary navigation">
          {auth && (
            <>
              <NavLink to="/" end>
                Profiles
              </NavLink>
              {/* <NavLink to="/students/new">Add student</NavLink> */}
              {canEdit && <NavLink to="/students/new">Add student</NavLink>}
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
          {/* <Route path="/" element={<StudentList isAdmin={isAdmin} />} />
          <Route path="/students/:id" element={<StudentDetail isAdmin={isAdmin} />} /> */}
          {/* for all auth users */}
          <Route path="/" element={<ProtectedRoute auth={auth}><StudentList auth={auth} /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute auth={auth}><StudentDetail auth={auth} /></ProtectedRoute>} />
          {/* <Route path="/students/new" element={<ProtectedRoute auth={auth}><StudentForm /></ProtectedRoute>} /> */}
          {/* for editor and admin */}
          <Route path="/students/new" element={<ProtectedRoute auth={auth} allowedRoles={["editor", "admin"]}><StudentForm /></ProtectedRoute>} />

          {/* <Route path="/students/:id/edit" element={<ProtectedRoute auth={auth}><StudentForm mode="edit" /></ProtectedRoute>} /> */}
          <Route path="/students/:id/edit" element={<ProtectedRoute auth={auth} allowedRoles={["editor", "admin"]}><StudentForm mode="edit" /></ProtectedRoute>} />
          {/* for admin only */}
          <Route path="/admin/users" element={<ProtectedRoute auth={auth} allowedRoles={["admin"]}><UserManagement auth={auth} /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to={auth ? "/" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

function ProtectedRoute({ auth, allowedRoles = [], children }) {
  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default App;
