import axios from 'axios';

// Axios instance oluştur
const api = axios.create({
  baseURL: 'http://localhost:5082/api',
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
      
      // Backend'den özel hata mesajı varsa onu göster
      const errorMessage = error.response.data?.message 
        || error.response.data
        || 'Beklenmeyen bir hata oluştu';
      
      return Promise.reject(errorMessage);
    }
    return Promise.reject('Ağ hatası oluştu');
  }
);

export default api;