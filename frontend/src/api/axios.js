import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://hr-nexus-mocha.vercel.app/api',
  timeout: 15000,
});

// Har request mein token khud lag jata hai (pages ko headers banane ki zaroorat nahi)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token expire/invalid ho to session saaf karke login par bhej do (login/signup ke apne 401 chhod kar)
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/') && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default API;
