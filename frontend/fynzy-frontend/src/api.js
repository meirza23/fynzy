import axios from 'axios';

// Axios instance oluştur
const api = axios.create({
  baseURL: 'http://localhost:5082/api', // Backend adresi
  headers: {
    'Content-Type': 'application/json'
  }
});

// Her istekten önce token'ı header'a ekle
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Hata yönetimi
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // 401 Unauthorized - Token süresi dolmuş veya geçersiz
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error.message);
  }
);

export default api;