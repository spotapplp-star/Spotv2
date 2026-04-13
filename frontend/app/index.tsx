import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  { icon: 'map-outline', iconLib: 'ion', title: 'Decouvre Paris autrement', sub: 'Des activites uniques, filtrees selon ton mood, ton budget et ton groupe.' },
  { icon: 'play-circle', iconLib: 'feather', title: 'Swipe, explore, reserve', sub: "Un feed d'activites immersif. Swipe vers le haut pour passer, a droite pour liker." },
  { icon: 'sliders', iconLib: 'feather', title: 'Personnalise ton experience', sub: 'Mood, dates, budget par personne. SPOT fait le reste.' },
  { icon: 'award', iconLib: 'feather', title: 'Gagne des XP a chaque sortie', sub: 'Debloque des reductions exclusives chez nos partenaires parisiens.' },
];

export default function Onboarding() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goTo = (idx: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setCurrent(idx);
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const next = () => {
    if (current < 3) goTo(current + 1);
    else router.replace('/home-choice');
  };

  const skip = () => router.replace('/home-choice');

  const slide = SLIDES[current];

  return (
    <View style={s.container} testID="onboarding-screen">
      {/* Logo */}
      <View style={s.logoWrap}>
        <Text style={s.logo}>Sp<Text style={s.logoAccent}>o</Text>t</Text>
        {current === 0 && <Text style={s.paris}>PARIS</Text>}
      </View>

      {/* Slide Content */}
      <Animated.View style={[s.slideContent, { opacity: fadeAnim }]}>
        <View style={s.iconCircle}>
          {slide.iconLib === 'ion' ? (
            <Ionicons name={slide.icon as any} size={48} color={COLORS.yellow} />
          ) : (
            <Feather name={slide.icon as any} size={48} color={COLORS.yellow} />
          )}
        </View>
        <Text style={s.title}>{slide.title}</Text>
        <Text style={s.sub}>{slide.sub}</Text>
      </Animated.View>

      {/* Dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === current && s.dotActive]} />
        ))}
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity style={s.skipBtn} onPress={skip} testID="onboarding-skip-btn">
          <Text style={s.skipText}>Passer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.nextBtn} onPress={next} testID="onboarding-next-btn">
          <Text style={s.nextText}>{current === 3 ? 'Commencer' : 'Continuer'}</Text>
          <Feather name="arrow-right" size={16} color={COLORS.navy} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy, paddingTop: 80, paddingHorizontal: 32 },
  logoWrap: { alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 52, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  logoAccent: { color: COLORS.yellow },
  paris: { fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, marginTop: 4, textTransform: 'uppercase' },
  slideContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(245,197,66,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 32, marginBottom: 16 },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 24, backgroundColor: COLORS.yellow },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 50 },
  skipBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  skipText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14, backgroundColor: COLORS.yellow },
  nextText: { color: COLORS.navy, fontSize: 15, fontWeight: '700' },
});
