import React, { useState, useEffect } from 'react';
import { useCalculations } from '../hooks/useCalculations';
import { useAccounts } from '../hooks/useAccounts';
import { usePriceSnapshots } from '../hooks/usePriceSnapshots';
import { useData } from '../context';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { RefreshCw } from 'lucide-react';

export default function LivePnL() {
  const { openPositions } = useCalculations();
  const { allAccounts } = useAccounts();
  const { snapshots } = usePriceSnapshots();
  const { addPriceSnapshot } = useData();

  const [prices, setPrices] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize input prices from latest snapshots
  useEffect(() => {
    const latestPrices: Record<string, string> = {};
    const uniqueTickers = Array.from(new Set(openPositions.map(p => p.ticker)));
    
    uniqueTickers.forEach(ticker => {
      const snap = snapshots.find(s => s.ticker === ticker);
      if (snap) {
        latestPrices[ticker] = snap.price.toString();
      } else {
        latestPrices[ticker] = '';
      }
    });
    setPrices(latestPrices);
  }, [openPositions, snapshots]);

  const handlePriceChange = (ticker: string, val: string) => {
    setPrices(prev => ({ ...prev, [ticker]: val }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const now = new Date().toISOString();
    
    const promises = Object.entries(prices).map(([ticker, val]) => {
      const priceNum = Number(val);
      if (priceNum > 0) {
        return addPriceSnapshot({
          ticker,
          price: priceNum,
          timestamp: now,
          source: 'MANUAL'
        });
      }
      return Promise.resolve("");
    });

    await Promise.all(promises);
    setIsSaving(false);
  };

  const getAccountName = (id: string) => allAccounts.find(a => a.id === id)?.name || 'Bilinmeyen';

  let totalCostAll = 0;
  let totalValueAll = 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Anlık Kar/Zarar</h2>
        <p className="text-slate-500">Açık pozisyonlarınızın güncel fiyatlarını girerek anlık durumunuzu takip edin.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fiyat Girişi (Manuel)</CardTitle>
          <Button onClick={handleSaveAll} disabled={isSaving} className="gap-2">
            <RefreshCw size={16} className={isSaving ? "animate-spin" : ""} />
            Tümünü Güncelle
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from(new Set(openPositions.map(p => p.ticker))).map(ticker => (
              <div key={ticker}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{ticker}</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={prices[ticker] || ''}
                  onChange={e => handlePriceChange(ticker, e.target.value)}
                  placeholder="0.00"
                />
              </div>
            ))}
            {openPositions.length === 0 && (
              <div className="col-span-full text-slate-500 text-sm">
                Açık pozisyonunuz bulunmuyor.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Hisse</th>
                <th className="px-4 py-3 font-medium">Hesap</th>
                <th className="px-4 py-3 font-medium text-right">Adet</th>
                <th className="px-4 py-3 font-medium text-right">Ort. Maliyet</th>
                <th className="px-4 py-3 font-medium text-right">Güncel Fiyat</th>
                <th className="px-4 py-3 font-medium text-right">Maliyet Toplam</th>
                <th className="px-4 py-3 font-medium text-right">Güncel Değer</th>
                <th className="px-4 py-3 font-medium text-right">K/Z (₺)</th>
                <th className="px-4 py-3 font-medium text-right">K/Z (%)</th>
                <th className="px-4 py-3 font-medium text-center">Durum</th>
              </tr>
            </thead>
            <tbody>
              {openPositions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    Açık pozisyon bulunmuyor.
                  </td>
                </tr>
              ) : (
                openPositions.map((pos, idx) => {
                  const currentPrice = Number(prices[pos.ticker]) || 0;
                  const totalCost = pos.quantity * pos.averageCost;
                  const currentValue = pos.quantity * currentPrice;
                  const pnl = currentPrice > 0 ? currentValue - totalCost : 0;
                  const pnlPercent = currentPrice > 0 ? (pnl / totalCost) * 100 : 0;
                  
                  totalCostAll += totalCost;
                  if (currentPrice > 0) totalValueAll += currentValue;

                  const isProfit = pnl > 0;
                  const isLoss = pnl < 0;

                  return (
                    <tr key={`${pos.accountId}_${pos.ticker}_${idx}`} className={`border-b border-slate-100 dark:border-slate-800/50 ${
                      isProfit ? 'bg-green-50/50 dark:bg-green-900/10' : isLoss ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                    }`}>
                      <td className="px-4 py-3 font-medium">{pos.ticker}</td>
                      <td className="px-4 py-3 text-slate-500">{getAccountName(pos.accountId)}</td>
                      <td className="px-4 py-3 text-right">{pos.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(pos.averageCost)}</td>
                      <td className="px-4 py-3 text-right font-medium">{currentPrice > 0 ? formatCurrency(currentPrice) : '-'}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(totalCost)}</td>
                      <td className="px-4 py-3 text-right font-medium">{currentPrice > 0 ? formatCurrency(currentValue) : '-'}</td>
                      <td className={`px-4 py-3 text-right font-medium ${isProfit ? 'text-green-600 dark:text-green-400' : isLoss ? 'text-red-600 dark:text-red-400' : ''}`}>
                        {currentPrice > 0 ? (pnl > 0 ? '+' : '') + formatCurrency(pnl) : '-'}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${isProfit ? 'text-green-600 dark:text-green-400' : isLoss ? 'text-red-600 dark:text-red-400' : ''}`}>
                        {currentPrice > 0 ? (pnlPercent > 0 ? '+' : '') + formatNumber(pnlPercent) + '%' : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {currentPrice > 0 ? (isProfit ? '🟢' : isLoss ? '🔴' : '⚪') : '➖'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {openPositions.length > 0 && (
              <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-semibold border-t-2 border-slate-200 dark:border-slate-700">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right">TOPLAM:</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totalCostAll)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totalValueAll)}</td>
                  <td className={`px-4 py-3 text-right ${totalValueAll - totalCostAll > 0 ? 'text-green-600' : totalValueAll - totalCostAll < 0 ? 'text-red-600' : ''}`}>
                    {totalValueAll > 0 ? (totalValueAll - totalCostAll > 0 ? '+' : '') + formatCurrency(totalValueAll - totalCostAll) : '-'}
                  </td>
                  <td className={`px-4 py-3 text-right ${totalValueAll - totalCostAll > 0 ? 'text-green-600' : totalValueAll - totalCostAll < 0 ? 'text-red-600' : ''}`}>
                    {totalValueAll > 0 && totalCostAll > 0 ? (totalValueAll - totalCostAll > 0 ? '+' : '') + formatNumber(((totalValueAll - totalCostAll) / totalCostAll) * 100) + '%' : '-'}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
}
