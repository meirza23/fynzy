import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthTopbar from '../components/AuthTopbar';
import '../styles/Register.css';
import api from '../api'; // API istekleri için

const Register = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    setError(''); // Hata mesajını temizle
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validasyon
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
      setError('Lütfen zorunlu alanları doldurun');
      setIsLoading(false);
      return;
    }
    
    if (userData.password !== userData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setIsLoading(false);
      return;
    }
    
    try {
      // Backend'e kayıt isteği gönder
      await api.post('/auth/register', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password
      });

      // Başarılı kayıt sonrası login sayfasına yönlendir
      navigate('/login');
    } catch (error) {
      // Hata durumunda
      setError(error.response?.data || 'Kayıt işlemi başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <AuthTopbar />
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h2>Hesap Oluştur</h2>
            <p>Finansal yolculuğuna başlamak için kayıt ol</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="name-group">
              <div className="input-group">
                <label htmlFor="firstName">Ad <span className="required">*</span></label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Adınız"
                  value={userData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="lastName">Soyad <span className="required">*</span></label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Soyadınız"
                  value={userData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="email">E-posta <span className="required">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="ornek@mail.com"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="phone">Telefon Numarası</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="(555) 123-4567"
                value={userData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="password-group">
              <div className="input-group">
                <label htmlFor="password">Şifre <span className="required">*</span></label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={userData.password}
                  onChange={handleChange}
                  required
                />
                <small className="password-hint">En az 6 karakter</small>
              </div>
              
              <div className="input-group">
                <label htmlFor="confirmPassword">Şifreyi Onayla <span className="required">*</span></label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={userData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
            </button>
          </form>
          
          <div className="login-link">
            Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;