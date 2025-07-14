import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AuthTopbar.css';

const AuthTopbar = () => {
  return (
    <div className="auth-topbar">
      <Link to="/" className="logo">Fynzy</Link>
    </div>
  );
};

export default AuthTopbar;