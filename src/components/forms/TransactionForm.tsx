import React, { useState } from 'react';
import { useData } from '../../context';
import { useAccounts } from '../../hooks/useAccounts';
import { useBalances } from '../../hooks/useBalances';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TransactionFormProps {
  onSuccess: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
  const { addTransaction } = useData();
  const { accounts } = useAccounts();
  const { balances } = useBalances();

  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [commission, setCommission] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountId || !ticker || !quantity || !price) {
      setError('Lütfen zorunlu alanları doldurun.');
      return;
    }

    const qty = Number(quantity);
    const prc = Number(price);
    const comm = commission === '' ? 0 : Number(commission);

    if (qty <= 0 || prc <= 0) {
      setError('Adet ve fiyat 0\'dan büyük olmalıdır.');
      return;
    }

    const totalCost = (qty * prc) + comm;
    const currentBalance = balances[accountId] || 0;

    if (type === 'BUY' && totalCost > currentBalance) {
      setError(`Yetersiz bakiye! Bu işlem için ${totalCost.toLocaleString('tr-TR')} ₺ gerekiyor ancak hesabınızda ${currentBalance.toLocaleString('tr-TR')} ₺ nakit var. Önce 'Para Hareketleri'nden nakit yatırın.`);
      return;
    }

    try {
      await addTransaction({
        accountId,
        type,
        ticker: ticker.toUpperCase(),
        stockName: ticker.toUpperCase(), // Temporary, will enhance later
        quantity: qty,
        pricePerUnit: prc,
        totalAmount: qty * prc,
        commission: commission === '' ? 0 : Number(commission),
        transactionDate: new Date(date).toISOString(),
      });
      onSuccess();
    } catch (err) {
      setError('İşlem kaydedilirken hata oluştu.');
    }
  };

  if (accounts.length === 0) {
    return <div className="text-center text-red-500">Lütfen önce bir hesap ekleyin.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <button
          type="button"
          onClick={() => setType('BUY')}
          className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${type === 'BUY' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
        >
          ALIM
        </button>
        <button
          type="button"
          onClick={() => setType('SELL')}
          className={`flex-1 py-2 rounded-md font-medium text-sm transition-colors ${type === 'SELL' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
        >
          SATIM
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hesap</label>
        <select
          className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
          value={accountId}
          onChange={e => setAccountId(e.target.value)}
        >
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name} ({a.broker})</option>
          ))}
        </select>
      </div>

      <Input
        label="Hisse Kodu"
        placeholder="Ör: THYAO"
        value={ticker}
        onChange={e => setTicker(e.target.value.toUpperCase())}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Adet"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
        />
        <Input
          label="Birim Fiyat (₺)"
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Komisyon (₺)"
          type="number"
          min="0"
          step="0.01"
          value={commission}
          onChange={e => setCommission(e.target.value)}
          placeholder="0.00"
        />
        <Input
          label="Tarih"
          type="datetime-local"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit">İşlemi Kaydet</Button>
      </div>
    </form>
  );
};
