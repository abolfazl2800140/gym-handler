import { useState } from 'react';
import { usersAPI } from '../services/api';
import { userManager } from '../services/auth';
import '../styles/UserForm.css';

function ChangePasswordForm({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentUser = userManager.getUser();
  const isOwnPassword = currentUser.id === user.id;
  const isSuperAdmin = userManager.isSuperAdmin();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // اعتبارسنجی
    if (formData.newPassword.length < 6) {
      setError('رمز عبور جدید باید حداقل 6 کاراکتر باشد');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('رمز عبور جدید و تکرار آن یکسان نیستند');
      return;
    }

    setLoading(true);

    try {
      const passwordData = {
        newPassword: formData.newPassword
      };

      // اگر کاربر خودش رمز رو تغییر میده، باید رمز فعلی رو بفرسته
      if (isOwnPassword) {
        if (!formData.currentPassword) {
          setError('رمز عبور فعلی الزامی است');
          setLoading(false);
          return;
        }
        passwordData.currentPassword = formData.currentPassword;
      }

      const response = await usersAPI.changePassword(user.id, passwordData);

      if (response.success) {
        alert('رمز عبور با موفقیت تغییر کرد');
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'خطایی رخ داد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>تغییر رمز عبور</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="user-info-box">
            <strong>کاربر:</strong> {user.username}
            {user.first_name && user.last_name && (
              <span> ({user.first_name} {user.last_name})</span>
            )}
          </div>

          {isOwnPassword && (
            <div className="form-group">
              <label htmlFor="currentPassword">رمز عبور فعلی *</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="رمز عبور فعلی خود را وارد کنید"
                required
                autoFocus
              />
            </div>
          )}

          {!isOwnPassword && isSuperAdmin && (
            <div className="info-message">
              شما به عنوان مدیر ارشد می‌توانید رمز عبور این کاربر را بدون نیاز به رمز فعلی تغییر دهید.
            </div>
          )}

          <div className="form-group">
            <label htmlFor="newPassword">رمز عبور جدید *</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="حداقل 6 کاراکتر"
              required
              minLength={6}
              autoFocus={!isOwnPassword}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">تکرار رمز عبور جدید *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="رمز عبور جدید را دوباره وارد کنید"
              required
              minLength={6}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              انصراف
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'در حال ذخیره...' : 'تغییر رمز عبور'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordForm;
