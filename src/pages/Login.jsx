import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'member'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // پاک کردن خطا هنگام تایپ
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData, loginType);

      if (response.success) {
        // هدایت به صفحه مناسب
        if (loginType === 'admin') {
          // بررسی نوع ادمین
          if (response.user.role === 'chef') {
            navigate('/buffet/dashboard');
          } else {
            navigate('/members');
          }
        } else {
          // ورود اعضا (ورزشکار/مربی)
          if (response.user.memberType === 'مربی') {
            navigate('/coach-dashboard');
          } else {
            navigate('/athlete-dashboard');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'خطا در ورود به سیستم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-icon">
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
          <h1>ورود به سیستم</h1>
          <p>سیستم مدیریت باشگاه</p>

          {/* انتخاب نوع ورود */}
          <div className="login-type-selector">
            <button
              type="button"
              className={`type-btn ${loginType === 'admin' ? 'active' : ''}`}
              onClick={() => setLoginType('admin')}
            >
              ورود ادمین
            </button>
            <button
              type="button"
              className={`type-btn ${loginType === 'member' ? 'active' : ''}`}
              onClick={() => setLoginType('member')}
            >
              ورود اعضا
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
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
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">نام کاربری</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="نام کاربری خود را وارد کنید"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">رمز عبور</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="رمز عبور خود را وارد کنید"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                در حال ورود...
              </>
            ) : (
              'ورود'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
