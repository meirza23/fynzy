import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthTopbar from '../components/AuthTopbar';
import '../styles/Register.css';

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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
      setError('Lütfen zorunlu alanları doldurun');
      return;
    }
    
    if (userData.password !== userData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    // Frontend-only action - just navigate to home
    navigate('/home');
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
            
            <button type="submit" className="register-button">
              Kayıt Ol
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