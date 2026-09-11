import React from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatCurrency } from '../utils/helpers';

export default function StockAnalysis() {
  const { transactions } = useTransactions();

  const stockSummary: Record<string, { buyQty: number; buyTotal: number; sellQty: number; sellTotal: number; pnl: number }> = {};

  transactions.forEach(t => {
    if (!stockSummary[t.ticker]) {
      stockSummary[t.ticker] = { buyQty: 0, buyTotal: 0, sellQty: 0, sellTotal: 0, pnl: 0 };
    }
    const sum = stockSummary[t.ticker];
    if (t.type === 'BUY') {
      sum.buyQty += t.quantity;
      sum.buyTotal += t.totalAmount;
    } else {
      sum.sellQty += t.quantity;
      sum.sellTotal += t.totalAmount;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Hisse Analizi</h2>
        <p className="text-slate-500">İşlem yaptığınız tüm hisselerin özet performansı.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(stockSummary).length === 0 ? (
          <div className="col-span-full text-slate-500 text-center py-8">Henüz hiç işlem yapmadınız.</div>
        ) : (
          Object.entries(stockSummary).map(([ticker, data]) => {
            const avgBuy = data.buyQty > 0 ? data.buyTotal / data.buyQty : 0;
            const avgSell = data.sellQty > 0 ? data.sellTotal / data.sellQty : 0;
            const remainingQty = data.buyQty - data.sellQty;
            
            return (
              <Card key={ticker}>
                <CardHeader>
                  <CardTitle className="text-xl">{ticker}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Toplam Alım:</span>
                    <span className="font-medium">{data.buyQty} adet ({formatCurrency(avgBuy)} ort)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Toplam Satım:</span>
                    <span className="font-medium">{data.sellQty} adet ({formatCurrency(avgSell)} ort)</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                    <span className="text-slate-500">Kalan Adet:</span>
                    <span className="font-medium">{remainingQty}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
