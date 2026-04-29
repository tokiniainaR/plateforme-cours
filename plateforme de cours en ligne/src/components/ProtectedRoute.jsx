import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('authToken');

  return isLoggedIn && token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;