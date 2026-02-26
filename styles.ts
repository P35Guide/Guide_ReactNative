import { StyleSheet } from 'react-native';

export const theme = {
    primary: '#FF7A45',
    secondary: '#F2C94C',
    accentGreen: '#1FAD62',
    accentRed: '#E55353',
    background: '#F9F7F2',
    card: '#FFFFFF',
    textDark: '#1E293B',
    textLight: '#64748B',
    border: '#E5E7EB',
    shadow: '#0F172A'
};

export const globalStyles = StyleSheet.create({
    // головний фон і розмір екрана.
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    // однакові відступи по боках.
    contentPadding: {
        paddingHorizontal: 20,
    },
    // верхній блок з назвою yummap і радіусом.
    hero: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff3e8',
        borderRadius: 22,
        padding: 18,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: '#ffe2cc',
    },
    heroTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: theme.textDark,
        letterSpacing: -0.6,
    },
    heroSubtitle: {
        fontSize: 14,
        color: theme.textLight,
        marginTop: 6,
        maxWidth: 220,
    },
    heroBadge: {
        backgroundColor: theme.primary,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    heroBadgeText: {
        color: '#fff',
        fontWeight: '700',
    },
    // білий блок для налаштувань.
    settingsBlock: {
        marginBottom: 18,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    settingsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    settingsColumn: {
        flex: 1,
    },
    // підписи та поля вводу.
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.textDark,
        textTransform: 'uppercase',
        letterSpacing: 1.1,
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        fontSize: 16,
        color: theme.textDark,
        fontWeight: '600',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputCompact: {
        flex: 1,
        height: 42,
    },
    helperText: {
        fontSize: 12,
        color: theme.textLight,
        marginTop: 6,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        alignItems: 'center',
    },
    addButton: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '700',
    },
    // маленькі кнопки типів і мови.
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipSelectedPrimary: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    chipSelectedGreen: {
        backgroundColor: theme.accentGreen,
        borderColor: theme.accentGreen,
    },
    chipSelectedRed: {
        backgroundColor: theme.accentRed,
        borderColor: theme.accentRed,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.textLight,
    },
    chipTextSelected: {
        color: '#fff',
    },
    // перемикач сортування.
    segmented: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 14,
        padding: 4,
    },
    segment: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 12,
    },
    segmentActive: {
        backgroundColor: '#fff',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    segmentText: {
        color: theme.textLight,
        fontWeight: '600',
        fontSize: 14,
    },
    segmentTextActive: {
        color: theme.textDark,
    },
    // головна кнопка пошуку.
    button: {
        backgroundColor: theme.textDark,
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 24,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    // картка одного місця.
    card: {
        backgroundColor: theme.card,
        borderRadius: 28,
        marginHorizontal: 20,
        marginBottom: 26,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.16,
        shadowRadius: 22,
        elevation: 8,
    },
    cardPressed: {
        transform: [{ scale: 0.99 }],
        opacity: 0.96,
    },
    // блок з фото, статусом і типом.
    // якщо фото нема, показуємо запасний варіант.
    placeImageWrap: {
        position: 'relative',
        height: 230,
        backgroundColor: '#CBD5E1',
    },
    placeImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#CBD5E1',
    },
    placeImageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.22)',
    },
    imageBadgeRow: {
        position: 'absolute',
        left: 14,
        right: 14,
        top: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    imageTypeBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        color: theme.textDark,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: '700',
        overflow: 'hidden',
        maxWidth: '68%',
    },
    imageStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        fontSize: 12,
        color: '#fff',
        fontWeight: '700',
        overflow: 'hidden',
    },
    placeImageFallback: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.34)',
    },
    placeImageFallbackText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    // текстова частина картки.
    cardContent: {
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 18,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.textDark,
        marginBottom: 8,
    },
    tag: {
        fontSize: 12,
        color: theme.textLight,
        marginBottom: 10,
        textTransform: 'capitalize',
    },
    address: {
        fontSize: 14,
        lineHeight: 20,
        color: theme.textLight,
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        marginBottom: 14,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rating: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#EAB308',
    },
    pill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        fontSize: 12,
        color: '#fff',
        overflow: 'hidden',
    },
    pillOpen: {
        backgroundColor: theme.accentGreen,
    },
    pillClosed: {
        backgroundColor: theme.accentRed,
    },
    // блок з годинами роботи.
    hoursRow: {
        marginBottom: 14,
        gap: 5,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 14,
        padding: 10,
    },
    hoursText: {
        fontSize: 13,
        color: theme.textDark,
        fontWeight: '600',
        lineHeight: 18,
    },
    hoursList: {
        marginBottom: 10,
        gap: 4,
    },
    hoursLine: {
        fontSize: 13,
        color: theme.textLight,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.textDark,
    },
    // натискні тексти: сайт і "показати всі".
    link: {
        fontSize: 14,
        color: theme.primary,
        fontWeight: '700',
        marginTop: 4,
    },
    summaryBlock: {
        marginTop: 12,
        gap: 6,
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FED7AA',
        borderRadius: 14,
        padding: 10,
    },
    summaryText: {
        fontSize: 13,
        color: theme.textDark,
        lineHeight: 20,
    },
    muted: {
        fontSize: 12,
        color: theme.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    // текст, коли місць ще нема.
    emptyText: {
        textAlign: 'center',
        color: theme.textLight,
        fontSize: 14,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.textDark,
        textAlign: 'center',
    },
    // випливаюча підказка над нижнім меню.
    mapHintFloating: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#FED7AA',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
    },
    mapHintHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    mapHintTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.textDark,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
    },
    mapHintClose: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.textLight,
    },
    mapHintText: {
        fontSize: 13,
        lineHeight: 18,
        color: theme.textDark,
    },
    // вікно з повним графіком роботи.
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        width: '100%',
        maxWidth: 420,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.textDark,
        marginBottom: 12,
    },
    modalList: {
        gap: 6,
    },
    modalLine: {
        fontSize: 13,
        color: theme.textLight,
    },
    modalClose: {
        alignSelf: 'flex-end',
        marginTop: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: theme.primary,
    },
    modalCloseText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
});
