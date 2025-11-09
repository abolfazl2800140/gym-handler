import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
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
        <NavLink
          to="/activity-logs"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="icon">📊</span>
          <span>لاگ فعالیت‌ها</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
