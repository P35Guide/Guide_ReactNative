import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../api';
import { globalStyles, theme } from '../styles';
import { useAppLanguage } from '../store/app-language-context';
import { t } from '../constants/i18n';
import type { AddFavouritePlacePayload, FavouritePlace } from '../types/search';
import * as ImagePicker from 'expo-image-picker';

type SelectedPhoto = {
  id: string;
  previewUri: string;
  base64: string;
};

const TRANSPARENT_PLACEHOLDER_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottQAAAABJRU5ErkJggg==';

const CUSTOM_BASE_URL = (() => {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
  const replaced = baseUrl.replace(/\/place\/?$/, '/custom');
  if (replaced !== baseUrl) return replaced;
  if (baseUrl.endsWith('/custom')) return baseUrl;
  return baseUrl ? `${baseUrl}/custom` : '';
})();

const normalizePhotoSlots = (slots: string[]) => {
  const normalized = slots.slice(0, 5);
  while (normalized.length < 5) {
    normalized.push(TRANSPARENT_PLACEHOLDER_BASE64);
  }
  return normalized;
};

const submitFavouriteViaFetch = async (payload: AddFavouritePlacePayload) => {
  if (!CUSTOM_BASE_URL) {
    throw new Error('Custom API base URL is missing.');
  }

  const normalized = normalizePhotoSlots(payload.photoSlots);
  const body = {
    nameOfPlace: payload.nameOfPlace,
    address: payload.address,
    description: payload.description,
    photo1: normalized[0],
    photo2: normalized[1],
    photo3: normalized[2],
    photo4: normalized[3],
    photo5: normalized[4],
  };

  const response = await fetch(`${CUSTOM_BASE_URL}/addPlace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server error: ${response.status} - ${errorText}`);
  }

  return true;
};

