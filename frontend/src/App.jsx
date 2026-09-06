import { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router";

import { AuthProvider } from "./auth/AuthContext.jsx";
import { useAuth } from "./auth/useAuth.js";
import RequireAuth from "./auth/RequireAuth.jsx";
import Login from "./pages/Login.jsx";
import MemberForm from "./pages/MemberForm.jsx";
import MembersList from "./pages/MembersList.jsx";
import NewUser from "./pages/NewUser.jsx";

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/health/")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setStatus(data.status))
      .catch((err) => setError(err.message));
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-white">LocalGym</h1>
      <p className="mt-2 text-lg text-zinc-300">Hola, {user?.username}</p>
      {error ? (
        <p className="mt-2 text-lg text-red-400">API: error - {error}</p>
      ) : (
        <p className="mt-2 text-lg text-emerald-400">API: {status ?? "cargando..."}</p>
      )}
      {user?.is_superuser ? (
        <Link to="/users/new" className="mt-4 text-sm text-emerald-400 underline">
          Nuevo usuario
        </Link>
      ) : null}
      <Link to="/members" className="mt-4 text-sm text-emerald-400 underline">
        Socios
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 rounded bg-zinc-800 px-3 py-2 text-sm font-medium text-white"
      >
        Cerrar sesión
      </button>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/users/new"
          element={
            <RequireAuth>
              <NewUser />
            </RequireAuth>
          }
        />
        <Route
          path="/members"
          element={
            <RequireAuth>
              <MembersList />
            </RequireAuth>
          }
        />
        <Route
          path="/members/new"
          element={
            <RequireAuth>
              <MemberForm />
            </RequireAuth>
          }
        />
        <Route
          path="/members/:id/edit"
          element={
            <RequireAuth>
              <MemberForm />
            </RequireAuth>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
