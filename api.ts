import Constants from 'expo-constants';

// Витягуємо IP адресу хоста
const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
console.log("MY DEBUGGER HOST IS:", debuggerHost);
const PORT = "5237";

const BASE_URL = debuggerHost
    ? `http://${debuggerHost}:${PORT}/api/place`
    : `http://localhost:${PORT}/api/place`;

export const api = {
    places: {
        // Додаємо : any або тип твого реквесту
        searchNearby: async (requestBody: any) => {
            try {
                const url = `${BASE_URL}/google-maps-search-nearby`;
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
        }
    }
};