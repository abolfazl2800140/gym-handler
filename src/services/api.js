import {
  transformMemberFromAPI,
  transformMemberToAPI,
  transformTransactionFromAPI,
  transformTransactionToAPI,
  transformAttendanceFromAPI,
  transformAttendanceToAPI,
} from '../utils/dataTransform';
import { getAuthHeaders } from './auth';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(), // اضافه کردن token به همه request ها
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Members API
export const membersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiCall(`/members${queryString ? `?${queryString}` : ''}`);
    return {
      ...response,
      data: response.data.map(transformMemberFromAPI),
    };
  },

  getById: async (id) => {
    const response = await apiCall(`/members/${id}`);
    return {
      ...response,
      data: transformMemberFromAPI(response.data),
    };
  },

  create: (memberData) => apiCall('/members', {
    method: 'POST',
    body: JSON.stringify(transformMemberToAPI(memberData)),
  }),

  update: (id, memberData) => apiCall(`/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(transformMemberToAPI(memberData)),
  }),

  delete: (id) => apiCall(`/members/${id}`, {
    method: 'DELETE',
  }),

  getStats: () => apiCall('/members/stats/summary'),
};

// Transactions API
export const transactionsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiCall(`/transactions${queryString ? `?${queryString}` : ''}`);
    return {
      ...response,
      data: response.data.map(transformTransactionFromAPI),
    };
  },

  getById: async (id) => {
    const response = await apiCall(`/transactions/${id}`);
    return {
      ...response,
      data: transformTransactionFromAPI(response.data),
    };
  },

  create: (transactionData) => apiCall('/transactions', {
    method: 'POST',
    body: JSON.stringify(transformTransactionToAPI(transactionData)),
  }),

  update: (id, transactionData) => apiCall(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(transformTransactionToAPI(transactionData)),
  }),

  delete: (id) => apiCall(`/transactions/${id}`, {
    method: 'DELETE',
  }),

  getStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/transactions/stats/summary${queryString ? `?${queryString}` : ''}`);
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiCall(`/attendance${queryString ? `?${queryString}` : ''}`);
    return {
      ...response,
      data: response.data.map(transformAttendanceFromAPI),
    };
  },

  getByDate: async (date) => {
    const response = await apiCall(`/attendance/date/${date}`);
    return {
      ...response,
      data: transformAttendanceFromAPI(response.data),
    };
  },

  save: (attendanceData) => apiCall('/attendance', {
    method: 'POST',
    body: JSON.stringify(transformAttendanceToAPI(attendanceData)),
  }),

  delete: (date) => apiCall(`/attendance/date/${date}`, {
    method: 'DELETE',
  }),

  getStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/stats/summary${queryString ? `?${queryString}` : ''}`);
  },

  getMemberReport: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/attendance/stats/members${queryString ? `?${queryString}` : ''}`);
  },
};

// Reports API
export const reportsAPI = {
  getDashboard: () => apiCall('/reports/dashboard'),

  getMonthlyFinancial: (year, month) =>
    apiCall(`/reports/financial/monthly?year=${year}&month=${month}`),

  getMemberGrowth: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/reports/members/growth${queryString ? `?${queryString}` : ''}`);
  },

  getComprehensive: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/reports/comprehensive${queryString ? `?${queryString}` : ''}`);
  },
};

// AI API
export const aiAPI = {
  ask: (question) => apiCall('/ai/ask', {
    method: 'POST',
    body: JSON.stringify({ question }),
  }),

  getSuggestions: () => apiCall('/ai/suggestions'),
};

// Activity Logs API
export const activityLogsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/activity-logs${queryString ? `?${queryString}` : ''}`);
  },

  getStats: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/activity-logs/stats${queryString ? `?${queryString}` : ''}`);
  },

  clearOldLogs: (days = 90) => apiCall('/activity-logs/clear', {
    method: 'DELETE',
    body: JSON.stringify({ days }),
  }),
};

// Users API
export const usersAPI = {
  getAll: () => apiCall('/users'),
  
  getById: (id) => apiCall(`/users/${id}`),
  
  create: (userData) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  update: (id, userData) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  delete: (id) => apiCall(`/users/${id}`, {
    method: 'DELETE',
  }),
  
  changePassword: (id, passwordData) => apiCall(`/users/${id}/change-password`, {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  }),
  
  toggleStatus: (id) => apiCall(`/users/${id}/toggle-status`, {
    method: 'PUT',
  }),
  
  getStats: (id) => apiCall(`/users/${id}/stats`),
  
  getActivities: (id, limit = 20) => apiCall(`/users/${id}/activities?limit=${limit}`),
};

// Health check
export const healthCheck = () => apiCall('/health');
