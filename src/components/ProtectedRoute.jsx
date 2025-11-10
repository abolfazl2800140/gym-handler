import { Navigate } from 'react-router-dom';
import { authService, userManager } from '../services/auth';

/**
 * کامپوننت محافظت از Route ها
 * اگر کاربر لاگین نکرده باشد، به صفحه login هدایت می‌شود
 */
function ProtectedRoute({ children, requiredRole }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = userManager.getUser();

  // اگر لاگین نکرده، به صفحه login برو
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // اگر نقش خاصی لازم است، بررسی کن
  if (requiredRole) {
    // اگر آرایه‌ای از نقش‌ها باشد
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(user?.role)) {
        return <Navigate to="/members" replace />;
      }
    }
    // اگر یک نقش باشد
    else if (user?.role !== requiredRole) {
      return <Navigate to="/members" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
