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

  // Calculate current month totals
  const calculateCurrentMonthTotals = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    });
    
    return { income, expense, net: income - expense };
  };
  
  // Calculate previous month totals
  const calculatePreviousMonthTotals = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1); // Go back one month
    const prevMonth = now.getMonth();
    const prevYear = now.getFullYear();
    
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      if (date.getMonth() === prevMonth && date.getFullYear() === prevYear) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    });
    
    return { income, expense, net: income - expense };
  };
  
  const currentMonth = calculateCurrentMonthTotals();
  const prevMonth = calculatePreviousMonthTotals();
  
  // Calculate trend percentage
  const calculateTrend = (current, previous) => {
    if (previous === 0) return 'Veri yok';
    
    const percentage = Math.round(((current - previous) / Math.abs(previous)) * 100);
    return `${percentage > 0 ? '+' : ''}${percentage}% geçen aya göre`;
  };
  
  const incomeTrend = calculateTrend(currentMonth.income, prevMonth.income);
  const expenseTrend = calculateTrend(currentMonth.expense, prevMonth.expense);
  const netTrend = calculateTrend(currentMonth.net, prevMonth.net);

  return (
    <div className="dashboard-section">
      <div className="summary-cards">
        <div className="card income-card">
          <div className="card-title">Bu Ay Gelir</div>
          <div className="card-value">{formatCurrency(currentMonth.income)}</div>
          <div className={`card-trend ${incomeTrend.includes('+') ? 'positive' : 'neutral'}`}>
            {incomeTrend}
          </div>
        </div>
        
        <div className="card expense-card">
          <div className="card-title">Bu Ay Gider</div>
          <div className="card-value">{formatCurrency(currentMonth.expense)}</div>
          <div className={`card-trend ${expenseTrend.includes('+') ? 'negative' : 'neutral'}`}>
            {expenseTrend}
          </div>
        </div>
        
        <div className="card balance-card">
          <div className="card-title">Bu Ay Net</div>
          <div className="card-value">{formatCurrency(currentMonth.net)}</div>
          <div className={`card-trend ${netTrend.includes('+') ? 'positive' : 'negative'}`}>
            {netTrend}
          </div>
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