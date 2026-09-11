import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings } from '../services/db';
import { hashPin } from '../utils/helpers';

interface AuthContextType {
  isAuthenticated: boolean;
  isPinEnabled: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isPinEnabled, setIsPinEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getSettings().then(settings => {
      setIsPinEnabled(settings.isPinEnabled && !!settings.pinCode);
      if (!settings.isPinEnabled || !settings.pinCode) {
        setIsAuthenticated(true);
      } else {
        const sessionAuth = sessionStorage.getItem('isAuthenticated');
        if (sessionAuth === 'true') setIsAuthenticated(true);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (pin: string) => {
    const settings = await getSettings();
    if (!settings.pinCode) return false;
    
    const hashedInput = await hashPin(pin);
    if (hashedInput === settings.pinCode) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isPinEnabled, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
