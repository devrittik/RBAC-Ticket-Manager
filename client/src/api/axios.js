import axios from 'axios';

const configuredServerUrl =
  process.env.REACT_APP_SERVER_URL || process.env.SERVER_URL || '';

const normalizedServerUrl = configuredServerUrl.replace(/\/+$/, '');
const baseURL = normalizedServerUrl ? `${normalizedServerUrl}/api/v1` : '/api/v1';

const api = axios.create({ baseURL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
