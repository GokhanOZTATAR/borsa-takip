import React, { useState } from 'react';
import { useAuth } from '../context';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Lock } from 'lucide-react';

export default function PinScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(pin);
    if (success) {
      navigate('/');
    } else {
      setError('Hatalı PIN kodu.');
      setPin('');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Hoş Geldiniz</CardTitle>
          <p className="text-sm text-slate-500">Devam etmek için PIN kodunuzu girin.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <Input
              type="password"
              placeholder="••••"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="text-center text-2xl tracking-widest"
              autoFocus
              maxLength={6}
            />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full">Giriş Yap</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
