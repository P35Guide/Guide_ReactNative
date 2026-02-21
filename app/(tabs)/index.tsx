import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../../api';

// визначити форму об'єкта місця, який повертається API
interface Place {
  id?: string;
  displayName?: string;
  name?: string;
  shortFormattedAddress?: string;
  rating?: number;
}

// необов’язкова форма відповіді від searchNearby
interface NearbyPlacesResponse {
  places?: Place[];
}





export const unstable_settings = {
  anchor: '(tabs)',
};

export default function Index() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async () => {
    setLoading(true);
    const requestPayload = {
      // координати для тесту
      locationRestriction: {
        circle: {
          center: { latitude: 50.4501, longitude: 30.5234 },
          radius: 1000.0
        }
      },
      includedTypes: ["ресторан", "кафе"]
    };

    try {
      console.log("запит", requestPayload);
      const data = (await api.places.searchNearby(requestPayload)) as NearbyPlacesResponse;
      console.log("відповідь API", data);
      setPlaces(data.places ?? []);
    } catch (error: any) {
      console.error("searchNearby помилка", error);
      alert("Помилка зв'язку: " + (error.message ?? JSON.stringify(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Місця поблизу</Text>

      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Знайти місце поблизу</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#a78bfa" style={{ marginTop: 20 }} />
      ) : (
        <FlatList<Place>
          data={places}
          keyExtractor={(item, index) => item.id ?? index.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.rating != null ? <Text style={styles.rating}>/{item.rating}</Text> : null}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Натисни кнопку, щоб знайти місця</Text>
          }
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 60,
    paddingHorizontal: 20
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)'
  },
  title: {
    color: '#a78bfa',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  address: {
    color: '#94a3b8',
    fontSize: 14
  },
  rating: {
    color: '#fbbf24',
    marginTop: 8,
    fontWeight: 'bold'
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16
  }
});