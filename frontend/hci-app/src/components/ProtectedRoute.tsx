import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/context/auth";
import { FullPageLoader } from "@/components/ui";

export default function ProtectedRoute() {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
