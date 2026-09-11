import Dexie, { Table } from 'dexie';
import { Account, Transaction, Withdrawal, Deposit, PriceSnapshot, AppSettings } from '../types';

export class PortfolioDB extends Dexie {
  accounts!: Table<Account, string>;
  transactions!: Table<Transaction, string>;
  withdrawals!: Table<Withdrawal, string>;
  deposits!: Table<Deposit, string>;
  priceSnapshots!: Table<PriceSnapshot, string>;
  settings!: Table<AppSettings, number>; // Tek bir ayar kaydı olacak

  constructor() {
    super('PortfolioDB');
    this.version(1).stores({
      accounts: 'id, name, broker, isActive',
      transactions: 'id, accountId, type, ticker, transactionDate',
      withdrawals: 'id, accountId, date',
      deposits: 'id, accountId, date',
      priceSnapshots: 'id, ticker, timestamp',
      settings: '++id' // Dummy auto-increment key for single row
    });
  }
}

export const db = new PortfolioDB();

// Init default settings if empty
db.on('populate', async () => {
  await db.settings.add({
    pinCode: null,
    isPinEnabled: false,
    theme: 'dark',
    defaultAccountId: null,
    priceApiEnabled: false,
    priceApiUrl: null,
    priceApiKey: null
  } as unknown as AppSettings); // We cast it or adjust the ID
});

export async function getSettings(): Promise<AppSettings> {
  const all = await db.settings.toArray();
  if (all.length > 0) return all[0];
  
  const defaultSettings: AppSettings = {
    pinCode: null,
    isPinEnabled: false,
    theme: 'dark',
    defaultAccountId: null,
    priceApiEnabled: false,
    priceApiUrl: null,
    priceApiKey: null
  };
  await db.settings.add(defaultSettings as any);
  return defaultSettings;
}

export async function updateSettings(updates: Partial<AppSettings>) {
  const all = await db.settings.toArray();
  if (all.length > 0) {
    const id = (all[0] as any).id;
    await db.settings.update(id, updates);
  }
}
