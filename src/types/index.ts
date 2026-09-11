export interface Account {
  id: string;
  name: string;
  broker: string;
  description?: string;
  color: string;
  createdAt: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: 'BUY' | 'SELL';
  ticker: string;
  stockName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  commission: number;
  transactionDate: string;
  notes?: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Deposit {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface PriceSnapshot {
  id: string;
  ticker: string;
  price: number;
  timestamp: string;
  source: 'MANUAL' | 'API';
}

export interface AppSettings {
  pinCode: string | null;
  isPinEnabled: boolean;
  theme: 'dark' | 'light';
  defaultAccountId: string | null;
  priceApiEnabled: boolean;
  priceApiUrl: string | null;
  priceApiKey: string | null;
}

// Additional derived types
export interface OpenPosition {
  ticker: string;
  stockName: string;
  accountId: string;
  quantity: number;
  averageCost: number;
}
