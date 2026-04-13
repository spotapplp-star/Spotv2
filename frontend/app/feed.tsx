import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, PanResponder, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';
import { loadActivities } from '../src/utils/storage';

const { width: W, height: H } = Dimensions.get('window');
const VERTICAL_THRESHOLD = H * 0.3;
const HORIZONTAL_THRESHOLD = 90;

export default function FeedScreen() {
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const dragY = useRef(new Animated.Value(0)).current;
  const dragX = useRef(new Animated.Value(0)).current;
  const idxRef = useRef(0);
  const dirRef = useRef<'none' | 'v' | 'h'>('none');

  // Static offsets for prev/next cards
  const negH = useRef(new Animated.Value(-H)).current;
  const posH = useRef(new Animated.Value(H)).current;

  useEffect(() => {
    loadActivities().then(data => setActivities(data));
  }, []);

  const goToIndex = (newIdx: number) => {
    idxRef.current = newIdx;
    setIdx(newIdx);
    dragY.setValue(0);
    dragX.setValue(0);
    dirRef.current = 'none';
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 8 || Math.abs(gs.dy) > 8,
      onPanResponderGrant: () => { dirRef.current = 'none'; },
      onPanResponderMove: (_, gs) => {
        if (dirRef.current === 'none') {
          dirRef.current = Math.abs(gs.dy) > Math.abs(gs.dx) ? 'v' : 'h';
        }
        if (dirRef.current === 'v') {
          dragY.setValue(gs.dy);
        } else {
          dragX.setValue(gs.dx);
        }
      },
      onPanResponderRelease: (_, gs) => {
        const i = idxRef.current;

        if (dirRef.current === 'v') {
          if (gs.dy < -VERTICAL_THRESHOLD && i < (activities.length || 999) - 1) {
            Animated.timing(dragY, { toValue: -H, duration: 300, useNativeDriver: true }).start(() => goToIndex(i + 1));
          } else if (gs.dy > VERTICAL_THRESHOLD && i > 0) {
            Animated.timing(dragY, { toValue: H, duration: 300, useNativeDriver: true }).start(() => goToIndex(i - 1));
          } else {
            Animated.spring(dragY, { toValue: 0, useNativeDriver: true, tension: 40, friction: 7 }).start();
          }
        } else if (dirRef.current === 'h') {
          if (gs.dx > HORIZONTAL_THRESHOLD) {
            // LIKE
            Animated.timing(dragX, { toValue: W + 100, duration: 300, useNativeDriver: true }).start(() => {
              if (i < (activities.length || 999) - 1) goToIndex(i + 1);
              else { dragX.setValue(0); }
            });
          } else if (gs.dx < -HORIZONTAL_THRESHOLD) {
            // NOPE
            Animated.timing(dragX, { toValue: -W - 100, duration: 300, useNativeDriver: true }).start(() => {
              if (i < (activities.length || 999) - 1) goToIndex(i + 1);
              else { dragX.setValue(0); }
            });
          } else {
            Animated.spring(dragX, { toValue: 0, useNativeDriver: true }).start();
          }
        }
        dirRef.current = 'none';
      },
    })
  ).current;

  const prevAct = idx > 0 ? activities[idx - 1] : null;
  const currAct = activities[idx];
  const nextAct = idx < activities.length - 1 ? activities[idx + 1] : null;

  const likeOpacity = dragX.interpolate({ inputRange: [0, 90], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = dragX.interpolate({ inputRange: [-90, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const rotate = dragX.interpolate({ inputRange: [-W, 0, W], outputRange: ['-15deg', '0deg', '15deg'] });

  const toggleFav = () => {
    if (!currAct) return;
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(currAct.id) ? next.delete(currAct.id) : next.add(currAct.id);
      return next;
    });
  };

  // Empty state
  if (activities.length === 0) {
    return (
      <View style={[s.container, s.emptyCenter]} testID="feed-screen-empty">
        <Feather name="inbox" size={48} color="rgba(255,255,255,0.3)" />
        <Text style={s.emptyText}>Aucune activite disponible pour le moment</Text>
        <TouchableOpacity style={s.backMapBtn} onPress={() => router.replace('/map')}>
          <Text style={s.backMapBtnText}>Retour a la carte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // End of feed
  if (!currAct) {
    return (
      <View style={[s.container, s.emptyCenter]}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Fin du feed !</Text>
        <TouchableOpacity style={s.backMapBtn} onPress={() => router.replace('/map')}>
          <Text style={s.backMapBtnText}>Retour a la carte</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderCard = (activity: any, position: 'prev' | 'current' | 'next') => {
    let animStyle: any;
    if (position === 'prev') {
      animStyle = { transform: [{ translateY: Animated.add(dragY, negH) }] };
    } else if (position === 'next') {
      animStyle = { transform: [{ translateY: Animated.add(dragY, posH) }] };
    } else {
      animStyle = { transform: [{ translateY: dragY }, { translateX: dragX }, { rotate }] };
    }

    return (
      <Animated.View key={`${activity.id}-${position}`} style={[s.card, animStyle]} pointerEvents={position === 'current' ? 'auto' : 'none'}>
        {activity.image ? (
          <ImageBackground source={{ uri: activity.image }} style={s.cardBg} imageStyle={{ resizeMode: 'cover' }}>
            <View style={s.gradTop} />
            <View style={s.gradBottom} />
            {renderCardOverlay(activity, position)}
          </ImageBackground>
        ) : (
          <View style={[s.cardBg, { backgroundColor: COLORS.navy }]}>
            <View style={s.gradTop} />
            {renderCardOverlay(activity, position)}
          </View>
        )}
      </Animated.View>
    );
  };

  const renderCardOverlay = (activity: any, position: string) => (
    <>
      {/* Top info */}
      <View style={s.cardTopInfo}>
        <View style={s.catPill}><Text style={s.catText}>{(activity.category || '').toUpperCase()}</Text></View>
        <View style={s.ratingPill}>
          <Feather name="star" size={12} color={COLORS.gold} />
          <Text style={s.ratingText}>{activity.rating || '-'}</Text>
        </View>
      </View>

      {/* Like/Nope badges (current only) */}
      {position === 'current' && (
        <>
          <Animated.View style={[s.badge, s.likeBadge, { opacity: likeOpacity }]}>
            <Text style={s.badgeText}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[s.badge, s.nopeBadge, { opacity: nopeOpacity }]}>
            <Text style={[s.badgeText, { color: '#fff' }]}>NOPE</Text>
          </Animated.View>
        </>
      )}

      {/* Bottom info */}
      <View style={s.cardBottom}>
        <Text style={s.cardTitle}>{activity.name}</Text>
        <View style={s.cardPills}>
          {activity.arrondissement ? <View style={s.pill}><Text style={s.pillText}>{activity.arrondissement}</Text></View> : null}
          {activity.price ? <View style={s.pill}><Text style={s.pillText}>{activity.price}</Text></View> : null}
        </View>
      </View>
    </>
  );

  return (
    <View style={s.container} testID="feed-screen">
      {/* Topbar */}
      <View style={s.topbar}>
        <TouchableOpacity style={s.topBtn} onPress={() => router.back()} testID="feed-back-btn">
          <Feather name="chevron-left" size={16} color="#fff" />
        </TouchableOpacity>
        <View style={s.counter}><Text style={s.counterText}>{idx + 1} / {activities.length}</Text></View>
        <View style={{ width: 36 }} />
      </View>

      {/* Cards - stacked with real-time tracking */}
      <View style={s.cardContainer} {...panResponder.panHandlers}>
        {prevAct && renderCard(prevAct, 'prev')}
        {nextAct && renderCard(nextAct, 'next')}
        {renderCard(currAct, 'current')}
      </View>

      {/* CORRECTION 5: Reserve Button - big, absolute, functional */}
      <TouchableOpacity
        style={s.reserveBtn}
        onPress={() => router.push(`/reservation?id=${currAct.id}`)}
        testID="feed-reserve-btn"
        activeOpacity={0.8}
      >
        <Feather name="calendar" size={16} color={COLORS.navy} />
        <Text style={s.reserveText}>Reserver</Text>
      </TouchableOpacity>

      {/* Actions (right side) */}
      <View style={s.actions}>
        <TouchableOpacity style={s.actionBtn} onPress={toggleFav} testID="feed-fav-btn">
          <Feather name="heart" size={22} color="#fff" />
          <Text style={s.actionLabel}>Favori</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} testID="feed-share-btn">
          <Feather name="share" size={22} color="#fff" />
          <Text style={s.actionLabel}>Partager</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={() => router.push(`/detail?id=${currAct.id}`)} testID="feed-info-btn">
          <Feather name="info" size={22} color="#fff" />
          <Text style={s.actionLabel}>Infos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', overflow: 'hidden' },
  emptyCenter: { justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 16, textAlign: 'center', paddingHorizontal: 40 },
  backMapBtn: { marginTop: 20, paddingVertical: 14, paddingHorizontal: 28, backgroundColor: COLORS.yellow, borderRadius: 14 },
  backMapBtnText: { color: COLORS.navy, fontSize: 15, fontWeight: '700' },
  topbar: { position: 'absolute', top: 52, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 30 },
  topBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  counter: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  counterText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cardContainer: { flex: 1 },
  card: { position: 'absolute', top: 0, left: 0, width: W, height: H },
  cardBg: { flex: 1, justifyContent: 'space-between' },
  gradTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 140, backgroundColor: 'rgba(0,0,0,0.45)' },
  gradBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 320, backgroundColor: 'rgba(0,0,0,0.65)' },
  cardTopInfo: { position: 'absolute', top: 100, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 5 },
  catPill: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  catText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  ratingText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  badge: { position: 'absolute', top: H * 0.35, zIndex: 20, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, borderWidth: 3 },
  likeBadge: { left: 30, backgroundColor: 'rgba(245,197,66,0.95)', borderColor: COLORS.yellow, transform: [{ rotate: '-12deg' }] },
  nopeBadge: { right: 30, backgroundColor: 'rgba(30,30,30,0.85)', borderColor: '#555', transform: [{ rotate: '12deg' }] },
  badgeText: { fontSize: 28, fontWeight: '900', color: COLORS.navy },
  cardBottom: { position: 'absolute', bottom: 100, left: 16, right: 96, zIndex: 5 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 26, marginBottom: 8 },
  cardPills: { flexDirection: 'row', gap: 6 },
  pill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  // CORRECTION 5: Reserve button - big, absolute, zIndex high
  reserveBtn: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 96,
    height: 48,
    backgroundColor: COLORS.yellow,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  reserveText: { color: COLORS.navy, fontSize: 14, fontWeight: '700' },
  actions: { position: 'absolute', bottom: 32, right: 16, gap: 28, alignItems: 'center', zIndex: 30 },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '500' },
});
