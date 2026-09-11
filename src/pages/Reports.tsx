import React from 'react';
import { useCalculations } from '../hooks/useCalculations';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatCurrency } from '../utils/helpers';

export default function Reports() {
  const { realizedPnL } = useCalculations();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Raporlar</h2>
        <p className="text-slate-500">Portföyünüzün genel raporları.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Genel Performans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Toplam Gerçekleşmiş Kar/Zarar</span>
                <span className={`text-xl font-bold ${realizedPnL > 0 ? 'text-green-600' : realizedPnL < 0 ? 'text-red-600' : ''}`}>
                  {realizedPnL > 0 ? '+' : ''}{formatCurrency(realizedPnL)}
                </span>
              </div>
              <p className="text-sm text-slate-500">Detaylı rapor grafikleri çok yakında eklenecektir.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
