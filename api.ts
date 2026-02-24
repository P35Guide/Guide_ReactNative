import Constants from 'expo-constants';

// тут визначаємо адресу бекенду
// спочатку пробуємо взяти хост із expo, щоб на телефоні працював локальний сервер
const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest?.hostUri ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ??
    (Constants as any).expoGo?.debuggerHost ??
    (Constants as any).debuggerHost;

const debuggerHost = hostUri?.split(':').shift();
const PORT = "5237";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

console.log("API base URL:", BASE_URL, "hostUri:", hostUri, "debuggerHost:", debuggerHost);

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
                    body: JSON.stringify(requestBody)
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
                    body: JSON.stringify({ placeId, maxWidthPx })
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
        }
    }
};
