import React, { useState } from 'react';
import { Alert, FlatList, Image, Linking, Modal, Platform, Pressable, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles } from '../styles';
import { useSearch } from '../store/search-context';
import type { Place } from '../types/search';
import { DAY_NAMES_EN, DAY_NAMES_UK } from '../constants/places';
import { useAppLanguage } from '../store/app-language-context';
import { t } from '../constants/i18n';

// повертає назву сьогоднішнього дня у форматі api.
const getTodayLabel = () => {
  const jsDay = new Date().getDay();
  return DAY_NAMES_EN[(jsDay + 6) % 7];
};

// бере рядок графіка саме на сьогодні.
const matchTodayHours = (weekdayDescriptions?: string[] | null) => {
  if (!weekdayDescriptions || weekdayDescriptions.length === 0) return null;
  const todayEn = getTodayLabel();
  const todayUk = DAY_NAMES_UK[DAY_NAMES_EN.indexOf(todayEn)];

  return weekdayDescriptions.find(line => line.startsWith(todayEn))
    ?? weekdayDescriptions.find(line => line.startsWith(todayUk))
    ?? weekdayDescriptions[0];
};

// робимо type більш читабельним: shopping_mall -> Shopping mall.
const formatPrimaryType = (value?: string | null) => {
  if (!value) return '';
  const label = value.replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

// формує url для відкриття місця в google maps.
const buildMapsUrl = (item: Place) => {
  const parts = [item.displayName, item.shortFormattedAddress].filter(Boolean);
  const query = parts.join(', ').trim();
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

export default function PlacesList() {
  const { places, loading } = useSearch();
  const { appLanguage } = useAppLanguage();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0);
  const [hoursModal, setHoursModal] = useState<{ title: string; lines: string[] } | null>(null);
  const [showMapHint, setShowMapHint] = useState(true);

  // малює одну картку місця в списку.
  const renderPlace = ({ item }: { item: Place }) => {
    const todayHours = matchTodayHours(item.weekdayDescriptions);
    const summary = item.editorialSummary ?? item.generativeSummary;
    const hasImage = Boolean(item.imageUri);

    // по тапу на картку відкриваємо google maps.
    const openInMaps = async () => {
      const url = buildMapsUrl(item);
      if (!url) {
        Alert.alert(t('noAddressTitle', appLanguage), t('noAddressHint', appLanguage));
        return;
      }
      await Linking.openURL(url);
    };

    return (
      <Pressable
        style={({ pressed }) => [globalStyles.card, pressed && globalStyles.cardPressed]}
        onPress={openInMaps}
      >
        <View style={globalStyles.placeImageWrap}>
          {/* основне фото місця або дефолт іконка */}
          <Image
            source={hasImage ? { uri: item.imageUri! } : require('../assets/images/icon.png')}
            style={globalStyles.placeImage}
            resizeMode="cover"
          />
          {/* легке затемнення поверх фото */}
          <View style={globalStyles.placeImageOverlay} />
          {/* рядок бейджів поверх картини*/}
          <View style={globalStyles.imageBadgeRow}>
            {item.primaryType ? (
              <Text style={globalStyles.imageTypeBadge}>{formatPrimaryType(item.primaryType)}</Text>
            ) : (
              <View />
            )}
            {item.openNow != null ? (
              <Text style={[globalStyles.imageStatusBadge, item.openNow ? globalStyles.pillOpen : globalStyles.pillClosed]}>
                {item.openNow ? t('openNow', appLanguage) : t('closedNow', appLanguage)}
              </Text>
            ) : null}
          </View>
          {/* якщо не підтягнулось фото - текст тоді */}
          {!hasImage ? (
            <View style={globalStyles.placeImageFallback}>
              <Text style={globalStyles.placeImageFallbackText}>{t('noPhoto', appLanguage)}</Text>
            </View>
          ) : null}
        </View>

        <View style={globalStyles.cardContent}>
          <Text style={globalStyles.title}>{item.displayName}</Text>

          {/* рейтинг та ксть відгуків*/}
          <View style={globalStyles.detailRow}>
            <Text style={globalStyles.rating}>★ {item.rating ?? 'N/A'}</Text>
            {item.userRatingCount != null ? (
              <Text style={globalStyles.muted}>({item.userRatingCount} {t('ratingReviews', appLanguage)})</Text>
            ) : null}
          </View>

          {/* блок з графікос роботи */}
          {todayHours ? (
            <View style={globalStyles.hoursRow}>
              <Text style={globalStyles.sectionTitle}>{t('hoursTitle', appLanguage)}</Text>
              <Text style={globalStyles.hoursText}>{todayHours}</Text>
              {item.weekdayDescriptions && item.weekdayDescriptions.length > 1 ? (
                <TouchableOpacity
                  onPress={() => setHoursModal({
                    title: item.displayName ?? t('hoursModalTitle', appLanguage),
                    lines: item.weekdayDescriptions ?? []
                  })}
                >
                  <Text style={globalStyles.link}>{t('showAll', appLanguage)}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {/*адреса та контакти */}
          {item.shortFormattedAddress ? (
            <Text style={globalStyles.address}>{t('address', appLanguage)}: {item.shortFormattedAddress}</Text>
          ) : null}
          {item.phoneNumber ? (
            <Text style={globalStyles.address}>{t('phone', appLanguage)}: {item.phoneNumber}</Text>
          ) : null}

          {/*лінк на сайт */}
          {item.websiteUri ? (
            <TouchableOpacity onPress={() => Linking.openURL(item.websiteUri!)}>
              <Text style={globalStyles.link}>{t('officialSite', appLanguage)}</Text>
            </TouchableOpacity>
          ) : null}

          {/*короткий опис з апі, якщо есть*/}
          {summary ? (
            <View style={globalStyles.summaryBlock}>
              <Text style={globalStyles.sectionTitle}>{t('aboutPlace', appLanguage)}</Text>
              <Text style={globalStyles.summaryText}>{summary}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={places}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderPlace}
        ListEmptyComponent={
          !loading ? (
            <View style={globalStyles.emptyState}>
              {/* підказка, коли список порожній */}
              <Text style={globalStyles.emptyTitle}>{t('emptyTitle', appLanguage)}</Text>
              <Text style={globalStyles.emptyText}>{t('emptyText', appLanguage)}</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingTop: topInset + 8, paddingBottom: Math.max(120, insets.bottom + 96), flexGrow: 1 }}
      />

      {/*плаваюча підказка про відкриття карти */}
      {showMapHint ? (
        <View style={[globalStyles.mapHintFloating, { bottom: Math.max(70, insets.bottom + 58) }]}>
          <View style={globalStyles.mapHintHeader}>
            <Text style={globalStyles.mapHintTitle}>{t('hintTitle', appLanguage)}</Text>
            <TouchableOpacity onPress={() => setShowMapHint(false)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Text style={globalStyles.mapHintClose}>{t('mapHintClose', appLanguage)}</Text>
            </TouchableOpacity>
          </View>
          <Text style={globalStyles.mapHintText}>
            {t('hintText', appLanguage)}
          </Text>
        </View>
      ) : null}

      {/* модальне вікно з повним графіком */}
      <Modal
        visible={!!hoursModal}
        transparent
        animationType="fade"
        onRequestClose={() => setHoursModal(null)}
      >
        <Pressable style={globalStyles.modalBackdrop} onPress={() => setHoursModal(null)}>
          <Pressable style={globalStyles.modalCard} onPress={() => { }}>
            <Text style={globalStyles.modalTitle}>{hoursModal?.title}</Text>
            <View style={globalStyles.modalList}>
              {hoursModal?.lines?.map(line => (
                <Text key={line} style={globalStyles.modalLine}>{line}</Text>
              ))}
            </View>
            <TouchableOpacity style={globalStyles.modalClose} onPress={() => setHoursModal(null)}>
              <Text style={globalStyles.modalCloseText}>{t('close', appLanguage)}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
