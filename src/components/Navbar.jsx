import { NavLink } from "react-router-dom";
import { authService, userManager } from "../services/auth";
import "./Sidebar.css";

function Sidebar() {
  const user = userManager.getUser();
  const isSuperAdmin = userManager.isSuperAdmin();

  const handleLogout = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
      authService.logout();
    }
  };

  return (
    <aside className="sidebar">
      {/* اطلاعات کاربر */}
      <div className="sidebar-user">
        <div className="user-avatar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>
        <div className="user-info">
          <div className="user-name">{user?.username}</div>
          <div className="user-role">
            {user?.role === 'super_admin' && '🔑 مدیر ارشد'}
            {user?.role === 'admin' && '👤 مدیر'}
            {user?.role === 'user' && '👥 کاربر'}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/users"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="icon">👤</span>
          <span>مدیریت ادمین‌ها</span>
        </NavLink>
        <NavLink
          to="/members"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="icon">👥</span>
          <span>اعضا</span>
        </NavLink>
        <NavLink
          to="/attendance"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="icon">📋</span>
          <span>حضور و غیاب</span>
        </NavLink>
        <NavLink
          to="/financial"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="icon">💰</span>
          <span>مالی</span>
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="icon">📊</span>
          <span>گزارشات</span>
        </NavLink>
        <NavLink
          to="/ai"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="icon">🤖</span>
          <span>دستیار هوشمند</span>
        </NavLink>
        
        {/* فقط برای Super Admin */}
        {isSuperAdmin && (
          <NavLink
            to="/activity-logs"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <span className="icon">📜</span>
            <span>لاگ فعالیت‌ها</span>
          </NavLink>
        )}
      </nav>

      {/* دکمه خروج */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          <span className="icon">🚪</span>
          <span>خروج</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
