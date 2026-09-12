import React, { useState } from 'react';
import { useData } from '../../context';
import { useAccounts } from '../../hooks/useAccounts';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Account } from '../../types';

interface AccountFormProps {
  accountId?: string | null;
  onSuccess: () => void;
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'
];

export function AccountForm({ accountId, onSuccess }: AccountFormProps) {
  const { addAccount, updateAccount } = useData();
  const { accounts } = useAccounts();
  const initialData = accounts.find(a => a.id === accountId);

  const [name, setName] = useState(initialData?.name || '');
  const [broker, setBroker] = useState(initialData?.broker || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [color, setColor] = useState(initialData?.color || COLORS[0]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !broker) {
      setError('Hesap adı ve aracı kurum zorunludur.');
      return;
    }
    
    try {
      if (initialData) {
        await updateAccount(initialData.id, { name, broker, description, color });
      } else {
        await addAccount({ name, broker, description, color });
      }
      onSuccess();
    } catch (err) {
      setError('Kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <Input
        label="Hesap Adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ör: Ana Hesabım"
        autoFocus
      />
      
      <Input
        label="Aracı Kurum"
        value={broker}
        onChange={(e) => setBroker(e.target.value)}
        placeholder="Ör: Garanti Yatırım"
      />
      
      <Input
        label="Açıklama (Opsiyonel)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Kısa vade hisselerim"
      />
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Renk</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button type="submit">{initialData ? 'Güncelle' : 'Kaydet'}</Button>
      </div>
    </form>
  );
};
