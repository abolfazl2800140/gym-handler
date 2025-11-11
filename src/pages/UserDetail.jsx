import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaEdit, FaLock, FaBan, FaTrash, FaCheck, FaTimes, 
  FaKey, FaUserTie, FaUsers, FaClipboardList, FaChartBar, FaScroll,
  FaEnvelope, FaPhone, FaCalendar, FaSync, FaClock, FaCalendarAlt, 
  FaHistory, FaPlus, FaSignInAlt, FaSignOutAlt, FaEye
} from 'react-icons/fa';
import { usersAPI } from '../services/api';
import { userManager } from '../services/auth';
import UserForm from '../components/UserForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/UserDetail.css';

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const isSuperAdmin = userManager.isSuperAdmin();

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userRes, statsRes, activitiesRes] = await Promise.all([
        usersAPI.getById(id),
        usersAPI.getStats(id),
        usersAPI.getActivities(id, 20)
      ]);

      if (userRes.success) setUser(userRes.data);
      if (statsRes.success) setStats(statsRes.stats);
      if (activitiesRes.success) setActivities(activitiesRes.activities);
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('خطا در دریافت اطلاعات');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید این حساب را ${user.is_active ? 'غیرفعال' : 'فعال'} کنید؟`)) {
      return;
    }

    try {
      const response = await usersAPI.toggleStatus(id);
      if (response.success) {
        alert(response.message);
        fetchUserData();
      }
    } catch (error) {
      alert(error.message || 'خطا در تغییر وضعیت');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await usersAPI.delete(id);
      if (response.success) {
        alert('ادمین با موفقیت حذف شد');
        navigate('/users');
      }
    } catch (error) {
      alert(error.message || 'خطا در حذف ادمین');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      super_admin: { text: 'مدیر ارشد', icon: <FaKey />, class: 'super-admin' },
      admin: { text: 'مدیر', icon: <FaUserTie />, class: 'admin' },
      user: { text: 'کاربر', icon: <FaUsers />, class: 'user' }
    };
    return badges[role] || badges.user;
  };

  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user.username[0].toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} روز پیش`;
    if (hours > 0) return `${hours} ساعت پیش`;
    if (minutes > 0) return `${minutes} دقیقه پیش`;
    return 'همین الان';
  };

  const getActionText = (action) => {
    const actions = {
      CREATE: 'ایجاد',
      UPDATE: 'ویرایش',
      DELETE: 'حذف',
      LOGIN: 'ورود',
      LOGOUT: 'خروج',
      VIEW: 'مشاهده'
    };
    return actions[action] || action;
  };

  const getEntityText = (entityType) => {
    const entities = {
      members: 'عضو',
      transactions: 'تراکنش',
      attendance: 'حضور و غیاب',
      users: 'کاربر'
    };
    return entities[entityType] || entityType;
  };

  if (loading) {
    return (
      <div className="user-detail-page">
        <div className="loading">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-detail-page">
        <div className="error">کاربر یافت نشد</div>
      </div>
    );
  }

  const badge = getRoleBadge(user.role);

  return (
    <div className="user-detail-page">
      {/* دکمه بازگشت */}
      <button onClick={() => navigate('/users')} className="back-button">
        <FaArrowLeft /> بازگشت به لیست
      </button>

      {/* هدر */}
      <div className="user-header">
        <div className="user-header-content">
          <div className="user-avatar-xl">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} />
            ) : (
              <span>{getInitials()}</span>
            )}
          </div>
          <div className="user-header-info">
            <h1>
              {user.first_name && user.last_name ? 
                `${user.first_name} ${user.last_name}` : 
                user.username}
            </h1>
            <p className="username">@{user.username}</p>
            <div className="badges">
              <span className={`role-badge ${badge.class}`}>
                {badge.icon} {badge.text}
              </span>
              <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                {user.is_active ? <><FaCheck /> فعال</> : <><FaTimes /> غیرفعال</>}
              </span>
            </div>
          </div>
        </div>
        
        {isSuperAdmin && (
          <div className="user-actions">
            <button onClick={() => setShowEditForm(true)} className="btn-action edit">
              <FaEdit /> ویرایش
            </button>
            <button onClick={() => setShowPasswordForm(true)} className="btn-action password">
              <FaLock /> تغییر رمز
            </button>
            <button onClick={handleToggleStatus} className="btn-action toggle">
              {user.is_active ? <><FaBan /> غیرفعال کردن</> : <><FaCheck /> فعال کردن</>}
            </button>
            <button onClick={() => setShowDeleteDialog(true)} className="btn-action delete">
              <FaTrash /> حذف
            </button>
          </div>
        )}
      </div>

      {/* تب‌ها */}
      <div className="tabs">
        <button 
          className={activeTab === 'info' ? 'active' : ''}
          onClick={() => setActiveTab('info')}
        >
          <FaClipboardList /> اطلاعات
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          <FaChartBar /> آمار
        </button>
        <button 
          className={activeTab === 'activities' ? 'active' : ''}
          onClick={() => setActiveTab('activities')}
        >
          <FaScroll /> فعالیت‌ها
        </button>
      </div>

      {/* محتوای تب‌ها */}
      <div className="tab-content">
        {/* تب اطلاعات */}
        {activeTab === 'info' && (
          <div className="info-grid">
            <div className="info-card">
              <div className="info-label"><FaEnvelope /> ایمیل</div>
              <div className="info-value">{user.email}</div>
            </div>
            <div className="info-card">
              <div className="info-label"><FaPhone /> شماره تماس</div>
              <div className="info-value">{user.phone || '-'}</div>
            </div>
            <div className="info-card">
              <div className="info-label"><FaCalendar /> تاریخ عضویت</div>
              <div className="info-value">{formatDate(user.created_at)}</div>
            </div>
            <div className="info-card">
              <div className="info-label"><FaSync /> آخرین به‌روزرسانی</div>
              <div className="info-value">{formatDate(user.updated_at)}</div>
            </div>
          </div>
        )}

        {/* تب آمار */}
        {activeTab === 'stats' && stats && (
          <div className="stats-container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><FaChartBar /></div>
                <div className="stat-value">{stats.totalActivities}</div>
                <div className="stat-label">کل فعالیت‌ها</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><FaClock /></div>
                <div className="stat-value">{stats.recentActivities}</div>
                <div className="stat-label">24 ساعت اخیر</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><FaCalendarAlt /></div>
                <div className="stat-value">{stats.weekActivities}</div>
                <div className="stat-label">7 روز اخیر</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><FaHistory /></div>
                <div className="stat-value">{getTimeAgo(stats.lastActivity)}</div>
                <div className="stat-label">آخرین فعالیت</div>
              </div>
            </div>

            {stats.actionStats.length > 0 && (
              <div className="action-stats">
                <h3>آمار بر اساس نوع عملیات</h3>
                <div className="action-stats-list">
                  {stats.actionStats.map((stat, index) => (
                    <div key={index} className="action-stat-item">
                      <span className="action-name">{getActionText(stat.action)}</span>
                      <span className="action-count">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* تب فعالیت‌ها */}
        {activeTab === 'activities' && (
          <div className="activities-container">
            {activities.length === 0 ? (
              <div className="empty-state">
                <p>هیچ فعالیتی ثبت نشده است</p>
              </div>
            ) : (
              <div className="activities-list">
                {activities.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.action === 'CREATE' && <FaPlus />}
                      {activity.action === 'UPDATE' && <FaEdit />}
                      {activity.action === 'DELETE' && <FaTrash />}
                      {activity.action === 'LOGIN' && <FaSignInAlt />}
                      {activity.action === 'LOGOUT' && <FaSignOutAlt />}
                      {activity.action === 'VIEW' && <FaEye />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">
                        {getActionText(activity.action)} {getEntityText(activity.entity_type)}
                        {activity.entity_id && ` #${activity.entity_id}`}
                      </div>
                      {activity.description && (
                        <div className="activity-description">{activity.description}</div>
                      )}
                      <div className="activity-meta">
                        <span>{getTimeAgo(activity.created_at)}</span>
                        {activity.ip_address && <span>IP: {activity.ip_address}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal ها */}
      {showEditForm && (
        <UserForm
          user={user}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchUserData();
          }}
        />
      )}

      {showPasswordForm && (
        <ChangePasswordForm
          user={user}
          onClose={() => setShowPasswordForm(false)}
          onSuccess={() => {
            setShowPasswordForm(false);
          }}
        />
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          title="حذف ادمین"
          message={`آیا مطمئن هستید که می‌خواهید ادمین "${user.username}" را حذف کنید؟`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}

export default UserDetail;
