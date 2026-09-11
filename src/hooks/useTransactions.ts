import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export const useTransactions = () => {
  const transactions = useLiveQuery(() => db.transactions.orderBy('transactionDate').reverse().toArray()) || [];
  return { transactions };
};
