import axios from 'axios'

const envUrl = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = envUrl 
  ? (envUrl.endsWith('/') ? envUrl.slice(0,-1) : envUrl)
  : "http://localhost:8000/api/v1";

// Ensure /api/v1 is appended if missing from production URL
const finalApiUrl = (API_URL.includes('onrender.com') && !API_URL.includes('/api/v1'))
  ? `${API_URL}/api/v1`
  : API_URL;

/*
  This file only creates and configures the shared axios instance.
  All API functions live in their dedicated service files:

    services/authService.js          → login, signup, OTP, password reset
    services/studentProfileService.js → student profile + resume upload
    services/companyProfileService.js → company profile CRUD
    services/jobsService.js           → internal platform jobs (create, mine, update, delete)
    services/externalJobsService.js   → Adzuna external job search
    services/applicationService.js   → apply, get applications, update status
*/

const api = axios.create({
  baseURL: finalApiUrl,
  withCredentials: true
})

// Request Interceptor: auto-inject access token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response Interceptor: handle 401 and auto-refresh access token if expired
api.interceptors.response.use(
  // Success: unwrap the response data so callers receive the payload directly
  (response) => {
    return response.data
  },

  // Error: attempt a silent token refresh on 401, then retry original request
  async (error) => {
    /*
      originalRequest is the failed call (e.g. GET /jobs).
      We store it so that after getting a new token we can replay it
      seamlessly — the user never sees the failure.
    */
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/token/refresh') {
      originalRequest._retry = true
      try {
        console.log('Token expired — attempting silent refresh...');
        // use raw axios to skip this interceptor loop
        const response = await axios.post(API_URL + '/auth/token/refresh', {}, { withCredentials: true });
        const res = response.data;
        const { newAccessToken } = res;
        localStorage.setItem('token', newAccessToken)
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (e) {
        console.log('Refresh token failed — redirecting to login');
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    // Log all other API errors for debugging
    if (error.response) {
      console.error(`API Error [${error.response.status}]:`, error.response.data);
    }
    return Promise.reject(error);
  }
)

export default api;
