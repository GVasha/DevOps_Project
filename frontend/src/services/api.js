import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://insurance-backend-latest.onrender.com/api';
const FILE_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  deleteAccount: () => api.delete('/auth/account'),
};

// Upload API calls
export const uploadAPI = {
  uploadSingle: (formData) => {
    return api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMultiple: (formData) => {
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getFileInfo: (filename) => api.get(`/upload/file/${filename}`),
  deleteFile: (filename) => api.delete(`/upload/file/${filename}`),
};

// Assessment API calls
export const assessmentAPI = {
  analyzeImage: (formData) => {
    return api.post('/assessment/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getMyAssessments: () => api.get('/assessment/my-assessments'),
  getAssessment: (id) => api.get(`/assessment/assessment/${id}`),
  createClaim: (claimData) => api.post('/assessment/create-claim', claimData),
  getMyClaims: () => api.get('/assessment/my-claims'),
  getClaim: (id) => api.get(`/assessment/claim/${id}`),
};

// Health check
export const healthCheck = () => api.get('/health');

// Build absolute URL for files served from backend /uploads
export const getFileUrl = (relativeOrAbsolute) => {
  if (!relativeOrAbsolute) return '';
  
  const url = String(relativeOrAbsolute);
  
  // If already absolute, return as-is
  if (/^https?:\/\//i.test(url)) return url;
  
  // If starts with /uploads, prefix with API host
  if (url.startsWith('/uploads')) {
    return `${FILE_BASE_URL}${url}`;
  }
  
  // If it's just a filename without path, assume /uploads
  if (!url.includes('/') && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
    return `${FILE_BASE_URL}/uploads/${url}`;
  }
  
  // Otherwise return the URL as-is (might be relative)
  return url;
};

export default api;
