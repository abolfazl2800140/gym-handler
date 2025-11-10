// Authentication Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'gym_auth_token';
const USER_KEY = 'gym_user_data';

/**
 * مدیریت Token در localStorage
 */
export const tokenManager = {
  // ذخیره token
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // دریافت token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // حذف token
  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // بررسی وجود token
  hasToken: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

/**
 * مدیریت اطلاعات کاربر در localStorage
 */
export const userManager = {
  // ذخیره اطلاعات کاربر
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // دریافت اطلاعات کاربر
  getUser: () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // حذف اطلاعات کاربر
  removeUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  // بررسی نقش کاربر
  hasRole: (role) => {
    const user = userManager.getUser();
    return user?.role === role;
  },

  // بررسی اینکه کاربر super_admin است
  isSuperAdmin: () => {
    const user = userManager.getUser();
    return user?.role === 'super_admin';
  },

  // بررسی اینکه کاربر admin یا super_admin است
  isAdmin: () => {
    const user = userManager.getUser();
    return user?.role === 'admin' || user?.role === 'super_admin';
  },
};

/**
 * Helper function برای API calls با احراز هویت
 */
const authApiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenManager.getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // اگر توکن نامعتبر است، کاربر را logout کن
      if (response.status === 401 || response.status === 403) {
        authService.logout();
      }
      throw new Error(data.error || 'خطایی رخ داد');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * سرویس احراز هویت
 */
export const authService = {
  /**
   * ثبت‌نام کاربر جدید
   */
  register: async (userData) => {
    const response = await authApiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.token) {
      tokenManager.setToken(response.token);
      userManager.setUser(response.user);
    }

    return response;
  },

  /**
   * ورود کاربر
   */
  login: async (credentials) => {
    const response = await authApiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.token) {
      tokenManager.setToken(response.token);
      userManager.setUser(response.user);
    }

    return response;
  },

  /**
   * خروج کاربر
   */
  logout: () => {
    tokenManager.removeToken();
    userManager.removeUser();
    window.location.href = '/login';
  },

  /**
   * دریافت اطلاعات کاربر جاری از سرور
   */
  getCurrentUser: async () => {
    try {
      const response = await authApiCall('/auth/me');
      if (response.success && response.user) {
        userManager.setUser(response.user);
        return response.user;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * بررسی اینکه کاربر لاگین کرده است
   */
  isAuthenticated: () => {
    return tokenManager.hasToken() && userManager.getUser() !== null;
  },

  /**
   * دریافت اطلاعات کاربر از localStorage
   */
  getUser: () => {
    return userManager.getUser();
  },
};

/**
 * Helper برای اضافه کردن token به API calls
 */
export const getAuthHeaders = () => {
  const token = tokenManager.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default authService;
