import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../api/api";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiFetch("/api/user/get-user-details");
        if (res.success) setIsAuth(true);
        else setIsAuth(false);
      } catch {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-gray-500">Checking authentication...</p>
    </div>
  );
}
  return isAuth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;