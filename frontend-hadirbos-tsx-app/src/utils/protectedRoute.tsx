import { Outlet, useNavigate } from "react-router";
import { getCurrentUser } from "../services/authServices";
import { useEffect } from "react";

type ProtectedRouteProps = {
  allowedRoles?: string[];
  children?: React.ReactNode;
};

const ProtectedRoute = ({
  allowedRoles = [],
  children,
}: ProtectedRouteProps) => {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const isAllowed =
    user && (allowedRoles.length === 0 || allowedRoles.includes(user.role));

  useEffect(() => {
    if (!isAllowed) {
      // Kembali ke halaman sebelumnya
      navigate(-1);
    }
  }, [isAllowed, navigate]);

  if (!isAllowed) {
    // Return null sementara navigasi diproses
    return null;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;