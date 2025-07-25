import React, { useState, useEffect } from 'react';

const Reports = ({ transactions }) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  
  // Mevcut tarihi al ve formatla (YYYY-MM)
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonth);
  }, []);

  // Ay seçimi değiştiğinde filtrele
  useEffect(() => {
    if (selectedMonth) {
      const filtered = transactions.filter(t => {
        const date = new Date(t.date);
        const transactionMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return transactionMonth === selectedMonth;
      });
      setFilteredTransactions(filtered);
    }
  }, [selectedMonth, transactions]);

  // CSV oluştur ve indir
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Bu aya ait işlem bulunamadı');
      return;
    }

    // CSV başlıkları
    let csvContent = 'Tarih,Tür,Kategori,Açıklama,Tutar\n';
    
    // Her işlem için CSV satırı oluştur
    filteredTransactions.forEach(t => {
      const row = [
        t.date,
        t.type === 'income' ? 'Gelir' : 'Gider',
        t.category,
        t.description.replace(/"/g, '""'), // Çift tırnakları escape et
        t.amount.toFixed(2).replace('.', ',')
      ].map(field => `"${field}"`).join(',');
      
      csvContent += row + '\n';
    });

    // Blob oluştur ve indir
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedMonth}-islem-raporu.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toplam gelir ve gideri hesapla
  const calculateTotals = () => {
    let income = 0;
    let expense = 0;
    
    filteredTransactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    
    return { income, expense };
  };

  const totals = calculateTotals();

  return (
    <div className="reports-section">
      <h2>Finansal Raporlar</h2>
      
      <div className="report-controls">
        <div className="form-group">
          <label>Rapor Ayı Seçin</label>
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-selector"
          />
        </div>
        
        <button 
          className="export-btn"
          onClick={exportToCSV}
          disabled={filteredTransactions.length === 0}
        >
          CSV Olarak İndir
        </button>
      </div>
      
      {selectedMonth && (
        <div className="report-summary">
          <h3>{selectedMonth} Ayı Raporu</h3>
          <div className="summary-cards">
            <div className="card income-card">
              <div className="card-title">Toplam Gelir</div>
              <div className="card-value">{totals.income.toFixed(2).replace('.', ',')} ₺</div>
            </div>
            
            <div className="card expense-card">
              <div className="card-title">Toplam Gider</div>
              <div className="card-value">{totals.expense.toFixed(2).replace('.', ',')} ₺</div>
            </div>
            
            <div className="card balance-card">
              <div className="card-title">Net Bakiye</div>
              <div className="card-value">{(totals.income - totals.expense).toFixed(2).replace('.', ',')} ₺</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="report-details">
        <h3>İşlem Detayları</h3>
        
        {filteredTransactions.length > 0 ? (
          <div className="transactions-table-container">
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Tür</th>
                  <th>Kategori</th>
                  <th>Açıklama</th>
                  <th>Tutar (₺)</th>
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
                      {transaction.amount.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-results">
            <p>{selectedMonth} ayına ait işlem bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;