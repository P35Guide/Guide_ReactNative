import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, Switch } from 'react-native';
import { useSearch } from '../store/search-context';
import { globalStyles, theme } from '../styles';

type TypeOption = {
  label: string;
  value: string;
};

// константо для фільтрів типа більш популярні
const POPULAR_TYPES: TypeOption[] = [
  { label: 'Ресторани', value: 'restaurant' },
  { label: 'Кавʼярні', value: 'coffee_shop' },
  { label: 'Піцерії', value: 'pizza_restaurant' },
  { label: 'Фастфуд', value: 'fast_food_restaurant' },
  { label: 'Пекарні', value: 'bakery' },
  { label: 'Суші', value: 'sushi_restaurant' },
  { label: 'Бари', value: 'bar' },
  { label: 'Музеї', value: 'museum' },
  { label: 'Парки', value: 'park' },
  { label: 'Шопінг', value: 'shopping_mall' },
];

// мови відповіді від api ! todo
const LANGUAGE_OPTIONS = [
  { label: 'Українська', value: 'uk' },
  { label: 'English', value: 'en' },
];

// варіанти сортування, які підтримує api.
const SORT_OPTIONS = [
  { label: 'Популярність', value: 'POPULARITY' },
  { label: 'Відстань', value: 'DISTANCE' },
];

// базові псевдоніми для найчастіших введень українською/транслітом.
const CUSTOM_TYPE_ALIASES: Record<string, string> = {
  'стадіон': 'stadium',
  'stadion': 'stadium',
  'поле': 'athletic_field',
  'футбольне_поле': 'athletic_field',
  'футбольне поле': 'athletic_field',
  'спортзал': 'gym',
  'спортивний_зал': 'gym',
  'зал': 'gym',
  'парк': 'park',
  'музей': 'museum',
  'ресторан': 'restaurant',
  'кафе': 'cafe',
  'кавярня': 'coffee_shop',
  "кав'ярня": 'coffee_shop',
  'кофейня': 'coffee_shop',
  'бар': 'bar',
  'клуб': 'night_club',
  'готель': 'hotel',
  'аптека': 'pharmacy',
  'лікарня': 'hospital',
  'магазин': 'store',
  'супермаркет': 'supermarket',
  'торговий_центр': 'shopping_mall',
  'торговий центр': 'shopping_mall',
  'тц': 'shopping_mall',
  'школа': 'school',
  'університет': 'university',
  'банк': 'bank',
  'пошта': 'post_office',
  'азс': 'gas_station',
  'заправка': 'gas_station',
  'метро': 'subway_station',
};

// google places очікує типи у форматі snake_case англійською.
const VALID_PLACE_TYPE_RE = /^[a-z]+(?:_[a-z]+)*$/;
const CYRILLIC_RE = /[а-яіїєґ]/i;

// проста таблиця транслітерації для українського вводу.
const UKR_TO_LAT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z',
  и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ь: '', ю: 'iu', я: 'ia',
};