export default function FavouritePlaces() {
  const { appLanguage } = useAppLanguage();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0);
  const [favourites, setFavourites] = useState<FavouritePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nameOfPlace: '', address: '', description: '' });
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadFavourites = useCallback(async () => {
    setLoading(true);
    const data = await api.custom.getAllPlaces();
    setFavourites(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFavourites();
  }, [loadFavourites]);

  const handlePickFromGallery = useCallback(async () => {
    if (selectedPhotos.length >= 5) {
      Alert.alert(t('favouritePhotoLimitError', appLanguage));
      return;
    }

    setPhotoLoading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('errorTitle', appLanguage), t('favouriteGalleryPermission', appLanguage));
        return;
      }

      const remaining = 5 - selectedPhotos.length;
      const response = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.6,
        base64: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (response.canceled) {
        return;
      }

      const assets = response.assets ?? [];
      if (assets.length === 0) {
        return;
      }

      const picked = assets
        .filter(asset => asset.base64)
        .map(asset => ({
          id: `${asset.assetId ?? asset.uri}-${Date.now()}`,
          previewUri: asset.uri,
          base64: asset.base64 ?? '',
        }));

      setSelectedPhotos(prev => {
        const combined = [...prev, ...picked];
        return combined.slice(0, 5);
      });
    } catch (error) {
      console.error('gallery error', error);
      Alert.alert(t('errorTitle', appLanguage), t('favouritePhotoUrlError', appLanguage));
    } finally {
      setPhotoLoading(false);
    }
  }, [appLanguage, selectedPhotos.length]);

  const handleRemovePhoto = useCallback((id: string) => {
    setSelectedPhotos(prev => prev.filter(photo => photo.id !== id));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.nameOfPlace.trim() || !form.address.trim() || !form.description.trim()) {
      Alert.alert(t('errorTitle', appLanguage), t('favouriteMissingFieldsWarning', appLanguage));
      return;
    }
    if (selectedPhotos.length === 0) {
      Alert.alert(t('errorTitle', appLanguage), t('favouriteMissingPhotos', appLanguage));
      return;
    }
    setSubmitting(true);
    try {
      await submitFavouriteViaFetch({
        nameOfPlace: form.nameOfPlace.trim(),
        address: form.address.trim(),
        description: form.description.trim(),
        photoSlots: selectedPhotos.map(photo => photo.base64),
      });
      Alert.alert(t('favouriteAddSuccess', appLanguage));
      setForm({ nameOfPlace: '', address: '', description: '' });
      setSelectedPhotos([]);
      await loadFavourites();
    } catch (error) {
      console.error('add favourite failed', error);
      Alert.alert(t('errorTitle', appLanguage), t('favouriteAddFailed', appLanguage));
    } finally {
      setSubmitting(false);
    }
  }, [appLanguage, form, loadFavourites, selectedPhotos]);

  const renderHeader = useMemo(() => (
    <View style={styles.formWrapper}>
      <Text style={styles.formTitle}>{t('favouriteAddTitle', appLanguage)}</Text>
      <TextInput
        value={form.nameOfPlace}
        onChangeText={(value) => setForm(prev => ({ ...prev, nameOfPlace: value }))}
        placeholder={`${t('favouriteNameLabel', appLanguage)} *`}
        style={[globalStyles.input, styles.input]}
      />
      <TextInput
        value={form.address}
        onChangeText={(value) => setForm(prev => ({ ...prev, address: value }))}
        placeholder={`${t('favouriteAddressLabel', appLanguage)} *`}
        style={[globalStyles.input, styles.input]}
      />
      <TextInput
        value={form.description}
        onChangeText={(value) => setForm(prev => ({ ...prev, description: value }))}
        placeholder={`${t('favouriteDescriptionLabel', appLanguage)} *`}
        style={[globalStyles.input, styles.input, styles.multilineInput]}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <View style={styles.photoAction}>
        <TouchableOpacity
          style={[styles.photoButton, photoLoading && styles.photoButtonDisabled]}
          onPress={handlePickFromGallery}
          disabled={photoLoading}
        >
          {photoLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.photoButtonText}>{t('favouriteAddPhoto', appLanguage)}</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.photoCount}>
          {selectedPhotos.length} / 5
        </Text>
      </View>
      <Text style={styles.photoHint}>{t('favouritePhotosHint', appLanguage)}</Text>
      <View style={styles.selectedPhotosRow}>
        {selectedPhotos.map(photo => (
          <View key={photo.id} style={styles.photoPreview}>
            <Image source={{ uri: photo.previewUri }} style={styles.photoThumbnail} />
            <Pressable style={styles.photoRemove} onPress={() => handleRemovePhoto(photo.id)}>
              <Text style={styles.photoRemoveText}>×</Text>
            </Pressable>
          </View>
        ))}
        {selectedPhotos.length === 0 ? (
          <Text style={styles.helperText}>{t('favouritePhotosLabel', appLanguage)}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={[globalStyles.button, styles.submitButton]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={globalStyles.buttonText}>{t('favouriteAddButton', appLanguage)}</Text>
        )}
      </TouchableOpacity>
    </View>
  ), [
    appLanguage,
    form,
    photoLoading,
    selectedPhotos,
    submitting,
    handlePickFromGallery,
    handleRemovePhoto,
    handleSubmit
  ]);

  const renderFavourite = useCallback(({ item }: { item: FavouritePlace }) => {
    const imageUri = item.photos[0] ?? undefined;
    return (
      <View style={globalStyles.card}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.favouriteImage} />
        ) : (
          <View style={[styles.favouriteImage, styles.noImage]}>
            <Text style={styles.noImageText}>{t('noPhoto', appLanguage)}</Text>
          </View>
        )}
        <View style={styles.favouriteContent}>
          <Text style={styles.favouriteName}>{item.nameOfPlace}</Text>
          <Text style={styles.favouriteAddress}>{item.address}</Text>
          <Text style={styles.favouriteDescription}>{item.description}</Text>
        </View>
      </View>
    );
  }, [appLanguage]);

  const listEmptyComponent = useMemo(() => {
    if (loading) {
      return <ActivityIndicator style={{ marginTop: 32 }} color={theme.primary} />;
    }
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>{t('favouriteEmptyTitle', appLanguage)}</Text>
        <Text style={globalStyles.emptyText}>{t('favouriteEmptyHint', appLanguage)}</Text>
      </View>
    );
  }, [appLanguage, loading]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={globalStyles.container}
    >
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={favourites}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingTop: topInset + 20,
          paddingBottom: Math.max(120, insets.bottom + 80),
          paddingHorizontal: 0
        }}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={{ paddingHorizontal: 20 }}
        renderItem={renderFavourite}
        ListEmptyComponent={listEmptyComponent}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.textDark,
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  multilineInput: {
    minHeight: 88,
  },
  photoButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  photoButtonDisabled: {
    opacity: 0.6,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  photoHint: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: 6,
  },
  selectedPhotosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  photoPreview: {
    width: 70,
    height: 70,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemoveText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 18,
  },
  helperText: {
    fontSize: 12,
    color: theme.textLight,
  },
  submitButton: {
    marginTop: 12,
  },
  photoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  photoCount: {
    fontSize: 12,
    color: theme.textLight,
    fontWeight: '700',
  },
  favouriteImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#CBD5E1',
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: '#94A3B8',
    fontWeight: '700',
  },
  favouriteContent: {
    padding: 16,
  },
  favouriteName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textDark,
    marginBottom: 6,
  },
  favouriteAddress: {
    fontSize: 14,
    color: theme.textLight,
  },
  favouriteDescription: {
    fontSize: 14,
    color: theme.textDark,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.textDark,
    marginBottom: 8,
  },
});
