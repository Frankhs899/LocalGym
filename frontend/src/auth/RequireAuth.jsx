import { Navigate, useLocation } from "react-router";

import { LoadingSkeleton } from "../components/index.js";
import { useAuth } from "./useAuth.js";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base px-4">
        <div className="w-full max-w-sm">
          <LoadingSkeleton lines={3} label="Cargando..." />
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
