import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Dashboard from './Dashboard';
import Transactions from './Transactions';
import Reports from './Reports';
import Budget from './Budget';
import '../styles/Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories] = useState({
    income: ['Maaş', 'Yatırım', 'Freelance', 'Diğer'],
    expense: ['Kira', 'Market', 'Ulaşım', 'Eğlence', 'Faturalar', 'Sağlık', 'Diğer']
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      loadUserData();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadUserData = async () => {
    try {
      // Fetch account summary
      const summaryRes = await api.get('/account/summary');
      
      const { balance } = summaryRes.data;
      setBalance(balance || 0);
      
      // Fetch transactions
      const transactionsRes = await api.get('/transactions');
      
      // Array check
      const transactionsData = Array.isArray(transactionsRes.data) 
        ? transactionsRes.data 
        : [];
      
      setTransactions(transactionsData.map(t => ({
        ...t,
        date: new Date(t.date).toISOString().split('T')[0]
      })));
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: name === 'amount' ? Number(value) : value
    });
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    
    try {
      // Use api instance for automatic token handling
      const response = await api.post('/transactions', {
        Type: newTransaction.type,
        Category: newTransaction.category,
        Amount: newTransaction.amount,
        Date: newTransaction.date,
        Description: newTransaction.description
      });
        
      const { newBalance } = response.data;
      
      // Update local state
      const transaction = {
        id: response.data.transactionId,
        ...newTransaction,
        amount: Number(newTransaction.amount)
      };
      
      setTransactions([transaction, ...transactions]);
      setBalance(newBalance);
      
      // Reset form
      setNewTransaction({
        type: 'expense',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      
      return true;
    } catch (error) {
      console.error('İşlem ekleme hatası:', error);
      throw error;
    }
  };

  // Yeni silme fonksiyonu
  const handleDeleteTransaction = async (id) => {
    try {
      const response = await api.delete(`/transactions/${id}`);
      const { newBalance } = response.data;
      
      setTransactions(transactions.filter(t => t.id !== id));
      setBalance(newBalance);
      return true;
    } catch (error) {
      console.error('İşlem silme hatası:', error);
      throw error;
    }
  };

  const getChartData = () => {
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Initialize monthly data
    const monthlyData = Array(12).fill().map(() => ({ income: 0, expense: 0 }));
    
    // Process transactions
    transactions.forEach(t => {
      const date = new Date(t.date);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        if (t.type === 'income') {
          monthlyData[month].income += t.amount;
        } else {
          monthlyData[month].expense += t.amount;
        }
      }
    });
    
    const labels = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    return {
      labels,
      datasets: [
        {
          label: 'Gelir',
          data: monthlyData.map(m => m.income),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Gider',
          data: monthlyData.map(m => m.expense),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.3,
        },
      ],
    };
  };

  const getPieChartData = () => {
    const expenseByCategory = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      });
    
    const categoryLabels = Object.keys(expenseByCategory);
    const amounts = Object.values(expenseByCategory);
    
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
      labels: categoryLabels,
      datasets: [
        {
          label: 'Gider Dağılımı',
          data: amounts,
          backgroundColor: backgroundColors.slice(0, categoryLabels.length),
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
      <Header user={user} balance={balance} />
      
      <main className="home-content">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            getChartData={getChartData}
            getPieChartData={getPieChartData}
          />
        )}
        
        {activeTab === 'transactions' && (
          <Transactions
            categories={categories}
            newTransaction={newTransaction}
            setNewTransaction={setNewTransaction}
            handleInputChange={handleInputChange}
            handleSubmitTransaction={handleSubmitTransaction}
            handleDeleteTransaction={handleDeleteTransaction}
            transactions={transactions}
          />
        )}
        
        {activeTab === 'reports' && <Reports />}
        
      </main>
    </div>
  );
};

export default Home;