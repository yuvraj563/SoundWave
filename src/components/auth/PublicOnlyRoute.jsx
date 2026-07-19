import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import FullScreenLoader from '../ui/FullScreenLoader'

/**
 * PublicOnlyRoute
 *
 * Wraps routes that should ONLY be accessible to unauthenticated users
 * (i.e. /login and /signup).
 *
 * Behaviour:
 *  - While the initial JWT check is running → show FullScreenLoader
 *  - If user IS authenticated → redirect to / (or back to the page they
 *    came from, stored in location.state.from by ProtectedRoute).
 *  - If user is NOT authenticated → render children (Login / Signup page).
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Still verifying stored token — wait before making a routing decision
  if (isLoading) {
    return <FullScreenLoader />
  }

  // Already logged in — send to home (or wherever they were going)
  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/'
    return <Navigate to={destination} replace />
  }

  // Not logged in — render the Login / Signup page
  return children
}

export default PublicOnlyRoute
