import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, error } = useSelector(state => state.auth)
  
  const hasCheckedAuth = useRef(false)
  
  const hasToken = localStorage.getItem('authToken')
  
  useEffect(() => {
    if (!loading.fetchUser && (isAuthenticated || error.fetchUser)) {
      hasCheckedAuth.current = true
    }
  }, [loading.fetchUser, isAuthenticated, error.fetchUser])

  const isCheckingAuth = loading.login || loading.fetchUser || 
    (hasToken && !isAuthenticated && !hasCheckedAuth.current)

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00167a]"></div>
      </div>
    )
  }

  if (!isAuthenticated && error.fetchUser && hasToken) {
    localStorage.removeItem('authToken')
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
