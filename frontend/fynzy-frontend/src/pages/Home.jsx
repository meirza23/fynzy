import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      loadDemoData();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadDemoData = () => {
    const demoTransactions = [
      { id: 1, type: 'income', category: 'Maaş', amount: 12500, date: '2024-06-15', description: 'Aylık maaş' },
      { id: 2, type: 'expense', category: 'Kira', amount: 4500, date: '2024-06-10', description: 'Ev kirası' },
      { id: 3, type: 'expense', category: 'Market', amount: 1200, date: '2024-06-12', description: 'Haftalık market alışverişi' },
      { id: 4, type: 'income', category: 'Freelance', amount: 3500, date: '2024-06-05', description: 'Web tasarım projesi' },
      { id: 5, type: 'expense', category: 'Ulaşım', amount: 450, date: '2024-06-18', description: 'Aylık toplu taşıma' },
      { id: 6, type: 'expense', category: 'Faturalar', amount: 850, date: '2024-06-20', description: 'Elektrik ve su faturası' },
    ];
    
    setTransactions(demoTransactions);
    
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
    
    if (newTransaction.type === 'income') {
      setIncome(income + newTransaction.amount);
      setBalance(balance + newTransaction.amount);
    } else {
      setExpense(expense + newTransaction.amount);
      setBalance(balance - newTransaction.amount);
    }
    
    setNewTransaction({
      type: 'expense',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    
    alert('İşlem başarıyla eklendi!');
  };

  const getChartData = () => {
    const labels = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
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