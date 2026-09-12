import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatCurrency } from '../utils/helpers';
import { GripVertical, Edit } from 'lucide-react';

export default function StockAnalysis() {
  const { transactions } = useTransactions();
  const navigate = useNavigate();

  // Calculate summary
  const summaryMap: Record<string, { buyQty: number; buyTotal: number; sellQty: number; sellTotal: number; pnl: number }> = {};

  transactions.forEach(t => {
    if (!summaryMap[t.ticker]) {
      summaryMap[t.ticker] = { buyQty: 0, buyTotal: 0, sellQty: 0, sellTotal: 0, pnl: 0 };
    }
    const sum = summaryMap[t.ticker];
    if (t.type === 'BUY') {
      sum.buyQty += t.quantity;
      sum.buyTotal += t.totalAmount;
    } else {
      sum.sellQty += t.quantity;
      sum.sellTotal += t.totalAmount;
    }
  });

  const allTickers = Object.keys(summaryMap);
  
  // State for draggable order
  const [orderedTickers, setOrderedTickers] = useState<string[]>([]);
  
  useEffect(() => {
    const savedOrder = localStorage.getItem('stockAnalysisOrder');
    if (savedOrder) {
      const parsed = JSON.parse(savedOrder);
      // Merge new tickers that aren't in saved order
      const newTickers = allTickers.filter(t => !parsed.includes(t));
      setOrderedTickers([...parsed, ...newTickers]);
    } else {
      setOrderedTickers(allTickers);
    }
  }, [allTickers.length]); // Only re-run if number of tickers changes

  // Drag state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, ticker: string) => {
    setDraggedItem(ticker);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow drag image to render before applying opacity
    setTimeout(() => {
      const el = document.getElementById(`card-${ticker}`);
      if (el) el.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, ticker: string) => {
    setDraggedItem(null);
    const el = document.getElementById(`card-${ticker}`);
    if (el) el.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, targetTicker: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetTicker) return;

    const draggedIdx = orderedTickers.indexOf(draggedItem);
    const targetIdx = orderedTickers.indexOf(targetTicker);
    
    if (draggedIdx !== -1 && targetIdx !== -1) {
      const newOrder = [...orderedTickers];
      newOrder.splice(draggedIdx, 1); // Remove
      newOrder.splice(targetIdx, 0, draggedItem); // Insert
      setOrderedTickers(newOrder);
      localStorage.setItem('stockAnalysisOrder', JSON.stringify(newOrder));
    }
  };

  const visibleTickers = orderedTickers.filter(t => summaryMap[t]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hisse Analizi</h2>
          <p className="text-slate-500">
            Hisselerin özet performansı. <span className="hidden sm:inline">Kartları sürükleyerek yerlerini değiştirebilirsiniz. Hisseleri düzenlemek/silmek için 'İşlemler' sayfasına gidin.</span>
          </p>
        </div>
        <button 
          onClick={() => navigate('/transactions')}
          className="text-sm flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
        >
          <Edit size={16} />
          İşlemleri Düzenle
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleTickers.length === 0 ? (
          <div className="col-span-full text-slate-500 text-center py-8">Henüz hiç işlem yapmadınız.</div>
        ) : (
          visibleTickers.map(ticker => {
            const data = summaryMap[ticker];
            const avgBuy = data.buyQty > 0 ? data.buyTotal / data.buyQty : 0;
            const avgSell = data.sellQty > 0 ? data.sellTotal / data.sellQty : 0;
            const remainingQty = data.buyQty - data.sellQty;
            
            return (
              <div 
                key={ticker}
                id={`card-${ticker}`}
                draggable
                onDragStart={(e) => handleDragStart(e, ticker)}
                onDragEnd={(e) => handleDragEnd(e, ticker)}
                onDragOver={(e) => handleDragOver(e, ticker)}
                className="transition-transform duration-200 ease-in-out cursor-grab active:cursor-grabbing"
              >
                <Card className="h-full border-t-4 border-t-slate-300 dark:border-t-slate-600 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <GripVertical className="text-slate-400 -ml-2" size={18} />
                      {ticker}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm pt-2">
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
                      <span className="font-medium text-lg">{remainingQty}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>
      
      <p className="text-xs text-slate-400 mt-4 sm:hidden">
        Not: Mobilde kartların sırasını değiştirmek için basılı tutup sürükleyin.
      </p>
    </div>
  );
}
