import axios from 'axios';

const getBaseUrl = () => {
  const customUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
  if (customUrl) {
    return customUrl.endsWith('/api') ? customUrl : `${customUrl}/api`;
  }
  return import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('userInfo')) {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
