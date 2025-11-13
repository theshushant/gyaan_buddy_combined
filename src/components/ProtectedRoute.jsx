import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, error } = useSelector(state => state.auth)
  
  // Track if we've attempted to fetch user on mount
  const hasCheckedAuth = useRef(false)
  
  // Check if there's a token in localStorage
  const hasToken = localStorage.getItem('authToken')
  
  // Mark that we've checked auth once the fetchUser completes or fails
  useEffect(() => {
    if (!loading.fetchUser && (isAuthenticated || error.fetchUser)) {
      hasCheckedAuth.current = true
    }
  }, [loading.fetchUser, isAuthenticated, error.fetchUser])

  // Show loading state while checking authentication
  // Also show loading if we have a token but haven't completed the initial auth check yet
  const isCheckingAuth = loading.login || loading.fetchUser || 
    (hasToken && !isAuthenticated && !hasCheckedAuth.current)

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If auth check failed (error exists), clear the invalid token
  if (!isAuthenticated && error.fetchUser && hasToken) {
    // Clear invalid token
    localStorage.removeItem('authToken')
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
