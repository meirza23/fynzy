import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Topbar.css';

const Topbar = () => {
  
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div className="logo">Fynzy</div>
      <div className="buttons">
        <button className="login-btn" onClick={() => navigate('/login')}>Giriş Yap</button>
        <button className="register-btn" onClick={() => navigate('/register')}>Kayıt Ol</button>
      </div>
    </div>
  );
};

export default Topbar;