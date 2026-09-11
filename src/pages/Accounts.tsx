import React, { useState } from 'react';
import { useAccounts } from '../hooks/useAccounts';
import { useData } from '../context';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { AccountForm } from '../components/forms/AccountForm';
import { Plus, Edit2, Trash2, Wallet } from 'lucide-react';
import { Account } from '../types';

export default function Accounts() {
  const { accounts } = useAccounts();
  const { deleteAccount } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>(undefined);

  const handleEdit = (acc: Account) => {
    setEditingAccount(acc);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu hesabı silmek istediğinize emin misiniz?')) {
      await deleteAccount(id);
    }
  };

  const openNewModal = () => {
    setEditingAccount(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hesaplar</h2>
          <p className="text-slate-500">Portföyünüzü yönettiğiniz aracı kurum hesapları.</p>
        </div>
        <Button onClick={openNewModal} className="gap-2">
          <Plus size={16} />
          Hesap Ekle
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800 mb-4">
            <Wallet size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Henüz hesap eklemediniz</h3>
          <p className="text-slate-500 mb-6 max-w-sm">İşlem yapmaya başlamak için önce bir aracı kurum hesabı oluşturun.</p>
          <Button onClick={openNewModal}>Hesap Ekle</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map(acc => (
            <Card key={acc.id} className="overflow-hidden">
              <div className="h-2 w-full" style={{ backgroundColor: acc.color }} />
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl">{acc.name}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">{acc.broker}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(acc)} className="p-2 text-slate-400 hover:text-blue-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(acc.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {acc.description && <p className="text-sm text-slate-500 mb-4">{acc.description}</p>}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
                  <span className="text-slate-500">Durum</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Aktif</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingAccount ? "Hesabı Düzenle" : "Yeni Hesap Ekle"}
      >
        <AccountForm 
          initialData={editingAccount} 
          onSuccess={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
// Add import for Wallet icon above, missed it initially.
