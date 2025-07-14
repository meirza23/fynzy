// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../styles/Home.css';

// Chart.js bileşenlerini kaydet
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Home = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState({
    income: ['Maaş', 'Yatırım', 'Freelance', 'Diğer'],
    expense: ['Kira', 'Market', 'Ulaşım', 'Eğlence', 'Faturalar', 'Sağlık', 'Diğer']
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Kullanıcı bilgilerini localStorage'dan al
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Demo verileri yükle
      loadDemoData();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadDemoData = () => {
    // Demo işlemler
    const demoTransactions = [
      { id: 1, type: 'income', category: 'Maaş', amount: 12500, date: '2024-06-15', description: 'Aylık maaş' },
      { id: 2, type: 'expense', category: 'Kira', amount: 4500, date: '2024-06-10', description: 'Ev kirası' },
      { id: 3, type: 'expense', category: 'Market', amount: 1200, date: '2024-06-12', description: 'Haftalık market alışverişi' },
      { id: 4, type: 'income', category: 'Freelance', amount: 3500, date: '2024-06-05', description: 'Web tasarım projesi' },
      { id: 5, type: 'expense', category: 'Ulaşım', amount: 450, date: '2024-06-18', description: 'Aylık toplu taşıma' },
      { id: 6, type: 'expense', category: 'Faturalar', amount: 850, date: '2024-06-20', description: 'Elektrik ve su faturası' },
    ];
    
    setTransactions(demoTransactions);
    
    // Toplamları hesapla
    const totalIncome = demoTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = demoTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    setIncome(totalIncome);
    setExpense(totalExpense);
    setBalance(totalIncome - totalExpense);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: name === 'amount' ? Number(value) : value
    });
  };

  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    
    if (!newTransaction.category || !newTransaction.amount) {
      alert('Lütfen kategori ve tutar alanlarını doldurun');
      return;
    }
    
    const newId = transactions.length > 0 
      ? Math.max(...transactions.map(t => t.id)) + 1 
      : 1;
    
    const transaction = {
      id: newId,
      ...newTransaction
    };
    
    setTransactions([...transactions, transaction]);
    
    // Bakiyeyi güncelle
    if (newTransaction.type === 'income') {
      setIncome(income + newTransaction.amount);
      setBalance(balance + newTransaction.amount);
    } else {
      setExpense(expense + newTransaction.amount);
      setBalance(balance - newTransaction.amount);
    }
    
    // Formu sıfırla
    setNewTransaction({
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    
    alert('İşlem başarıyla eklendi!');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getChartData = () => {
    const labels = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
    
    // Demo veriler
    const incomeData = [10000, 12000, 11000, 13000, 12500, 16000];
    const expenseData = [8500, 9000, 9500, 11000, 10500, 7000];
    
    return {
      labels,
      datasets: [
        {
          label: 'Gelir',
          data: incomeData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Gider',
          data: expenseData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.3,
        },
      ],
    };
  };

  const getPieChartData = () => {
    // Kategori bazında giderleri hesapla
    const expenseByCategory = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (expenseByCategory[t.category]) {
          expenseByCategory[t.category] += t.amount;
        } else {
          expenseByCategory[t.category] = t.amount;
        }
      });
    
    const categories = Object.keys(expenseByCategory);
    const amounts = Object.values(expenseByCategory);
    
    // Renk paleti oluştur
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(199, 199, 199, 0.7)'
    ];
    
    return {
      labels: categories,
      datasets: [
        {
          label: 'Gider Dağılımı',
          data: amounts,
          backgroundColor: backgroundColors.slice(0, categories.length),
          borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  if (!user) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Finansal veriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Üst Navigasyon Çubuğu */}
      <header className="home-header">
        <div className="header-left">
          <div className="logo">Fynzy</div>
          <div className="welcome-message">
            Hoş geldin, <span>{user.firstName} {user.lastName}</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <div className="user-email">{user.email}</div>
            <div className="balance">Bakiye: {formatCurrency(balance)}</div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Çıkış Yap
          </button>
        </div>
      </header>

      {/* Ana İçerik Alanı */}
      <main className="home-content">
        {/* Navigasyon Menüsü */}
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

        {/* Gösterge Tablosu */}
        <section className={`dashboard-section ${activeTab === 'dashboard' ? 'active' : ''}`}>
          <div className="summary-cards">
            <div className="card income-card">
              <div className="card-title">Toplam Gelir</div>
              <div className="card-value">{formatCurrency(income)}</div>
              <div className="card-trend positive">+12% geçen aya göre</div>
            </div>
            
            <div className="card expense-card">
              <div className="card-title">Toplam Gider</div>
              <div className="card-value">{formatCurrency(expense)}</div>
              <div className="card-trend negative">-5% geçen aya göre</div>
            </div>
            
            <div className="card balance-card">
              <div className="card-title">Net Bakiye</div>
              <div className="card-value">{formatCurrency(balance)}</div>
              <div className="card-info">Son 30 gün</div>
            </div>
          </div>
          
          <div className="charts-container">
            <div className="chart-wrapper">
              <h3>Gelir-Gider Trendi</h3>
              <Line 
                data={getChartData()} 
                options={{ 
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false }
                  }
                }} 
              />
            </div>
            
            <div className="chart-wrapper">
              <h3>Gider Dağılımı</h3>
              <Pie 
                data={getPieChartData()} 
                options={{ 
                  responsive: true,
                  plugins: { legend: { position: 'bottom' } }
                }} 
              />
            </div>
          </div>
          
          <div className="recent-transactions">
            <h3>Son İşlemler</h3>
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Açıklama</th>
                  <th>Kategori</th>
                  <th>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map(transaction => (
                  <tr key={transaction.id} className={transaction.type}>
                    <td>{transaction.date}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.category}</td>
                    <td className={transaction.type}>
                      {transaction.type === 'income' ? '+' : '-'} 
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* İşlemler Sayfası */}
        <section className={`transactions-section ${activeTab === 'transactions' ? 'active' : ''}`}>
          <div className="transaction-form">
            <h3>Yeni İşlem Ekle</h3>
            <form onSubmit={handleSubmitTransaction}>
              <div className="form-group">
                <label>İşlem Türü</label>
                <div className="type-toggle">
                  <button 
                    type="button"
                    className={`toggle-btn ${newTransaction.type === 'income' ? 'active' : ''}`}
                    onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                  >
                    Gelir
                  </button>
                  <button 
                    type="button"
                    className={`toggle-btn ${newTransaction.type === 'expense' ? 'active' : ''}`}
                    onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                  >
                    Gider
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label>Kategori</label>
                <select 
                  name="category" 
                  value={newTransaction.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seçiniz</option>
                  {(newTransaction.type === 'income' ? categories.income : categories.expense).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Tutar (₺)</label>
                  <input 
                    type="number" 
                    name="amount" 
                    value={newTransaction.amount}
                    onChange={handleInputChange}
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Tarih</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={newTransaction.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Açıklama</label>
                <textarea 
                  name="description" 
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  placeholder="İşlem detayı..."
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn">
                İşlemi Kaydet
              </button>
            </form>
          </div>
          
          <div className="all-transactions">
            <h3>Tüm İşlemler</h3>
            <div className="filters">
              <select>
                <option>Tüm Kategoriler</option>
                {[...categories.income, ...categories.expense].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <div className="date-filter">
                <input type="date" />
                <span>-</span>
                <input type="date" />
                <button>Uygula</button>
              </div>
            </div>
            
            <div className="transactions-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Tarih</th>
                    <th>Tür</th>
                    <th>Kategori</th>
                    <th>Açıklama</th>
                    <th>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id} className={transaction.type}>
                      <td>{transaction.date}</td>
                      <td className="transaction-type">
                        {transaction.type === 'income' ? (
                          <span className="income-badge">Gelir</span>
                        ) : (
                          <span className="expense-badge">Gider</span>
                        )}
                      </td>
                      <td>{transaction.category}</td>
                      <td>{transaction.description}</td>
                      <td className={transaction.type}>
                        {transaction.type === 'income' ? '+' : '-'} 
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Diğer bölümler için placeholder'lar */}
        <section className={`reports-section ${activeTab === 'reports' ? 'active' : ''}`}>
          <h2>Finansal Raporlar</h2>
          <div className="placeholder-content">
            <p>Aylık gelir-gider raporları, kategorik analizler ve özelleştirilebilir raporlar burada görüntülenecek.</p>
          </div>
        </section>
        
        <section className={`budget-section ${activeTab === 'budget' ? 'active' : ''}`}>
          <h2>Bütçe Yönetimi</h2>
          <div className="placeholder-content">
            <p>Kategorilere göre bütçe planlaması yapın, harcamalarınızı sınırların içinde tutun.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;