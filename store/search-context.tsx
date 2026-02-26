// всі налаштування пошуку радіус і тд
import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { api } from '../api';
import type { Place, SearchSettings } from '../types/search';
import { currentPhoneLanguage, t } from '../constants/i18n';
import { useAppLanguage } from './app-language-context';

type SearchContextValue = {
  settings: SearchSettings;
  setSettings: (next: Partial<SearchSettings>) => void;
  toggleIncluded: (value: string) => void;
  toggleExcluded: (value: string) => void;
  places: Place[];
  loading: boolean;
  runSearch: () => Promise<boolean>;
};

// спільне сховище для фільтрів, статусу завантаження та результатів
const SearchContext = createContext<SearchContextValue | null>(null);

// приводить число до дозволеного діапазону
// якщо ввід некоректний, повертає запасне значення
const clampNumber = (value: string, min: number, max: number, fallback: number) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(num)));
};

// тут живе весь стан пошуку
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const { appLanguage } = useAppLanguage();
  const [settings, setSettingsState] = useState<SearchSettings>({
    radius: '1000',
    maxResults: '10',
    includedTypes: ['restaurant'],
    excludedTypes: [],
    // за замовчуванням не фільтруємо тільки відкриті
    openNowOnly: false,
    languageCode: currentPhoneLanguage,
    rankPreference: 'POPULARITY',
  });
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  // оновлюємо тільки ті поля, що прийшли, інші залишаємо як є
  const setSettings = useCallback((next: Partial<SearchSettings>) => {
    setSettingsState(prev => ({ ...prev, ...next }));
  }, []);

  // синхронізуємо мову відповіді api з мовою інтерфейсу
  useEffect(() => {
    setSettingsState(prev => (prev.languageCode === appLanguage ? prev : { ...prev, languageCode: appLanguage }));
  }, [appLanguage]);

  // додає або прибирає тип у бажані і удаляє з виключити якщо есть
  const toggleIncluded = useCallback((value: string) => {
    setSettingsState(prev => ({
      ...prev,
      includedTypes: prev.includedTypes.includes(value)
        ? prev.includedTypes.filter(v => v !== value)
        : [...prev.includedTypes, value],
      excludedTypes: prev.excludedTypes.filter(v => v !== value)
    }));
  }, []);

  // додає або прибирає тип у виключити, якщо є цей самий в вкоючити то прибираемо
  const toggleExcluded = useCallback((value: string) => {
    setSettingsState(prev => ({
      ...prev,
      excludedTypes: prev.excludedTypes.includes(value)
        ? prev.excludedTypes.filter(v => v !== value)
        : [...prev.excludedTypes, value],
      includedTypes: prev.includedTypes.filter(v => v !== value)
    }));
  }, []);

  // прошу доступ до гео, беру координати, запитую місця, дотягаю фото
  const runSearch = useCallback(async () => {
    setLoading(true);
    try {
      // доступ до геолокації
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('errorTitle', appLanguage), t('gpsRequired', appLanguage));
        return false;
      }

      // координати користувача
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      // перевіряємо числові поля
      const radiusValue = clampNumber(settings.radius, 1000, 50000, 1000);
      const maxResultsValue = clampNumber(settings.maxResults, 1, 20, 10);

      // базовий об'єкт запиту
      const payload: any = {
        locationRestriction: {
          circle: {
            center: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
            radius: radiusValue
          }
        },
        languageCode: settings.languageCode,
        rankPreference: settings.rankPreference,
        maxResultCount: maxResultsValue,
      };

      // додаємо типи тільки якщо вони вибрані
      if (settings.includedTypes.length > 0) payload.includedTypes = settings.includedTypes;
      if (settings.excludedTypes.length > 0) payload.excludedTypes = settings.excludedTypes;

      // якщо openNowOnly=true бекенд відфільтрує тільки відкриті місця
      const data = await api.places.searchNearby(payload, settings.openNowOnly);
      const list = data.places ?? [];

      // фото тягнемо паралельно, але не більше за ліміт результатів
      const photoLimit = maxResultsValue;
      const withPhotos = await Promise.all( // для кожного місця тягнемо фото, якщо є id і не перевищено ліміт
        list.map(async (p: any, index: number) => {
          if (!p.id || index >= photoLimit) return { ...p, imageUri: null };
          const urls = await api.places.getPhotoUrls(p.id, 600);
          return { ...p, imageUri: urls?.[0] ?? null };
        })
      );

      // зберігаємо результат для екрана місця
      setPlaces(withPhotos);
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      const hint = message.includes('Server error:')
        ? ` ${t('invalidTypeHint', appLanguage)}`
        : '';
      Alert.alert(t('errorTitle', appLanguage), `${t('loadFailed', appLanguage)}${hint}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [settings]);

  const value = useMemo(() => ({
    settings,
    setSettings,
    toggleIncluded,
    toggleExcluded,
    places,
    loading,
    runSearch
  }), [settings, setSettings, toggleIncluded, toggleExcluded, places, loading, runSearch]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
