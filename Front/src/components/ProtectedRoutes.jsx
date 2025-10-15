
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';

const ProtectedRoute = ({  redirectPath = '/' }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;