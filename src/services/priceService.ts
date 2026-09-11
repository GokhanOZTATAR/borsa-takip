import { db } from './db';
import { AppSettings, PriceSnapshot } from '../types';

export interface PriceProvider {
  fetchPrice(ticker: string): Promise<number | null>;
  fetchMultiplePrices(tickers: string[]): Promise<Map<string, number>>;
  isAvailable(): boolean;
}

class ManualPriceProvider implements PriceProvider {
  async fetchPrice(ticker: string): Promise<number | null> {
    const snaps = await db.priceSnapshots.where('ticker').equals(ticker).reverse().sortBy('timestamp');
    return snaps.length > 0 ? snaps[0].price : null;
  }

  async fetchMultiplePrices(tickers: string[]): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    for (const t of tickers) {
      const price = await this.fetchPrice(t);
      if (price !== null) map.set(t, price);
    }
    return map;
  }

  isAvailable(): boolean {
    return true;
  }
}

class ApiPriceProvider implements PriceProvider {
  constructor(private apiUrl: string, private apiKey: string) {}

  async fetchPrice(_ticker: string): Promise<number | null> {
    // Gelecekte API çağrısı yapılacak yer
    return null; 
  }

  async fetchMultiplePrices(_tickers: string[]): Promise<Map<string, number>> {
    return new Map();
  }

  isAvailable(): boolean {
    return !!this.apiUrl && !!this.apiKey;
  }
}

export async function createPriceProvider(): Promise<PriceProvider> {
  const settingsArray = await db.settings.toArray();
  const settings = settingsArray.length > 0 ? settingsArray[0] : null;

  if (settings && settings.priceApiEnabled && settings.priceApiUrl) {
    return new ApiPriceProvider(settings.priceApiUrl, settings.priceApiKey || '');
  }
  return new ManualPriceProvider();
}
