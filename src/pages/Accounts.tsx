import { useState, useMemo } from 'react';
import { useAccounts } from '../hooks/useAccounts';
import { useCalculations } from '../hooks/useCalculations';
import { usePriceSnapshots } from '../hooks/usePriceSnapshots';
import { useBalances } from '../hooks/useBalances';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { AccountForm } from '../components/forms/AccountForm';
import { formatCurrency } from '../utils/helpers';
import { Plus, Edit2, Trash2, Wallet } from 'lucide-react';
import { useData } from '../context';

export default function Accounts() {
  const { accounts } = useAccounts();
  const { deleteAccount } = useData();
  const { openPositions } = useCalculations();
  const { snapshots } = usePriceSnapshots();
  const { balances } = useBalances();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openModal = (id?: string) => {
    setEditingId(id || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu hesabı silmek istediğinize emin misiniz? (İşlemleriniz silinmez, hesap arşivlenir)')) {
      await deleteAccount(id);
    }
  };

  // Calculate latest prices
  const latestPrices = useMemo(() => {
    const map: Record<string, number> = {};
    snapshots.forEach(s => {
      if (!map[s.ticker]) {
        map[s.ticker] = s.price;
      }
    });
    return map;
  }, [snapshots]);

  // Calculate account metrics
  const accountMetrics = useMemo(() => {
    const metrics: Record<string, { totalValue: number; totalCost: number; pnl: number }> = {};
    
    accounts.forEach(acc => {
      metrics[acc.id] = { totalValue: 0, totalCost: 0, pnl: 0 };
    });

    openPositions.forEach(pos => {
      if (metrics[pos.accountId]) {
        const currentPrice = latestPrices[pos.ticker] || pos.averageCost;
        const val = pos.quantity * currentPrice;
        const cost = pos.quantity * pos.averageCost;
        
        metrics[pos.accountId].totalValue += val;
        metrics[pos.accountId].totalCost += cost;
        metrics[pos.accountId].pnl += (val - cost);
      }
    });
    
    return metrics;
  }, [openPositions, latestPrices, accounts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hesaplarım</h2>
          <p className="text-slate-500">Aracı kurum ve banka hesaplarınızı yönetin.</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2 shrink-0">
          <Plus size={16} />
          Yeni Hesap Ekle
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <Wallet className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">Henüz hesap eklemediniz</p>
            <p className="mt-1">İşlem yapmaya başlamak için ilk hesabınızı ekleyin.</p>
            <Button onClick={() => openModal()} className="mt-4" variant="outline">Hesap Ekle</Button>
          </div>
        ) : (
          accounts.map(account => {
            const metrics = accountMetrics[account.id];
            
            return (
              <Card key={account.id} className="flex flex-col border-l-4" style={{ borderLeftColor: account.color }}>
                <CardHeader className="pb-2 flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => openModal(account.id)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(account.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end mt-4 space-y-4">
                  <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-sm text-slate-500">Kullanılabilir Nakit Bakiye</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(balances[account.id] || 0)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-slate-500">Mevcut Toplam Hisse Değeri</div>
                    <div className="text-xl font-bold">{formatCurrency(metrics.totalValue)}</div>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-sm text-slate-500">Anlık Bekleyen Kar/Zarar</div>
                    <div className={`text-lg font-bold ${metrics.pnl > 0 ? 'text-green-600' : metrics.pnl < 0 ? 'text-red-600' : ''}`}>
                      {metrics.pnl > 0 ? '+' : ''}{formatCurrency(metrics.pnl)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Hesabı Düzenle" : "Yeni Hesap Ekle"}
      >
        <AccountForm 
          accountId={editingId} 
          onSuccess={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
