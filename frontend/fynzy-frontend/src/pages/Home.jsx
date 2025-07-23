import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      const summaryRes = await axios.get('/api/account/summary', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const { balance, income, expense } = summaryRes.data;
      setBalance(balance || 0);
      setIncome(income || 0);
      setExpense(expense || 0);
      
      // Fetch transactions
      const transactionsRes = await axios.get('/api/transactions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setTransactions(transactionsRes.data.map(t => ({
        ...t,
        date: new Date(t.date).toISOString().split('T')[0]
      })) || []);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Finansal veriler yüklenirken hata oluştu');
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
    
    if (!newTransaction.category || !newTransaction.amount) {
      alert('Lütfen kategori ve tutar alanlarını doldurun');
      return;
    }
    
    try {
      const response = await axios.post('/api/transactions', {
        type: newTransaction.type,
        category: newTransaction.category,
        amount: Number(newTransaction.amount),
        date: newTransaction.date,
        description: newTransaction.description
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const { newBalance } = response.data;
      
      // Update local state
      const transaction = {
        id: response.data.transactionId,
        ...newTransaction,
        amount: Number(newTransaction.amount)
      };
      
      setTransactions([transaction, ...transactions]);
      
      if (newTransaction.type === 'income') {
        setIncome(income + transaction.amount);
      } else {
        setExpense(expense + transaction.amount);
      }
      setBalance(newBalance);
      
      // Reset form
      setNewTransaction({
        type: 'expense',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      
      alert('İşlem başarıyla eklendi!');
    } catch (error) {
      console.error('İşlem ekleme hatası:', error);
      alert('İşlem eklenirken hata oluştu');
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
            income={income}
            expense={expense}
            balance={balance}
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
            transactions={transactions}
          />
        )}
        
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'budget' && <Budget />}
      </main>
    </div>
  );
};

export default Home;