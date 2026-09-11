import React, { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useAccounts } from '../hooks/useAccounts';
import { useData } from '../context';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TransactionForm } from '../components/forms/TransactionForm';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function Transactions() {
  const { transactions } = useTransactions();
  const { allAccounts } = useAccounts();
  const { deleteTransaction } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      await deleteTransaction(id);
    }
  };

  const getAccountName = (id: string) => {
    return allAccounts.find(a => a.id === id)?.name || 'Bilinmeyen Hesap';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">İşlemler</h2>
          <p className="text-slate-500">Tüm alım satım geçmişiniz.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} />
          İşlem Ekle
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">Hesap</th>
                <th className="px-4 py-3 font-medium">İşlem</th>
                <th className="px-4 py-3 font-medium">Hisse</th>
                <th className="px-4 py-3 font-medium text-right">Adet</th>
                <th className="px-4 py-3 font-medium text-right">Fiyat</th>
                <th className="px-4 py-3 font-medium text-right">Toplam</th>
                <th className="px-4 py-3 font-medium text-center">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Henüz işlem bulunmuyor.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(tx.transactionDate)}</td>
                    <td className="px-4 py-3">{getAccountName(tx.accountId)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.type === 'BUY' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                      }`}>
                        {tx.type === 'BUY' ? 'ALIM' : 'SATIM'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{tx.ticker}</td>
                    <td className="px-4 py-3 text-right">{tx.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(tx.pricePerUnit)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(tx.totalAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} className="inline-block" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Yeni İşlem Ekle"
      >
        <TransactionForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
