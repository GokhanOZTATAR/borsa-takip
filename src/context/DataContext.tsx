import { createContext, useContext, ReactNode } from 'react';
import { db } from '../services/db';
import { Account, Transaction, Withdrawal, Deposit, PriceSnapshot, AppSettings } from '../types';
import { generateId } from '../utils/helpers';

interface DataContextType {
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'isActive'>) => Promise<string>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<number>;
  deleteAccount: (id: string) => Promise<number>;
  
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<string>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addPriceSnapshot: (snap: Omit<PriceSnapshot, 'id'>) => Promise<string>;
  
  addWithdrawal: (w: Omit<Withdrawal, 'id' | 'createdAt'>) => Promise<string>;
  updateWithdrawal: (id: string, updates: Partial<Withdrawal>) => Promise<number>;
  deleteWithdrawal: (id: string) => Promise<void>;
  addDeposit: (d: Omit<Deposit, 'id' | 'createdAt'>) => Promise<string>;
  updateDeposit: (id: string, updates: Partial<Deposit>) => Promise<number>;
  deleteDeposit: (id: string) => Promise<void>;
  
  exportData: () => Promise<string>;
  importData: (jsonData: string, overwrite?: boolean) => Promise<void>;
  resetData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  
  const addAccount = async (account: Omit<Account, 'id' | 'createdAt' | 'isActive'>) => {
    const id = generateId();
    await db.accounts.add({
      ...account,
      id,
      createdAt: new Date().toISOString(),
      isActive: true
    });
    return id;
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    return await db.accounts.update(id, updates);
  };

  const deleteAccount = async (id: string) => {
    // Soft delete
    return await db.accounts.update(id, { isActive: false });
  };

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const id = generateId();
    await db.transactions.add({
      ...tx,
      id,
      createdAt: new Date().toISOString()
    });
    return id;
  };

  const deleteTransaction = async (id: string) => {
    await db.transactions.delete(id);
  };

  const addPriceSnapshot = async (snap: Omit<PriceSnapshot, 'id'>) => {
    const id = generateId();
    await db.priceSnapshots.add({
      ...snap,
      id
    });
    return id;
  };

  const addWithdrawal = async (w: Omit<Withdrawal, 'id' | 'createdAt'>) => {
    const id = generateId();
    await db.withdrawals.add({
      ...w,
      id,
      createdAt: new Date().toISOString()
    });
    return id;
  };

  const updateWithdrawal = async (id: string, updates: Partial<Withdrawal>) => {
    return await db.withdrawals.update(id, updates);
  };

  const deleteWithdrawal = async (id: string) => {
    await db.withdrawals.delete(id);
  };

  const addDeposit = async (d: Omit<Deposit, 'id' | 'createdAt'>) => {
    const id = generateId();
    await db.deposits.add({
      ...d,
      id,
      createdAt: new Date().toISOString()
    });
    return id;
  };

  const updateDeposit = async (id: string, updates: Partial<Deposit>) => {
    return await db.deposits.update(id, updates);
  };

  const deleteDeposit = async (id: string) => {
    await db.deposits.delete(id);
  };

  const exportData = async () => {
    const data = {
      accounts: await db.accounts.toArray(),
      transactions: await db.transactions.toArray(),
      withdrawals: await db.withdrawals.toArray(),
      deposits: await db.deposits.toArray(),
      priceSnapshots: await db.priceSnapshots.toArray(),
      settings: await db.settings.toArray()
    };
    return JSON.stringify(data);
  };

  const importData = async (jsonData: string, overwrite: boolean = false) => {
    const data = JSON.parse(jsonData);
    
    await db.transaction('rw', [db.accounts, db.transactions, db.withdrawals, db.deposits, db.priceSnapshots, db.settings], async () => {
      if (overwrite) {
        await Promise.all([
          db.accounts.clear(),
          db.transactions.clear(),
          db.withdrawals.clear(),
          db.deposits.clear(),
          db.priceSnapshots.clear(),
          db.settings.clear()
        ]);
      }
      
      if (data.accounts) await db.accounts.bulkAdd(data.accounts);
      if (data.transactions) await db.transactions.bulkAdd(data.transactions);
      if (data.withdrawals) await db.withdrawals.bulkAdd(data.withdrawals);
      if (data.deposits) await db.deposits.bulkAdd(data.deposits);
      if (data.priceSnapshots) await db.priceSnapshots.bulkAdd(data.priceSnapshots);
      if (data.settings) await db.settings.bulkAdd(data.settings);
    });
  };

  const resetData = async () => {
    await Promise.all([
      db.accounts.clear(),
      db.transactions.clear(),
      db.withdrawals.clear(),
      db.deposits.clear(),
      db.priceSnapshots.clear(),
      db.settings.clear()
    ]);
    // Re-populate settings
    await db.settings.add({
      pinCode: null,
      isPinEnabled: false,
      theme: 'dark',
      defaultAccountId: null,
      priceApiEnabled: false,
      priceApiUrl: null,
      priceApiKey: null
    } as unknown as AppSettings);
  };

  return (
    <DataContext.Provider value={{
      addAccount, updateAccount, deleteAccount,
      addTransaction, deleteTransaction,
      addPriceSnapshot,
      addWithdrawal, updateWithdrawal, deleteWithdrawal, 
      addDeposit, updateDeposit, deleteDeposit,
      exportData, importData, resetData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
