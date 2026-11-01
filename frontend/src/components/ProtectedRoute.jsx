import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { homePathFor } from '../lib/session';

// <ProtectedRoute>                      = koi bhi company user (superadmin nahi)
// <ProtectedRoute roles={['admin']}>    = sirf diye gaye roles
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Superadmin kisi company ka nahi hota; tenant pages backend par 403 dete hain
  const allowed = roles ? roles.includes(user.role) : user.role !== 'superadmin';
  if (!allowed) {
    return <Navigate to={homePathFor(user)} replace />;
  }

  return children;
}
