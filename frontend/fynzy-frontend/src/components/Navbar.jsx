import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="dashboard-nav">
      <button 
        className={activeTab === 'dashboard' ? 'active' : ''}
        onClick={() => setActiveTab('dashboard')}
      >
        <i className="icon dashboard-icon"></i> Genel Bakış
      </button>
      <button 
        className={activeTab === 'transactions' ? 'active' : ''}
        onClick={() => setActiveTab('transactions')}
      >
        <i className="icon transactions-icon"></i> İşlemler
      </button>
      <button 
        className={activeTab === 'reports' ? 'active' : ''}
        onClick={() => setActiveTab('reports')}
      >
        <i className="icon reports-icon"></i> Raporlar
      </button>
      <button 
        className={activeTab === 'budget' ? 'active' : ''}
        onClick={() => setActiveTab('budget')}
      >
        <i className="icon budget-icon"></i> Bütçe
      </button>
    </nav>
  );
};

export default Navbar;