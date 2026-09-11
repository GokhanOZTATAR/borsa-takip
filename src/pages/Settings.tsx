import React, { useState, useEffect } from 'react';
import { useData, useTheme, useAuth } from '../context';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getSettings, updateSettings } from '../services/db';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { exportData, importData, resetData } = useData();
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [importJson, setImportJson] = useState('');

  useEffect(() => {
    getSettings().then(s => {
      setIsPinEnabled(s.isPinEnabled);
    });
  }, []);

  const handlePinToggle = async () => {
    const newValue = !isPinEnabled;
    setIsPinEnabled(newValue);
    await updateSettings({ isPinEnabled: newValue });
    if (!newValue) {
      await updateSettings({ pinCode: null });
      setPinCode('');
    }
  };

  const handlePinSave = async () => {
    if (pinCode.length >= 4 && pinCode.length <= 6) {
      const { hashPin } = await import('../utils/helpers');
      const hashed = await hashPin(pinCode);
      await updateSettings({ pinCode: hashed, isPinEnabled: true });
      alert('PIN kodu başarıyla kaydedildi.');
      setPinCode('');
    } else {
      alert('PIN kodu 4 ile 6 hane arasında olmalıdır.');
    }
  };

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `borsa-portfoy-yedek-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importJson) return;
    try {
      await importData(importJson, true);
      alert('Veriler başarıyla içe aktarıldı. Sayfa yenileniyor...');
      window.location.reload();
    } catch (e) {
      alert('İçe aktarma hatası: Geçersiz JSON veya veri formatı.');
    }
  };

  const handleReset = async () => {
    if (window.confirm('TÜM VERİLERİ SİLMEK istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      if (window.confirm('Son kararınız mı? (Veriler tamamen silinecek)')) {
        await resetData();
        alert('Tüm veriler sıfırlandı.');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ayarlar</h2>
        <p className="text-slate-500">Uygulama tercihlerinizi ve veri yönetiminizi buradan yapabilirsiniz.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Görünüm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Tema: {theme === 'dark' ? 'Koyu' : 'Açık'}</span>
              <Button onClick={toggleTheme} variant="outline">
                Temayı Değiştir
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Güvenlik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <span>Uygulama Kilidi (PIN)</span>
              <Button onClick={handlePinToggle} variant={isPinEnabled ? 'danger' : 'primary'}>
                {isPinEnabled ? 'Kapat' : 'Aç'}
              </Button>
            </div>
            
            {isPinEnabled && (
              <div className="flex gap-2 items-end">
                <Input
                  label="Yeni PIN Belirle (4-6 Hane)"
                  type="password"
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={6}
                />
                <Button onClick={handlePinSave}>Kaydet</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Veri Yönetimi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
              <h4 className="font-medium mb-2">Dışa Aktar (Yedekle)</h4>
              <p className="text-sm text-slate-500 mb-4">Tüm verilerinizi JSON dosyası olarak bilgisayarınıza indirebilirsiniz.</p>
              <Button onClick={handleExport} variant="secondary">Yedeği İndir (.json)</Button>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
              <h4 className="font-medium mb-2">İçe Aktar (Geri Yükle)</h4>
              <p className="text-sm text-slate-500 mb-4">Önceden aldığınız JSON yedeğini buraya yapıştırarak verilerinizi geri yükleyebilirsiniz. <strong className="text-red-500">Mevcut veriler silinir!</strong></p>
              <textarea
                className="w-full h-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 mb-2 font-mono"
                placeholder='{"accounts": [...], "transactions": [...]}'
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
              />
              <Button onClick={handleImport} variant="secondary">Verileri İçe Aktar</Button>
            </div>

            <div>
              <h4 className="font-medium text-red-500 mb-2">Tehlikeli Bölge</h4>
              <p className="text-sm text-slate-500 mb-4">Tüm uygulama verilerini (hesaplar, işlemler, ayarlar) kalıcı olarak siler.</p>
              <Button onClick={handleReset} variant="danger">Tüm Verileri Sıfırla</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
