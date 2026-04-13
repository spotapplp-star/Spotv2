import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/constants/theme';

const MESSAGES = ['Recherche en cours...', 'On trouve les meilleures activites...', 'Presque pret...'];

export default function LoadingScreen() {
  const router = useRouter();
  const [msgIdx, setMsgIdx] = useState(0);
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 600);
    const timer = setTimeout(() => router.replace('/feed'), 2000);

    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -10, duration: 200, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 200, useNativeDriver: true }),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);

    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  return (
    <View style={s.container} testID="loading-screen">
      <Text style={s.logo}>Sp<Text style={s.logoY}>o</Text>t</Text>
      <Text style={s.message}>{MESSAGES[msgIdx]}</Text>
      <View style={s.dots}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[s.dot, { transform: [{ translateY: d }] }]} />
        ))}
      </View>
      <View style={s.criteriaCard}>
        <Text style={s.criteriaLabel}>TES CRITERES</Text>
        <View style={s.criteriaTags}>
          {['5 km', '30EUR', 'Solo', 'Culturel', 'Sport'].map((t, i) => (
            <View key={i} style={s.criteriaTag}><Text style={s.criteriaTagText}>{t}</Text></View>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center', padding: 32 },
  logo: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: -2, marginBottom: 8 },
  logoY: { color: COLORS.yellow },
  message: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 48, letterSpacing: 0.3 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 48 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.yellow },
  criteriaCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, width: '100%', maxWidth: 280 },
  criteriaLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  criteriaTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  criteriaTag: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  criteriaTagText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
});
