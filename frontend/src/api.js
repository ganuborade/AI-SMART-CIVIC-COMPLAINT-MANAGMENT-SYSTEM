import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Interceptor: inject JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('civic_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor: catch 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect to preserve state during demo testing
      console.warn('API returned 401 Unauthorized');
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginApi = (email, password) => api.post('/auth/login', { email, password });
export const registerApi = (data) => api.post('/auth/register', data);
export const getMeApi = () => api.get('/auth/me');

// Complaints
export const getComplaintsApi = () => api.get('/complaints');
export const getMyComplaintsApi = () => api.get('/complaints/my');
export const getComplaintByIdApi = (id) => api.get(`/complaints/${id}`);
export const createComplaintMultipartApi = (formData) => api.post('/complaints', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const createComplaintJsonApi = (data) => api.post('/complaints', data);
export const addFeedbackApi = (id, rating, comments) => api.post(`/complaints/${id}/feedback`, { rating, comments });

// Admin
export const getAdminStatsApi = () => api.get('/admin/dashboard/stats');
export const assignComplaintApi = (id, data) => api.put(`/admin/complaints/${id}/assign`, data);
export const overrideAIApi = (id, data) => api.put(`/admin/complaints/${id}/override-ai`, data);
export const rejectComplaintApi = (id, reason) => api.put(`/admin/complaints/${id}/reject`, { reason });
export const getEmployeesApi = (departmentId) => api.get('/admin/employees', { params: { departmentId } });
export const getAllUsersApi = () => api.get('/admin/users');

// Departments
export const getDepartmentsApi = () => api.get('/departments');
export const getDepartmentStatsApi = () => api.get('/departments/stats');
export const createDepartmentApi = (data) => api.post('/departments', data);
export const updateDepartmentApi = (id, data) => api.put(`/departments/${id}`, data);

// Employee
export const getEmployeeComplaintsApi = () => api.get('/employee/complaints');
export const startWorkApi = (id) => api.put(`/employee/complaints/${id}/start`);
export const resolveComplaintMultipartApi = (id, formData) => api.put(`/employee/complaints/${id}/resolve`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Live AI
export const analyzeComplaintLiveApi = (data) => api.post('/ai/analyze-complaint', data);
export const analyzeImageLiveApi = (formData) => api.post('/ai/analyze-image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Notifications
export const getNotificationsApi = () => api.get('/notifications');
export const getUnreadCountApi = () => api.get('/notifications/unread-count');
export const markNotificationReadApi = (id) => api.put(`/notifications/${id}/read`);

export default api;
