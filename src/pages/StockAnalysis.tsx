import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { useData } from '../context';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatDate } from '../utils/helpers';
import { GripVertical, Edit, Trash2, ArrowDownToLine, ArrowUpFromLine, ExternalLink } from 'lucide-react';
import { Transaction } from '../types';

export default function StockAnalysis() {
  const { transactions } = useTransactions();
  const { deleteTransaction } = useData();
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
  
  const [orderedTickers, setOrderedTickers] = useState<string[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  
  useEffect(() => {
    const savedOrder = localStorage.getItem('stockAnalysisOrder');
    if (savedOrder) {
      const parsed = JSON.parse(savedOrder);
      const newTickers = allTickers.filter(t => !parsed.includes(t));
      setOrderedTickers([...parsed, ...newTickers]);
    } else {
      setOrderedTickers(allTickers);
    }
  }, [allTickers.length]);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, ticker: string) => {
    setDraggedItem(ticker);
    e.dataTransfer.effectAllowed = 'move';
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
      newOrder.splice(draggedIdx, 1);
      newOrder.splice(targetIdx, 0, draggedItem);
      setOrderedTickers(newOrder);
      localStorage.setItem('stockAnalysisOrder', JSON.stringify(newOrder));
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      await deleteTransaction(id);
    }
  };

  const visibleTickers = orderedTickers.filter(t => summaryMap[t]);
  const selectedTickerTransactions = selectedTicker ? transactions.filter(t => t.ticker === selectedTicker).sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hisse Analizi</h2>
          <p className="text-slate-500">
            Hisselerin özet performansı ve detayları. Kartları sürükleyerek sıralayabilirsiniz.
          </p>
        </div>
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
                    <button 
                      onClick={() => setSelectedTicker(ticker)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 text-sm bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded"
                    >
                      <ExternalLink size={14} /> Detay
                    </button>
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

      <Modal 
        isOpen={!!selectedTicker} 
        onClose={() => setSelectedTicker(null)} 
        title={`${selectedTicker} Detaylı İşlem Geçmişi`}
      >
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">İşlem</th>
                <th className="px-4 py-3 font-medium text-right">Miktar</th>
                <th className="px-4 py-3 font-medium text-right">Fiyat</th>
                <th className="px-4 py-3 font-medium text-right">Toplam</th>
                <th className="px-4 py-3 font-medium text-center">Sil</th>
              </tr>
            </thead>
            <tbody>
              {selectedTickerTransactions.map(tx => (
                <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(tx.transactionDate).split(' ')[0]}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      tx.type === 'BUY' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {tx.type === 'BUY' ? <><ArrowDownToLine size={12}/> ALIM</> : <><ArrowUpFromLine size={12}/> SATIM</>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{tx.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(tx.pricePerUnit)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(tx.totalAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors inline-block"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
