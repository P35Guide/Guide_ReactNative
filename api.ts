import Constants from 'expo-constants';
import type { AddFavouritePlacePayload, FavouritePlace } from './types/search';

// тут визначаємо адресу бекенду
// спочатку пробуємо взяти хост із expo, щоб на телефоні працював локальний сервер
const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest?.hostUri ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ??
    (Constants as any).expoGo?.debuggerHost ??
    (Constants as any).debuggerHost;

const debuggerHost = hostUri?.split(':').shift();

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

const CUSTOM_BASE_URL = (() => {
    const replaced = BASE_URL.replace(/\/place\/?$/, '/custom');
    if (replaced !== BASE_URL) return replaced;
    return BASE_URL.endsWith('/custom') ? BASE_URL : `${BASE_URL}/custom`;
})();

const stripBase64Prefix = (value: string) => {
    const dataUriIndex = value.indexOf(',');
    if (value.startsWith('data:') && dataUriIndex >= 0) {
        return value.slice(dataUriIndex + 1);
    }
    return value;
};

const ensurePhotoUri = (value?: string | null) => {
    if (!value) return null;
    return value.startsWith('data:') ? value : `data:image/jpeg;base64,${value}`;
};

const TRANSPARENT_PLACEHOLDER_BASE64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottQAAAABJRU5ErkJggg==';

console.log("API base URL:", BASE_URL, "hostUri:", hostUri, "debuggerHost:", debuggerHost, "customBaseUrl:", CUSTOM_BASE_URL);

export const api = {
    places: {
        // пошук місць поблизу.
        // openNowOnly=true додає query-параметр для бекенд-фільтра.
        searchNearby: async (requestBody: any, openNowOnly: boolean = false) => {
            try {
                const url = `${BASE_URL}/google-maps-search-nearby${openNowOnly ? '?openNow=true' : ''}`;
                console.log("calling API", url, "payload", requestBody);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn("API responded non-ok", response.status, errorText);
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }

                const json = await response.json();
                console.log("API success", json);
                return json;
            } catch (error) {
                console.error("API Fetch Error:", error);
                throw error;
            }
        },
        // отримує масив url фото для конкретного placeId.
        getPhotoUrls: async (placeId: string, maxWidthPx: number = 400) => {
            try {
                const url = `${BASE_URL}/google-maps-photo`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ placeId, maxWidthPx }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn("API responded non-ok", response.status, errorText);
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }

                return (await response.json()) as string[];
            } catch (error) {
                console.error("API Fetch Error:", error);
                return [];
            }
        },
    },
    custom: {
        // отримуємо список усіх збережених користувачем місць.
        getAllPlaces: async (): Promise<FavouritePlace[]> => {
            try {
                const url = `${CUSTOM_BASE_URL}/getAllPlaces`;
                const response = await fetch(url);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }

                const json = await response.json();
                return json.map((place: any) => ({
                    id: place.id ?? place.Id ?? 0,
                    nameOfPlace: place.nameOfPlace ?? place.NameOfPlace ?? '',
                    address: place.address ?? place.Address ?? '',
                    description: place.description ?? place.Description ?? '',
                    photos: [
                        place.Photo1 ?? place.photo1,
                        place.Photo2 ?? place.photo2,
                        place.Photo3 ?? place.photo3,
                        place.Photo4 ?? place.photo4,
                        place.Photo5 ?? place.photo5,
                    ]
                        .map(ensurePhotoUri)
                        .filter((uri): uri is string => Boolean(uri)),
                }));
            } catch (error) {
                console.error("API Fetch Error (custom)", error);
                return [];
            }
        },
        addPlace: async (payload: AddFavouritePlacePayload) => {
            const normalizedSlots = [...payload.photoSlots]
                .slice(0, 5)
                .map((slot) => stripBase64Prefix(slot));

            while (normalizedSlots.length < 5) {
                normalizedSlots.push(TRANSPARENT_PLACEHOLDER_BASE64);
            }

            try {
                const url = `${CUSTOM_BASE_URL}/addPlace`;
                const body = {
                    nameOfPlace: payload.nameOfPlace,
                    address: payload.address,
                    description: payload.description,
                    photo1: normalizedSlots[0],
                    photo2: normalizedSlots[1],
                    photo3: normalizedSlots[2],
                    photo4: normalizedSlots[3],
                    photo5: normalizedSlots[4],
                };

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Server error: ${response.status} - ${errorText}`);
                }

                return true;
            } catch (error) {
                console.error("API Fetch Error (custom)", error);
                throw error;
            }
        },
    },
};
