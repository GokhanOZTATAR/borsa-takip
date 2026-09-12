import { useState } from 'react';
import { useAccounts } from '../hooks/useAccounts';
import { useData } from '../context';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Plus, ArrowDownToLine, ArrowUpFromLine, Trash2, Edit2 } from 'lucide-react';

export default function Movements() {
  const { accounts } = useAccounts();
  const { addDeposit, updateDeposit, deleteDeposit, addWithdrawal, updateWithdrawal, deleteWithdrawal } = useData();
  
  const deposits = useLiveQuery(() => db.deposits.orderBy('date').reverse().toArray()) || [];
  const withdrawals = useLiveQuery(() => db.withdrawals.orderBy('date').reverse().toArray()) || [];
  
  const allMovements = [...deposits.map(d => ({...d, type: 'DEPOSIT'})), ...withdrawals.map(w => ({...w, type: 'WITHDRAWAL'}))]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');

  const openModal = (movement?: any) => {
    if (movement) {
      setEditingId(movement.id);
      setType(movement.type);
      setAccountId(movement.accountId);
      setAmount(movement.amount.toString());
      // Ensure date is in proper datetime-local format
      const dateObj = new Date(movement.date);
      const localIso = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setDate(localIso);
      setNotes(movement.notes || '');
    } else {
      setEditingId(null);
      setType('DEPOSIT');
      setAccountId(accounts[0]?.id || '');
      setAmount('');
      const dateObj = new Date();
      const localIso = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setDate(localIso);
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !amount) return;
    
    if (editingId) {
      if (type === 'DEPOSIT') {
        await updateDeposit(editingId, { accountId, amount: Number(amount), date: new Date(date).toISOString(), notes });
      } else {
        await updateWithdrawal(editingId, { accountId, amount: Number(amount), date: new Date(date).toISOString(), notes });
      }
    } else {
      if (type === 'DEPOSIT') {
        await addDeposit({ accountId, amount: Number(amount), date: new Date(date).toISOString(), notes });
      } else {
        await addWithdrawal({ accountId, amount: Number(amount), date: new Date(date).toISOString(), notes });
      }
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, mType: 'DEPOSIT' | 'WITHDRAWAL') => {
    if (window.confirm('Bu hareketi silmek istediğinize emin misiniz?')) {
      if (mType === 'DEPOSIT') {
        await deleteDeposit(id);
      } else {
        await deleteWithdrawal(id);
      }
    }
  };

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Bilinmeyen';

  const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Para Hareketleri</h2>
          <p className="text-slate-500">Hesaplarınıza giren ve çıkan nakit akışını takip edin.</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2 shrink-0">
          <Plus size={16} />
          Hareket Ekle
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Toplam Yatırılan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDeposits)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Toplam Çekilen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalWithdrawals)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Net Nakit Akışı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDeposits - totalWithdrawals >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalDeposits - totalWithdrawals)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Tarih</th>
                <th className="px-4 py-3 font-medium">Tip</th>
                <th className="px-4 py-3 font-medium">Hesap</th>
                <th className="px-4 py-3 font-medium">Not</th>
                <th className="px-4 py-3 font-medium text-right">Tutar</th>
                <th className="px-4 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {allMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Kayıt bulunamadı.</td>
                </tr>
              ) : (
                allMovements.map(m => (
                  <tr key={m.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(m.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.type === 'DEPOSIT' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                      }`}>
                        {m.type === 'DEPOSIT' ? <><ArrowDownToLine size={12}/> YATIRMA</> : <><ArrowUpFromLine size={12}/> ÇEKME</>}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getAccountName(m.accountId)}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate" title={m.notes}>{m.notes || '-'}</td>
                    <td className={`px-4 py-3 text-right font-medium ${m.type === 'DEPOSIT' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {m.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(m.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(m)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id, m.type as any)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Para Hareketini Düzenle" : "Para Hareketi Ekle"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setType('DEPOSIT')}
              disabled={!!editingId} // Don't allow changing type while editing
              className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${type === 'DEPOSIT' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'} ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              YATIRMA
            </button>
            <button
              type="button"
              onClick={() => setType('WITHDRAWAL')}
              disabled={!!editingId}
              className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${type === 'WITHDRAWAL' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'} ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              ÇEKME
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hesap</label>
            <select
              className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              required
            >
              <option value="" disabled>Hesap Seçin</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Tutar (₺)"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />

          <Input
            label="Tarih"
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />

          <Input
            label="Not (Opsiyonel)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Açıklama girin"
          />

          <div className="pt-4 flex justify-end">
            <Button type="submit">{editingId ? "Güncelle" : "Kaydet"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
