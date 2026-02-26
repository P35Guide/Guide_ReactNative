import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { AppLanguage, currentPhoneLanguage } from '../constants/i18n';

type AppLanguageContextValue = {
  appLanguage: AppLanguage;
  usesSystemLanguage: boolean;
  setAppLanguage: (next: AppLanguage) => void;
  resetToDeviceLanguage: () => void;
};

const AppLanguageContext = createContext<AppLanguageContextValue | null>(null);

export function AppLanguageProvider({ children }: { children: React.ReactNode }) {
  const [appLanguage, setAppLanguageState] = useState<AppLanguage>(currentPhoneLanguage);
  const [usesSystemLanguage, setUsesSystemLanguage] = useState(true);

  // тримаємо статус, чи ще відображаємося мовою телефону, щоб показати «повернутися» в UI
  const setAppLanguage = useCallback((next: AppLanguage) => {
    setAppLanguageState(next);
    setUsesSystemLanguage(next === currentPhoneLanguage);
  }, []);

  // повертаємося до мови телефона одним тапом
  const resetToDeviceLanguage = useCallback(() => {
    setAppLanguageState(currentPhoneLanguage);
    setUsesSystemLanguage(true);
  }, []);

  const value = useMemo(() => ({
    appLanguage,
    usesSystemLanguage,
    setAppLanguage,
    resetToDeviceLanguage,
  }), [appLanguage, usesSystemLanguage, setAppLanguage, resetToDeviceLanguage]);

  return <AppLanguageContext.Provider value={value}>{children}</AppLanguageContext.Provider>;
}

export function useAppLanguage() {
  const ctx = useContext(AppLanguageContext);
  if (!ctx) throw new Error('useAppLanguage must be used within AppLanguageProvider');
  return ctx;
}
