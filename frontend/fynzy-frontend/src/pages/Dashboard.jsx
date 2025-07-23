import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ 
  income, 
  expense, 
  balance, 
  transactions, 
  getChartData, 
  getPieChartData 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  // Calculate trends based on actual data
  const calculateTrend = (type, current) => {
    if (transactions.length === 0) return 'Veri yok';
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthNumber = lastMonth.getMonth();
    
    const lastMonthTotal = transactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === lastMonthNumber && t.type === type;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (lastMonthTotal === 0) return 'Veri yok';
    
    const percentage = Math.round(((current - lastMonthTotal) / lastMonthTotal) * 100);
    return `${percentage > 0 ? '+' : ''}${percentage}% geçen aya göre`;
  };

  return (
    <div className="dashboard-section">
      <div className="summary-cards">
        <div className="card income-card">
          <div className="card-title">Toplam Gelir</div>
          <div className="card-value">{formatCurrency(income)}</div>
          <div className={`card-trend ${income > 0 ? 'positive' : 'neutral'}`}>
            {calculateTrend('income', income)}
          </div>
        </div>
        
        <div className="card expense-card">
          <div className="card-title">Toplam Gider</div>
          <div className="card-value">{formatCurrency(expense)}</div>
          <div className={`card-trend ${expense > 0 ? 'negative' : 'neutral'}`}>
            {calculateTrend('expense', expense)}
          </div>
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
          {transactions.filter(t => t.type === 'expense').length > 0 ? (
            <Pie 
              data={getPieChartData()} 
              options={{ 
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          ) : (
            <p className="no-data-info">Gider verisi bulunmamaktadır</p>
          )}
        </div>
      </div>
      
      <div className="recent-transactions">
        <h3>Son İşlemler</h3>
        {transactions.length > 0 ? (
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
        ) : (
          <p className="no-data-info">Henüz işlem kaydı bulunmamaktadır</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;