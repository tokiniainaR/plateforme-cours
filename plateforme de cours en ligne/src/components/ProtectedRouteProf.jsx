import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRouteProf = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole') || 'student';

  if (!isLoggedIn || !token || userRole !== 'instructor') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRouteProf;
