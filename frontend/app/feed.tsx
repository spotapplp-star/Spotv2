import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, PanResponder, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS, ACTIVITIES } from '../src/constants/theme';

const { width: W, height: H } = Dimensions.get('window');

export default function FeedScreen() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const activity = ACTIVITIES[currentIdx];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10 || Math.abs(gs.dy) > 10,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > 90) {
          // LIKE - swipe right
          Animated.parallel([
            Animated.timing(pan.x, { toValue: W + 100, duration: 300, useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: false }),
          ]).start(() => nextCard());
        } else if (gs.dx < -90) {
          // NOPE - swipe left
          Animated.parallel([
            Animated.timing(pan.x, { toValue: -W - 100, duration: 300, useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: false }),
          ]).start(() => nextCard());
        } else if (gs.dy < -60) {
          // Next - swipe up
          Animated.parallel([
            Animated.timing(pan.y, { toValue: -H, duration: 350, useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: false }),
          ]).start(() => nextCard());
        } else if (gs.dy > 60) {
          // Prev - swipe down
          Animated.parallel([
            Animated.timing(pan.y, { toValue: H, duration: 350, useNativeDriver: false }),
            Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: false }),
          ]).start(() => prevCard());
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const nextCard = () => {
    setCurrentIdx(prev => Math.min(prev + 1, ACTIVITIES.length - 1));
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
  };

  const prevCard = () => {
    setCurrentIdx(prev => Math.max(prev - 1, 0));
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
  };

  const toggleFav = () => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(activity.id)) next.delete(activity.id);
      else next.add(activity.id);
      return next;
    });
  };

  const likeOpacity = pan.x.interpolate({ inputRange: [0, 90], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = pan.x.interpolate({ inputRange: [-90, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const rotate = pan.x.interpolate({ inputRange: [-W, 0, W], outputRange: ['-15deg', '0deg', '15deg'] });

  if (!activity) return (
    <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: '#fff', fontSize: 18 }}>Fin du feed !</Text>
      <TouchableOpacity style={s.backToMap} onPress={() => router.replace('/map')}>
        <Text style={s.backToMapText}>Retour a la carte</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container} testID="feed-screen">
      {/* Topbar */}
      <View style={s.topbar}>
        <TouchableOpacity style={s.topBtn} onPress={() => router.back()} testID="feed-back-btn">
          <Feather name="chevron-left" size={16} color="#fff" />
        </TouchableOpacity>
        <View style={s.counter}>
          <Text style={s.counterText}>{currentIdx + 1} / {ACTIVITIES.length}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Next card (behind) */}
      {currentIdx + 1 < ACTIVITIES.length && (
        <View style={s.nextCard}>
          <ImageBackground source={{ uri: ACTIVITIES[currentIdx + 1].image }} style={s.cardBg} imageStyle={s.cardBgImage}>
            <View style={s.gradientBottom} />
          </ImageBackground>
        </View>
      )}

      {/* Current card */}
      <Animated.View
        style={[s.card, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }], opacity }]}
        {...panResponder.panHandlers}
      >
        <ImageBackground source={{ uri: activity.image }} style={s.cardBg} imageStyle={s.cardBgImage}>
          <View style={s.gradientTop} />
          <View style={s.gradientBottom} />

          {/* Like/Nope badges */}
          <Animated.View style={[s.badge, s.likeBadge, { opacity: likeOpacity }]}>
            <Text style={s.badgeText}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[s.badge, s.nopeBadge, { opacity: nopeOpacity }]}>
            <Text style={[s.badgeText, { color: '#fff' }]}>NOPE</Text>
          </Animated.View>

          {/* Top info */}
          <View style={s.cardTop}>
            <View style={s.catPill}>
              <Text style={s.catText}>{activity.category.toUpperCase()}</Text>
            </View>
            <View style={s.ratingPill}>
              <Feather name="star" size={12} color={COLORS.gold} />
              <Text style={s.ratingText}>{activity.rating}</Text>
            </View>
          </View>

          {/* Bottom info */}
          <View style={s.cardBottom}>
            <View style={s.cardInfo}>
              <Text style={s.cardTitle}>{activity.name}</Text>
              <View style={s.cardPills}>
                <View style={s.infoPill}><Text style={s.infoPillText}>{activity.arrondissement}</Text></View>
                <View style={s.infoPill}><Text style={s.infoPillText}>{activity.price}</Text></View>
              </View>
              <TouchableOpacity style={s.reserveBtn} onPress={() => router.push(`/reservation?id=${activity.id}`)} testID="feed-reserve-btn">
                <Feather name="calendar" size={14} color={COLORS.navy} />
                <Text style={s.reserveBtnText}>Reserver</Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={s.actions}>
              <TouchableOpacity style={s.actionBtn} onPress={toggleFav} testID="feed-fav-btn">
                <Feather name="heart" size={22} color="#fff" fill={favorites.has(activity.id) ? '#fff' : 'none'} />
                <Text style={s.actionLabel}>Favori</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn} testID="feed-share-btn">
                <Feather name="share" size={22} color="#fff" />
                <Text style={s.actionLabel}>Partager</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn} onPress={() => router.push(`/detail?id=${activity.id}`)} testID="feed-info-btn">
                <Feather name="info" size={22} color="#fff" />
                <Text style={s.actionLabel}>Infos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  topbar: { position: 'absolute', top: 52, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  topBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  counter: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  counterText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  nextCard: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  card: { flex: 1 },
  cardBg: { flex: 1, justifyContent: 'space-between' },
  cardBgImage: { resizeMode: 'cover' },
  gradientTop: { height: 120, backgroundColor: 'rgba(0,0,0,0.4)' },
  gradientBottom: { height: 280, backgroundColor: 'rgba(0,0,0,0.6)' },
  badge: { position: 'absolute', top: H * 0.35, zIndex: 20, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, borderWidth: 3 },
  likeBadge: { left: 30, backgroundColor: 'rgba(245,197,66,0.95)', borderColor: COLORS.yellow, transform: [{ rotate: '-12deg' }] },
  nopeBadge: { right: 30, backgroundColor: 'rgba(30,30,30,0.85)', borderColor: '#555', transform: [{ rotate: '12deg' }] },
  badgeText: { fontSize: 28, fontWeight: '900', color: COLORS.navy },
  cardTop: { position: 'absolute', top: 100, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  catPill: { backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  catText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  ratingText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  cardBottom: { position: 'absolute', bottom: 40, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  cardInfo: { flex: 1, marginRight: 16 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 26, marginBottom: 8 },
  cardPills: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  infoPill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  infoPillText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  reserveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.yellow, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 14, alignSelf: 'flex-start' },
  reserveBtnText: { color: COLORS.navy, fontSize: 14, fontWeight: '700' },
  actions: { gap: 28, alignItems: 'center' },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '500' },
  backToMap: { marginTop: 20, paddingVertical: 14, paddingHorizontal: 28, backgroundColor: COLORS.yellow, borderRadius: 14 },
  backToMapText: { color: COLORS.navy, fontSize: 15, fontWeight: '700' },
});
