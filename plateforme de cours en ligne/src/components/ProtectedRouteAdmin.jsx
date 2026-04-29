import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRouteAdmin = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole') || 'student';

  if (!isLoggedIn || !token || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRouteAdmin;
