import axios from 'axios'

/**
 * Axios instance for backend API calls.
 * Backend URL comes from VITE_API_URL.
 * Example:
 * VITE_API_URL=https://soundwave-2rx6.onrender.com
 */

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('soundwave_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Handle expired token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('soundwave_token')
      localStorage.removeItem('soundwave_user')
    }

    return Promise.reject(error)
  }
)

// ======================= AUTH API =======================

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),

  login: (data) => api.post('/auth/login', data),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data) =>
    api.put('/auth/update-profile', data),

  changePassword: (data) =>
    api.put('/auth/change-password', data),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data) =>
    api.post('/auth/reset-password', data),
}

export default api