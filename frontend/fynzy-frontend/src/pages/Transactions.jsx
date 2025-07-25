import React, { useState, useEffect } from 'react';

const Transactions = ({ 
  categories, 
  newTransaction, 
  setNewTransaction, 
  handleInputChange, 
  handleSubmitTransaction, 
  handleDeleteTransaction,
  transactions
}) => {
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('Tüm Kategoriler');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notification, setNotification] = useState(null);
  
  useEffect(() => {
    let result = transactions;
    
    // Apply category filter
    if (categoryFilter !== 'Tüm Kategoriler') {
      // Extract raw category name from display name
      const rawCategory = categoryFilter.replace('Gelir: ', '').replace('Gider: ', '');
      result = result.filter(t => t.category === rawCategory);
    }
    
    // Apply date filter
    if (startDate) {
      result = result.filter(t => t.date >= startDate);
    }
    
    if (endDate) {
      result = result.filter(t => t.date <= endDate);
    }
    
    setFilteredTransactions(result);
  }, [transactions, categoryFilter, startDate, endDate]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const applyFilters = () => {
    // Filters are applied automatically in useEffect
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newTransaction.category) {
      showNotification('Lütfen bir kategori seçin', 'error');
      return;
    }
    
    if (!newTransaction.amount || newTransaction.amount <= 0) {
      showNotification('Lütfen geçerli bir tutar girin', 'error');
      return;
    }
    
    try {
      await handleSubmitTransaction(e);
      showNotification('İşlem başarıyla eklendi!', 'success');
    } catch (error) {
      showNotification('İşlem eklenirken hata oluştu', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  // Silme fonksiyonu
  const handleDelete = async (id) => {
    if (window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      try {
        await handleDeleteTransaction(id);
        showNotification('İşlem başarıyla silindi!', 'success');
      } catch (error) {
        showNotification('İşlem silinirken hata oluştu', 'error');
      }
    }
  };

  // Kategorileri benzersiz hale getirme fonksiyonu
  const getUniqueCategories = () => {
    const allCategories = [
      ...categories.income.map(cat => `Gelir: ${cat}`),
      ...categories.expense.map(cat => `Gider: ${cat}`)
    ];
    
    return ['Tüm Kategoriler', ...new Set(allCategories)];
  };

  return (
    <div className="transactions-section">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button onClick={() => setNotification(null)}>×</button>
        </div>
      )}
      
      <div className="transaction-form">
        <h3>Yeni İşlem Ekle</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>İşlem Türü</label>
            <div className="type-toggle">
              <button 
                type="button"
                className={`toggle-btn ${newTransaction.type === 'income' ? 'active income' : ''}`}
                onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
              >
                Gelir
              </button>
              <button 
                type="button"
                className={`toggle-btn ${newTransaction.type === 'expense' ? 'active expense' : ''}`}
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
                min="0.01"
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
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {getUniqueCategories().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <div className="date-filter">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Başlangıç"
            />
            <span>-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Bitiş"
            />
            <button onClick={applyFilters}>Uygula</button>
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
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <tr key={`${transaction.id}-${transaction.date}`} className={transaction.type}>
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
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="no-results">
              <p>Filtreyle eşleşen işlem bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;