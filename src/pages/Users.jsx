import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaKey, FaUserTie, FaUsers, FaEdit, FaLock, FaTrash, FaPlus } from 'react-icons/fa';
import { usersAPI } from '../services/api';
import { userManager } from '../services/auth';
import notification from '../services/notification';
import UserForm from '../components/UserForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/Users.css';

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  const currentUser = userManager.getUser();
  const isSuperAdmin = userManager.isSuperAdmin();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      notification.error('خطا در دریافت لیست ادمین‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setShowPasswordForm(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await usersAPI.delete(userToDelete.id);
      if (response.success) {
        notification.success('ادمین با موفقیت حذف شد');
        fetchUsers();
      }
    } catch (error) {
      notification.error(error.message || 'خطا در حذف ادمین');
    } finally {
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setShowPasswordForm(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const getRoleBadge = (role) => {
    const badges = {
      super_admin: { text: 'مدیر ارشد', icon: <FaKey />, class: 'super-admin' },
      admin: { text: 'مدیر', icon: <FaUserTie />, class: 'admin' },
      user: { text: 'کاربر', icon: <FaUsers />, class: 'user' }
    };
    return badges[role] || badges.user;
  };

  const getInitials = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user.username[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1>مدیریت ادمین‌ها</h1>
          <p>مشاهده و مدیریت ادمین‌های سیستم</p>
        </div>
        {isSuperAdmin && (
          <button onClick={handleAddUser} className="btn-primary">
            <FaPlus />
            افزودن ادمین
          </button>
        )}
      </div>

      <div className="users-grid">
        {users.map(user => {
          const badge = getRoleBadge(user.role);
          const isCurrentUser = user.id === currentUser.id;

          return (
            <div key={user.id} className="user-card" onClick={() => navigate(`/users/${user.id}`)} style={{ cursor: 'pointer' }}>
              <div className="user-card-header">
                <div className="user-avatar-large">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} />
                  ) : (
                    <span>{getInitials(user)}</span>
                  )}
                </div>
                <span className={`role-badge ${badge.class}`}>
                  {badge.icon} {badge.text}
                </span>
              </div>

              <div className="user-card-body">
                <h3>{user.first_name && user.last_name ? 
                  `${user.first_name} ${user.last_name}` : 
                  user.username}
                </h3>
                <div className="user-info-item">
                  <span className="label">شناسه:</span>
                  <span className="value">{user.id}</span>
                </div>
                <div className="user-info-item">
                  <span className="label">نام کاربری:</span>
                  <span className="value">{user.username}</span>
                </div>
                <div className="user-info-item">
                  <span className="label">ایمیل:</span>
                  <span className="value">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="user-info-item">
                    <span className="label">تلفن:</span>
                    <span className="value">{user.phone}</span>
                  </div>
                )}
              </div>

              <div className="user-card-footer">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditUser(user);
                  }}
                  className="btn-edit"
                  title="ویرایش"
                >
                  <FaEdit /> ویرایش
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangePassword(user);
                  }}
                  className="btn-password"
                  title="تغییر رمز عبور"
                >
                  <FaLock /> رمز عبور
                </button>
                {isSuperAdmin && !isCurrentUser && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(user);
                    }}
                    className="btn-delete"
                    title="حذف"
                  >
                    <FaTrash /> حذف
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <UserForm
          user={selectedUser}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {showPasswordForm && (
        <ChangePasswordForm
          user={selectedUser}
          onClose={() => setShowPasswordForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          title="حذف ادمین"
          message={`آیا مطمئن هستید که می‌خواهید ادمین "${userToDelete?.username}" را حذف کنید؟`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteDialog(false);
            setUserToDelete(null);
          }}
        />
      )}
    </div>
  );
}

export default Users;
