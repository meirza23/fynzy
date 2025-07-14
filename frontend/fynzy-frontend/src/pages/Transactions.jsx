import React from 'react';

const Transactions = ({ 
  categories, 
  newTransaction, 
  setNewTransaction, 
  handleInputChange, 
  handleSubmitTransaction, 
  transactions
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <div className="transactions-section">
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
    </div>
  );
};

export default Transactions;