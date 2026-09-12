import React, { useMemo } from 'react';
import { useCalculations } from '../hooks/useCalculations';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '../hooks/useTransactions';
import { usePriceSnapshots } from '../hooks/usePriceSnapshots';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatCurrency, formatNumber, formatDate } from '../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const { openPositions, realizedPnL } = useCalculations();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { snapshots } = usePriceSnapshots();

  // Calculate current value based on latest snapshots
  const latestPrices = useMemo(() => {
    const map: Record<string, number> = {};
    snapshots.forEach(s => {
      if (!map[s.ticker]) {
        map[s.ticker] = s.price;
      }
    });
    return map;
  }, [snapshots]);

  let totalPortfolioValue = 0;
  let totalCost = 0;
  
  const accountDistribution: Record<string, number> = {};

  openPositions.forEach(pos => {
    const currentPrice = latestPrices[pos.ticker] || pos.averageCost;
    const val = pos.quantity * currentPrice;
    const cost = pos.quantity * pos.averageCost;
    
    totalPortfolioValue += val;
    totalCost += cost;

    if (!accountDistribution[pos.accountId]) accountDistribution[pos.accountId] = 0;
    accountDistribution[pos.accountId] += val;
  });

  const unrealizedPnL = totalPortfolioValue - totalCost;
  const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

  const pieData = Object.entries(accountDistribution).map(([accId, val]) => {
    const acc = accounts.find(a => a.id === accId);
    return {
      name: acc?.name || 'Bilinmeyen',
      value: val,
      color: acc?.color || '#cbd5e1'
    };
  }).filter(d => d.value > 0);

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Bilinmeyen Hesap';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-slate-500">Portföyünüzün genel durumuna bir bakış.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Güncel Portföy Değeri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
            <p className="text-sm text-slate-500 mt-1">Açık hisselerinizin anlık toplam değeri</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Aktif Yatırım Maliyeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-sm text-slate-500 mt-1">Açık pozisyonlarınız için bağlanan ana para</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Anlık (Bekleyen) Kar/Zarar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${unrealizedPnL > 0 ? 'text-green-600' : unrealizedPnL < 0 ? 'text-red-600' : ''}`}>
              {unrealizedPnL > 0 ? '+' : ''}{formatCurrency(unrealizedPnL)}
            </div>
            <p className="text-sm mt-1 font-medium">
              <span className={unrealizedPnLPercent > 0 ? 'text-green-600' : unrealizedPnLPercent < 0 ? 'text-red-600' : 'text-slate-500'}>
                {unrealizedPnLPercent > 0 ? '+' : ''}{formatNumber(unrealizedPnLPercent)}% 
              </span>
              <span className="text-slate-500"> getiri oranı (anlık fiyatlara göre)</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hesap Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500">Veri bulunamadı.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).length === 0 ? (
                <div className="text-slate-500 text-center py-4">İşlem geçmişi boş.</div>
              ) : (
                transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${tx.type === 'BUY' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {tx.ticker}
                      </div>
                      <div className="text-xs text-slate-500">{getAccountName(tx.accountId)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(tx.totalAmount)}</div>
                      <div className="text-xs text-slate-500">{formatDate(tx.transactionDate).split(' ')[0]}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
