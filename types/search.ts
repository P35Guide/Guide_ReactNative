export type RankPreference = 'POPULARITY' | 'DISTANCE';

// спільна модель місця для контексту та екрана списку.
export type Place = {
  id?: string;
  displayName?: string;
  shortFormattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  imageUri?: string | null;
  primaryType?: string;
  openNow?: boolean | null;
  weekdayDescriptions?: string[] | null;
  phoneNumber?: string | null;
  websiteUri?: string | null;
  editorialSummary?: string | null;
  generativeSummary?: string | null;
};

export type SearchSettings = {
  radius: string;
  maxResults: string;
  includedTypes: string[];
  excludedTypes: string[];
  // якщо true - показуємо тільки місця, які зараз відкриті.
  openNowOnly: boolean;
  languageCode: string;
  rankPreference: RankPreference;
};

export type TypeOption = {
  label: string;
  value: string;
};

// Міні DTO для улюблених місць.
export type FavouritePlace = {
  id: number;
  nameOfPlace: string;
  address: string;
  description: string;
  photos: string[];
};

export type AddFavouritePlacePayload = {
  nameOfPlace: string;
  address: string;
  description: string;
  photoSlots: string[]; // базові64 без префікса, довжина >=5
};
