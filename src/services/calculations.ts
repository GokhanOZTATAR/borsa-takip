import { Transaction, OpenPosition } from '../types';

export const calculateOpenPositions = (transactions: Transaction[]): OpenPosition[] => {
  // Group by account and ticker
  const groups: Record<string, Transaction[]> = {};
  
  transactions.forEach(t => {
    const key = `${t.accountId}_${t.ticker}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  const positions: OpenPosition[] = [];

  for (const [key, txs] of Object.entries(groups)) {
    const [accountId, ticker] = key.split('_');
    const stockName = txs[0].stockName;
    
    // Sort ascending by date for FIFO
    txs.sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());

    let buyQueue: { qty: number; price: number }[] = [];

    for (const t of txs) {
      if (t.type === 'BUY') {
        buyQueue.push({ qty: t.quantity, price: t.pricePerUnit });
      } else if (t.type === 'SELL') {
        let remainingToSell = t.quantity;
        while (remainingToSell > 0 && buyQueue.length > 0) {
          const firstBuy = buyQueue[0];
          if (firstBuy.qty <= remainingToSell) {
            remainingToSell -= firstBuy.qty;
            buyQueue.shift(); // Remove it completely
          } else {
            firstBuy.qty -= remainingToSell;
            remainingToSell = 0;
          }
        }
      }
    }

    const remainingQty = buyQueue.reduce((sum, item) => sum + item.qty, 0);
    if (remainingQty > 0) {
      const totalCost = buyQueue.reduce((sum, item) => sum + (item.qty * item.price), 0);
      positions.push({
        accountId,
        ticker,
        stockName,
        quantity: remainingQty,
        averageCost: totalCost / remainingQty
      });
    }
  }

  return positions;
};

export const calculateRealizedPnL = (transactions: Transaction[]): number => {
  let totalPnL = 0;
  
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    const key = `${t.accountId}_${t.ticker}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  for (const txs of Object.values(groups)) {
    txs.sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());

    let buyQueue: { qty: number; price: number }[] = [];

    for (const t of txs) {
      if (t.type === 'BUY') {
        buyQueue.push({ qty: t.quantity, price: t.pricePerUnit });
        totalPnL -= t.commission || 0; // subtract commission
      } else if (t.type === 'SELL') {
        let remainingToSell = t.quantity;
        totalPnL -= t.commission || 0;

        while (remainingToSell > 0 && buyQueue.length > 0) {
          const firstBuy = buyQueue[0];
          let matchedQty = 0;
          if (firstBuy.qty <= remainingToSell) {
            matchedQty = firstBuy.qty;
            remainingToSell -= firstBuy.qty;
            buyQueue.shift();
          } else {
            matchedQty = remainingToSell;
            firstBuy.qty -= remainingToSell;
            remainingToSell = 0;
          }
          const profit = (t.pricePerUnit - firstBuy.price) * matchedQty;
          totalPnL += profit;
        }
      }
    }
  }

  return totalPnL;
};
