import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import {
  clearStoredAuth,
  getCurrentUser,
  getStoredAuth,
  persistAuthState
} from "./services/api.js";
import AccountSettings from "./pages/AccountSettings.jsx";
import InviteCodeManagement from "./pages/InviteCodeManagement.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import StudentDetail from "./pages/StudentDetail.jsx";
import StudentForm from "./pages/StudentForm.jsx";
import StudentList from "./pages/StudentList.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import navIcon from "./public/studentdirectory.png";

function App() {
  const [auth, setAuth] = useState(getStoredAuth);

  useEffect(() => {
    const refreshAuth = async () => {
      if (!auth?.token) return;

      try {
        const currentUser = await getCurrentUser();
        setAuth((current) => {
          const nextAuth = { ...current, ...currentUser };
          persistAuthState(nextAuth);
          return nextAuth;
        });
      } catch {
        clearStoredAuth();
        setAuth(null);
      }
    };

    refreshAuth();
  }, []);

  const role = auth?.role;
  const isSuperadmin = role === "superadmin";
  const canCreateStudent = role === "admin" || isSuperadmin;

  const handleLogout = () => {
    clearStoredAuth();
    setAuth(null);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="Student Directory home">
          <img src={navIcon} alt="" className="brand-icon" />
          <span>Student Directory</span>
        </NavLink>
        <nav className="main-nav" aria-label="Primary navigation">
          {auth ? (
            <>
              <NavLink to="/" end>
                Profiles
              </NavLink>
              {canCreateStudent && <NavLink to="/students/new">Add student</NavLink>}
              {auth.id && auth.id !== "env-admin" && <NavLink to="/account">Account</NavLink>}
              {isSuperadmin && <NavLink to="/admin/users">Users</NavLink>}
              {isSuperadmin && <NavLink to="/admin/invitation-codes">Invites</NavLink>}
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </>
          )}

          {auth ? (
            <button type="button" className="nav-button" onClick={handleLogout}>
              Logout {auth.fullName || auth.username}
            </button>
          ) : null}
        </nav>
      </header>

      {auth?.profileStatus === "pending" && (
        <section className="page-section pending-banner">
          <p className="eyebrow">Profile pending</p>
          <h2>Your profile is waiting for administrator approval.</h2>
          <p>You can still sign in and update your own profile while it is pending.</p>
        </section>
      )}

      <main>
        <Routes>
          <Route path="/login" element={auth ? <Navigate to="/" replace /> : <Login onLogin={setAuth} />} />
          <Route path="/signup" element={auth ? <Navigate to="/" replace /> : <Signup onSignup={setAuth} />} />
          <Route path="/" element={<ProtectedRoute auth={auth}><StudentList auth={auth} /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute auth={auth}><StudentDetail auth={auth} /></ProtectedRoute>} />
          <Route
            path="/students/new"
            element={<ProtectedRoute auth={auth} allowedRoles={["admin", "superadmin"]}><StudentForm /></ProtectedRoute>}
          />
          <Route
            path="/students/:id/edit"
            element={<ProtectedRoute auth={auth}><StudentForm mode="edit" auth={auth} /></ProtectedRoute>}
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute auth={auth}>
                {!auth?.id || auth.id === "env-admin" ? (
                  <Navigate to="/" replace />
                ) : (
                  <AccountSettings auth={auth} onAuthUpdate={setAuth} />
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute auth={auth} allowedRoles={["superadmin"]}><UserManagement auth={auth} /></ProtectedRoute>}
          />
          <Route
            path="/admin/invitation-codes"
            element={
              <ProtectedRoute auth={auth} allowedRoles={["superadmin"]}>
                <InviteCodeManagement auth={auth} />
              </ProtectedRoute>
            }
          />
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
