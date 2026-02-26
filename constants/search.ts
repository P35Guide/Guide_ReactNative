import type { RankPreference, TypeOption } from '../types/search';

// готові варіанти типів для швидкого вибору.
export const POPULAR_TYPES: TypeOption[] = [
  { label: 'ресторани', value: 'restaurant' },
  { label: 'кавʼярні', value: 'coffee_shop' },
  { label: 'піцерії', value: 'pizza_restaurant' },
  { label: 'фастфуд', value: 'fast_food_restaurant' },
  { label: 'пекарні', value: 'bakery' },
  { label: 'суші', value: 'sushi_restaurant' },
  { label: 'бари', value: 'bar' },
  { label: 'музеї', value: 'museum' },
  { label: 'парки', value: 'park' },
  { label: 'шопінг', value: 'shopping_mall' },
];
// мова відповіді від api.
export const LANGUAGE_OPTIONS: TypeOption[] = [
  { label: 'українська', value: 'uk' },
  { label: 'english', value: 'en' },
];

// способи сортування, які розуміє api.
export const SORT_OPTIONS: Array<{ label: string; value: RankPreference }> = [
  { label: 'популярність', value: 'POPULARITY' },
  { label: 'відстань', value: 'DISTANCE' },
];

// словник: що ввів користувач який type-код відправити в google places
export const CUSTOM_TYPE_ALIASES: Record<string, string> = {
  'стадіон': 'stadium',
  'stadion': 'stadium',
  'поле': 'athletic_field',
  'футбольне поле': 'athletic_field',
  'спортзал': 'gym',
  'парк': 'park',
  'музей': 'museum',
  'ресторан': 'restaurant',
  'кафе': 'cafe',
  'кавярня': 'coffee_shop',
  "кав'ярня": 'coffee_shop',
  'кофейня': 'coffee_shop',
  'бар': 'bar',
  'готель': 'hotel',
  'аптека': 'pharmacy',
  'лікарня': 'hospital',
  'магазин': 'store',
  'супермаркет': 'supermarket',
  'торговий центр': 'shopping_mall',
  'тц': 'shopping_mall',
  'школа': 'school',
  'університет': 'university',
  'банк': 'bank',
  'пошта': 'post_office',
  'азс': 'gas_station',
  'заправка': 'gas_station',
  'метро': 'subway_station',
  'клуб': 'night_club',
};

// google places приймає типи тільки англійською в snake_case
export const VALID_PLACE_TYPE_RE = /^[a-z]+(?:_[a-z]+)*$/;
export const CYRILLIC_RE = /[а-яіїєґ]/i;

// проста таблиця відповідність букв для українського вводу.
export const UKR_TO_LAT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z',
  и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ь: '', ю: 'iu', я: 'ia',
};
