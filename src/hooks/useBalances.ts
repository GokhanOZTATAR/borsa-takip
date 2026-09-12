import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export const useBalances = () => {
  const { transactions } = useTransactions();
  const deposits = useLiveQuery(() => db.deposits.toArray()) || [];
  const withdrawals = useLiveQuery(() => db.withdrawals.toArray()) || [];

  const balances = useMemo(() => {
    const accountBalances: Record<string, number> = {};

    deposits.forEach(d => {
      accountBalances[d.accountId] = (accountBalances[d.accountId] || 0) + d.amount;
    });

    withdrawals.forEach(w => {
      accountBalances[w.accountId] = (accountBalances[w.accountId] || 0) - w.amount;
    });

    transactions.forEach(t => {
      // commission is paid in both BUY and SELL
      const cost = t.totalAmount + (t.commission || 0);
      if (t.type === 'BUY') {
        accountBalances[t.accountId] = (accountBalances[t.accountId] || 0) - cost;
      } else {
        const proceeds = t.totalAmount - (t.commission || 0);
        accountBalances[t.accountId] = (accountBalances[t.accountId] || 0) + proceeds;
      }
    });

    return accountBalances;
  }, [transactions, deposits, withdrawals]);

  return { balances };
};