// екран фільтрів: налаштування + запуск пошуку.
export default function FiltersForm() {
  const router = useRouter();
  const { settings, setSettings, toggleIncluded, toggleExcluded, loading, runSearch } = useSearch();
  const [customInc, setCustomInc] = React.useState('');
  const [customExc, setCustomExc] = React.useState('');

  // прибираємо зайві пробіли й робимо єдиний формат рядка.
  const normalizeInput = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[’`']/g, "'")
      .replace(/\s+/g, ' ');

  // перетворюємо текст у snake_case.
  const toSnake = (value: string) =>
    value
      .replace(/['’`]/g, '')
      .replace(/[\s-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');

  // перетворюємо українські літери на латиницю.
  const transliterateUkr = (value: string) =>
    [...value].map(ch => UKR_TO_LAT[ch] ?? ch).join('');

  // намагаємось отримати валідний type-код:
  // 1) шукаємо в словнику
  // 2) пробуємо трансліт
  // 3) якщо вже валідний англ. код — повертаємо його
  const resolvePlaceType = (value: string) => {
    const normalized = normalizeInput(value);
    if (!normalized) return null;

    const normalizedSnake = toSnake(normalized);
    const aliasDirect = CUSTOM_TYPE_ALIASES[normalized] ?? CUSTOM_TYPE_ALIASES[normalizedSnake];
    if (aliasDirect) return aliasDirect;

    const transliterated = transliterateUkr(normalized);
    const transliteratedSnake = toSnake(transliterated);
    const aliasTranslit =
      CUSTOM_TYPE_ALIASES[transliterated] ?? CUSTOM_TYPE_ALIASES[transliteratedSnake];
    if (aliasTranslit) return aliasTranslit;

    if (CYRILLIC_RE.test(normalized)) return null;
    return VALID_PLACE_TYPE_RE.test(normalizedSnake) ? normalizedSnake : null;
  };

  // додає кастомний тип у вибраний список.
  const addCustomType = (val: string, onAdd: (value: string) => void, clear: () => void) => {
    const next = resolvePlaceType(val);
    if (!next) {
      Alert.alert(
        'Невірний тип',
        'Спробуй український синонім(одне слово) або англійською'
      );
      return;
    }

    onAdd(next);
    clear();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={globalStyles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={globalStyles.contentPadding}>
          {/* верхній з назвою та коротким описом */}
          <View style={globalStyles.hero}>
            <View>
              <Text style={globalStyles.heroTitle}>YumMap</Text>
              <Text style={globalStyles.heroSubtitle}>Налаштуй і шукай</Text>
            </View>
            <View style={globalStyles.heroBadge}>
              <Text style={globalStyles.heroBadgeText}>{settings.radius} м</Text>
            </View>
          </View>

          {/* вибір мови запиту до арі */}
          <View style={globalStyles.settingsBlock}>
            <Text style={globalStyles.label}>Language</Text>
            <View style={globalStyles.chipContainer}>
              {LANGUAGE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setSettings({ languageCode: opt.value })} // todo 
                  style={[
                    globalStyles.chip,
                    settings.languageCode === opt.value && globalStyles.chipSelectedPrimary
                  ]}
                >
                  <Text style={[globalStyles.chipText, settings.languageCode === opt.value && globalStyles.chipTextSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* радіус і максимальна кількість результатів */}
          <View style={[globalStyles.settingsBlock, globalStyles.settingsRow]}>
            <View style={globalStyles.settingsColumn}>
              <Text style={globalStyles.label}>Радіус (м)</Text>
              <TextInput
                value={settings.radius}
                onChangeText={(val) => setSettings({ radius: val })}
                keyboardType="numeric"
                style={globalStyles.input}
                placeholder="1000"
                placeholderTextColor={theme.textLight}
              />
              <Text style={globalStyles.helperText}>Мінімум 1000</Text>
            </View>
            <View style={globalStyles.settingsColumn}>
              <Text style={globalStyles.label}>Максимум</Text>
              <TextInput
                value={settings.maxResults}
                onChangeText={(val) => setSettings({ maxResults: val })}
                keyboardType="numeric"
                style={globalStyles.input}
                placeholder="10"
                placeholderTextColor={theme.textLight}
              />
              <Text style={globalStyles.helperText}>Від 1 до 20 результатів</Text>
            </View>
          </View>

          {/* перемикач: шукати тільки місця, які відкриті зараз */}
          <View style={globalStyles.settingsBlock}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={globalStyles.label}>Лише відкриті зараз</Text>
                <Text style={globalStyles.helperText}>
                  Увімкни, щоб бекенд повертав тільки заклади зі статусом «Відчинено».
                </Text>
              </View>
              <Switch
                value={settings.openNowOnly}
                onValueChange={(val) => setSettings({ openNowOnly: val })}
                trackColor={{ false: '#CBD5E1', true: '#FFB08F' }}
                thumbColor={settings.openNowOnly ? '#FF7A45' : '#F8FAFC'}
              />
            </View>
          </View>

          {/* типи, які обов’язково включаємо в пошук */}
          <View style={globalStyles.settingsBlock}>
            <Text style={[globalStyles.label, { color: theme.accentGreen }]}>Додати бажання</Text>
            <View style={globalStyles.chipContainer}>
              {POPULAR_TYPES.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => toggleIncluded(opt.value)}
                  style={[
                    globalStyles.chip,
                    settings.includedTypes.includes(opt.value) && globalStyles.chipSelectedGreen
                  ]}
                >
                  <Text style={[globalStyles.chipText, settings.includedTypes.includes(opt.value) && globalStyles.chipTextSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
              {settings.includedTypes
                .filter(t => !POPULAR_TYPES.find(p => p.value === t))
                .map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => toggleIncluded(t)}
                    style={[globalStyles.chip, globalStyles.chipSelectedGreen]}
                  >
                    <Text style={globalStyles.chipTextSelected}>{t}</Text>
                  </TouchableOpacity>
                ))}
            </View>
            <View style={globalStyles.inputRow}>
              <TextInput
                value={customInc}
                onChangeText={setCustomInc}
                placeholder=""
                style={[globalStyles.input, globalStyles.inputCompact]}
                autoCapitalize="none"
              />
              {/* додаємо користувацький тип */}
              <TouchableOpacity
                onPress={() => addCustomType(customInc, (value) => toggleIncluded(value), () => setCustomInc(''))}
                style={[globalStyles.addButton, { backgroundColor: theme.accentGreen }]}
              >
                <Text style={globalStyles.addButtonText}>Додати</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* типи, які треба виключити */}
          <View style={globalStyles.settingsBlock}>
            <Text style={[globalStyles.label, { color: theme.accentRed }]}>Не хочу бачити</Text>
            <View style={globalStyles.chipContainer}>
              {POPULAR_TYPES.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => toggleExcluded(opt.value)}
                  style={[
                    globalStyles.chip,
                    settings.excludedTypes.includes(opt.value) && globalStyles.chipSelectedRed
                  ]}
                >
                  <Text style={[globalStyles.chipText, settings.excludedTypes.includes(opt.value) && globalStyles.chipTextSelected]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
              {settings.excludedTypes
                .filter(t => !POPULAR_TYPES.find(p => p.value === t))
                .map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => toggleExcluded(t)}
                    style={[globalStyles.chip, globalStyles.chipSelectedRed]}
                  >
                    <Text style={globalStyles.chipTextSelected}>{t}</Text>
                  </TouchableOpacity>
                ))}
            </View>
            <View style={globalStyles.inputRow}>
              <TextInput
                value={customExc}
                onChangeText={setCustomExc}
                placeholder=""
                style={[globalStyles.input, globalStyles.inputCompact]}
                autoCapitalize="none"
              />
              {/* додаємо користувацький тип у виключення */}
              <TouchableOpacity
                onPress={() => addCustomType(customExc, (value) => toggleExcluded(value), () => setCustomExc(''))}
                style={[globalStyles.addButton, { backgroundColor: theme.accentRed }]}
              >
                <Text style={globalStyles.addButtonText}>Додати</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* сортування результатів */}
          <View style={globalStyles.settingsBlock}>
            <Text style={globalStyles.label}>Сортування</Text>
            <View style={globalStyles.segmented}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setSettings({ rankPreference: opt.value as any })}
                  style={[
                    globalStyles.segment,
                    settings.rankPreference === opt.value && globalStyles.segmentActive
                  ]}
                >
                  <Text style={[globalStyles.segmentText, settings.rankPreference === opt.value && globalStyles.segmentTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* кЗнопка запуску пошуку */}
          <TouchableOpacity
            style={globalStyles.button}
            onPress={async () => {
              const ok = await runSearch();
              if (ok) router.push('/(tabs)/places');
            }}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={globalStyles.buttonText}>Пошук поруч</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
