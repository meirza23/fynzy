import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthTopbar from '../components/AuthTopbar';
import '../styles/Home.css';

const Main = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kullanıcı bilgilerini localStorage'dan al
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Kullanıcı bilgisi yoksa login sayfasına yönlendir
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="main-page">
      <header className="main-header">
        <div className="user-info">
          <h2>Hoş geldin, {user.firstName} {user.lastName}</h2>
          <p>{user.email}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Çıkış Yap
        </button>
      </header>
      
      <main className="main-content">
        <div className="dashboard">
          <h3>Finansal Özet</h3>
          {/* Buraya finansal veriler gelecek */}
        </div>
      </main>
    </div>
  );
};

export default Main;