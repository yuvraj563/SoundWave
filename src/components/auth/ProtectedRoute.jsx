import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import FullScreenLoader from '../ui/FullScreenLoader'

/**
 * ProtectedRoute
 *
 * Wraps any route that requires authentication.
 *
 * Behaviour:
 *  - While the initial JWT check (GET /api/auth/me) is running → show FullScreenLoader
 *  - If user is NOT authenticated → redirect to /login, preserving the
 *    attempted URL in location.state.from so Login can redirect back after success.
 *  - If user IS authenticated → render children normally.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Still verifying stored token — wait before making a routing decision
  if (isLoading) {
    return <FullScreenLoader />
  }

  // Not logged in — send to /login and remember where they were headed
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Authenticated — render the requested page
  return children
}

export default ProtectedRoute
