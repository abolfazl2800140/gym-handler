import { useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { userManager } from "../services/auth";
import { useAuth } from "../contexts/AuthContext";
import { FaUserShield, FaUser, FaUsers, FaClipboardList, FaMoneyBillWave, FaChartBar, FaRobot, FaScroll, FaDoorOpen, FaKey, FaUserTie, FaBars, FaTimes, FaStar, FaShoppingCart, FaBoxOpen, FaUtensils } from "react-icons/fa";
import ConfirmDialog from "./ConfirmDialog";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = userManager.getUser();
  const isSuperAdmin = userManager.isSuperAdmin();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isChef = user?.role === 'chef';
  const isMember = user?.role === 'member';
  const isCoach = isMember && user?.memberType === 'مربی';
  const isAthlete = isMember && user?.memberType === 'ورزشکار';
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setShowLogoutDialog(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* دکمه همبرگر - فقط در موبایل */}
      <button
        onClick={toggleMobileMenu}
        className="mobile-menu-button"
        aria-label="منو"
      >
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay - فقط در موبایل */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={closeMobileMenu}
        />
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
            <div className="user-name">
              {isMember ? `${user?.firstName} ${user?.lastName}` : user?.username}
            </div>
            <div className="user-role">
              {user?.role === 'super_admin' && <><FaKey className="inline ml-1" /> مدیر ارشد</>}
              {user?.role === 'admin' && <><FaUserTie className="inline ml-1" /> مدیر</>}
              {user?.role === 'chef' && <><FaUtensils className="inline ml-1" /> آشپز</>}
              {isCoach && <><FaUserTie className="inline ml-1" /> مربی</>}
              {isAthlete && <><FaUser className="inline ml-1" /> ورزشکار</>}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* منوی ادمین‌ها */}
          {isAdmin && (
            <>
              <NavLink
                to="/users"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMobileMenu}
              >
                <span className="icon"><FaUserShield /></span>
                <span>مدیریت ادمین‌ها</span>
              </NavLink>
              <NavLink
                to="/members"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMobileMenu}
              >
                <span className="icon"><FaUsers /></span>
                <span>اعضا</span>
              </NavLink>
              <NavLink
                to="/attendance"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMobileMenu}
              >
                <span className="icon"><FaClipboardList /></span>
                <span>حضور و غیاب</span>
              </NavLink>
              <NavLink
                to="/financial"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMobileMenu}
              >
                <span className="icon"><FaMoneyBillWave /></span>
                <span>مالی</span>
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMobileMenu}
              >
                <span className="icon"><FaChartBar /></span>
                <span>گزارشات</span>
              </NavLink>
              <NavLink
                to="/ai"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMobileMenu}
              >
                <span className="icon"><FaRobot /></span>
                <span>دستیار هوشمند</span>
              </NavLink>

              {/* فقط برای Super Admin */}
              {isSuperAdmin && (
                <>
                  <NavLink
                    to="/plans"
                    className={({ isActive }) => (isActive ? "active" : "")}
                    onClick={closeMobileMenu}
                  >
                    <span className="icon"><FaStar /></span>
                    <span>مدیریت پلن‌ها</span>
                  </NavLink>
                  <NavLink
                    to="/activity-logs"
                    className={({ isActive }) => (isActive ? "active" : "")}
                    onClick={closeMobileMenu}
                  >
                    <span className="icon"><FaScroll /></span>
                    <span>لاگ فعالیت‌ها</span>
                  </NavLink>
                </>
              )}
            </>
          )}

          {/* منوی آشپز */}
          {isChef && (
            <>
              <NavLink
                to="/buffet/dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMobileMenu}
              >
                <span className="icon"><FaChartBar /></span>
                <span>داشبورد بوفه</span>
              </NavLink>
              <NavLink
                to="/buffet/new-sale"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMobileMenu}
              >
                <span className="icon"><FaShoppingCart /></span>
                <span>فروش (POS)</span>
              </NavLink>
              <NavLink
                to="/buffet/products"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMobileMenu}
              >
                <span className="icon"><FaBoxOpen /></span>
                <span>محصولات</span>
              </NavLink>
              <NavLink
                to="/buffet/sales"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMobileMenu}
              >
                <span className="icon"><FaClipboardList /></span>
                <span>تاریخچه فروش</span>
              </NavLink>
              <NavLink
                to="/members"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMobileMenu}
              >
                <span className="icon"><FaUsers /></span>
                <span>اعضا</span>
              </NavLink>
            </>
          )}

          {/* منوی ورزشکار */}
          {isAthlete && (
            <NavLink
              to="/athlete-dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMobileMenu}
            >
              <span className="icon"><FaUser /></span>
              <span>داشبورد من</span>
            </NavLink>
          )}

          {/* منوی مربی */}
          {isCoach && (
            <NavLink
              to="/coach-dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMobileMenu}
            >
              <span className="icon"><FaUserTie /></span>
              <span>داشبورد من</span>
            </NavLink>
          )}
        </nav>

        {/* دکمه خروج */}
        <div className="sidebar-footer">
          <button onClick={handleLogoutClick} className="logout-button">
            <span className="icon"><FaDoorOpen /></span>
            <span>خروج</span>
          </button>
        </div>
      </aside >

      {/* دیالوگ تایید خروج - با استفاده از Portal */}
      {
        showLogoutDialog && createPortal(
          <ConfirmDialog
            title="خروج از حساب کاربری"
            message="آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟"
            confirmText="بله، خارج شو"
            cancelText="انصراف"
            type="warning"
            onConfirm={handleConfirmLogout}
            onCancel={handleCancelLogout}
          />,
          document.body
        )
      }
    </>
  );
}

export default Sidebar;
