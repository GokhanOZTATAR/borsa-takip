import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

export const usePriceSnapshots = () => {
  const snapshots = useLiveQuery(() => db.priceSnapshots.orderBy('timestamp').reverse().toArray()) || [];
  return { snapshots };
};
