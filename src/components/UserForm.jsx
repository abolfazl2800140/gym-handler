import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { userManager } from '../services/auth';
import '../styles/UserForm.css';

function UserForm({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSuperAdmin = userManager.isSuperAdmin();
  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        role: user.role || 'admin'
      });
    }
  }, [user]);

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
    setLoading(true);

    try {
      let response;
      
      if (isEditing) {
        // ویرایش
        const updateData = { ...formData };
        delete updateData.password; // رمز عبور در ویرایش نمی‌فرستیم
        response = await usersAPI.update(user.id, updateData);
      } else {
        // اضافه کردن
        if (!formData.password) {
          setError('رمز عبور الزامی است');
          setLoading(false);
          return;
        }
        response = await usersAPI.create(formData);
      }

      if (response.success) {
        alert(isEditing ? 'ادمین با موفقیت ویرایش شد' : 'ادمین با موفقیت اضافه شد');
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
          <h2>{isEditing ? 'ویرایش ادمین' : 'افزودن ادمین جدید'}</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">نام</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="نام"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">نام خانوادگی</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="نام خانوادگی"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">نام کاربری *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="نام کاربری"
                required
                disabled={isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">ایمیل *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          {!isEditing && (
            <div className="form-group">
              <label htmlFor="password">رمز عبور *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="حداقل 6 کاراکتر"
                required={!isEditing}
                minLength={6}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">شماره تماس</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="09123456789"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">نقش</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={!isSuperAdmin}
              >
                <option value="admin">مدیر</option>
                <option value="super_admin">مدیر ارشد</option>
                <option value="user">کاربر</option>
              </select>
              {!isSuperAdmin && (
                <small className="form-hint">فقط مدیر ارشد می‌تواند نقش را تغییر دهد</small>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              انصراف
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'در حال ذخیره...' : (isEditing ? 'ذخیره تغییرات' : 'افزودن ادمین')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserForm;
