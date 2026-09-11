import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export const useAccounts = () => {
  const accounts = useLiveQuery(() => db.accounts.filter(a => a.isActive).toArray()) || [];
  const allAccounts = useLiveQuery(() => db.accounts.toArray()) || [];

  return { accounts, allAccounts };
};
