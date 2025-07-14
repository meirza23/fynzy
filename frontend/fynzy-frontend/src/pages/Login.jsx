import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthTopbar from '../components/AuthTopbar';
import '../styles/Login.css';
import api from '../api'; // API istekleri için

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError(''); // Hata mesajını temizle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Temel validasyon
    if (!credentials.email || !credentials.password) {
      setError('Lütfen tüm alanları doldurun');
      setIsLoading(false);
      return;
    }
    
    try {
      // Backend'e giriş isteği gönder
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      // Token'ı ve kullanıcı bilgilerini sakla
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Ana sayfaya yönlendir
      navigate('/home');
    } catch (error) {
      // Hata durumunda
      setError(error.response?.data || 'Giriş işlemi başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <AuthTopbar />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Hesabına Giriş Yap</h2>
            <p>Finansal kontrolünü eline almak için giriş yap</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">E-posta</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="ornek@mail.com"
                value={credentials.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Şifre</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
          
          <div className="signup-link">
            Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;