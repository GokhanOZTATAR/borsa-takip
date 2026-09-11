import { useTransactions } from './useTransactions';
import { calculateOpenPositions, calculateRealizedPnL } from '../services/calculations';
import { useMemo } from 'react';

export const useCalculations = () => {
  const { transactions } = useTransactions();

  const openPositions = useMemo(() => calculateOpenPositions(transactions), [transactions]);
  const realizedPnL = useMemo(() => calculateRealizedPnL(transactions), [transactions]);

  return {
    openPositions,
    realizedPnL
  };
};
