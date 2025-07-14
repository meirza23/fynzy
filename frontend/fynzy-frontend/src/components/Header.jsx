import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, balance }) => {
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="home-header">
      <div className="header-left">
        <div className="logo">Fynzy</div>
        <div className="welcome-message">
          Hoş geldin, <span>{user?.firstName}</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          <div className="balance">Bakiye: {formatCurrency(balance)}</div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Çıkış Yap
        </button>
      </div>
    </header>
  );
};

export default Header;