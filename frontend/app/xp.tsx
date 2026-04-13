import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';

export default function XPScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const xp = user?.xp || 450;
  const level = user?.level || 12;
  const progress = (xp % 200) / 200;

  return (
    <View style={s.container} testID="xp-screen">
      <View style={s.header}>
        <Text style={s.title}>Dashboard XP</Text>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} testID="xp-close-btn">
          <Feather name="x" size={16} color={COLORS.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* XP Ring */}
        <View style={s.ringWrap}>
          <View style={s.ringOuter}>
            <View style={[s.ringProgress, { width: `${progress * 100}%` }]} />
            <View style={s.ringInner}>
              <Text style={s.ringNum}>{level}</Text>
              <Text style={s.ringLabel}>NIVEAU</Text>
            </View>
          </View>
          <Text style={s.rank}>Explorateur Urbain</Text>
          <Text style={s.xpSub}>{xp} XP - 2350 XP pour niveau {level + 1}</Text>
        </View>

        {/* Rewards */}
        <View style={s.section}>
          <Text style={s.secTitle}>Recompenses a debloquer</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { name: '-20% Atelier des Lumieres', desc: 'Reduction sur votre prochaine entree', dist: '450m', xpCost: 550 },
              { name: 'Partie offerte Escape Game', desc: 'Pour 2 joueurs, valable 30 jours', dist: '200m', xpCost: 850 },
              { name: '-30% Kayak Canal', desc: 'Session de 1h pour 2 personnes', dist: '1.2km', xpCost: 400 },
            ].map((r, i) => (
              <View key={i} style={s.rewardCard}>
                <View style={s.rewardIcon}>
                  <Feather name="gift" size={20} color={COLORS.gold} />
                </View>
                <Text style={s.rewardName}>{r.name}</Text>
                <Text style={s.rewardDesc}>{r.desc}</Text>
                <View style={s.rewardFooter}>
                  <Text style={s.rewardDist}>{r.dist}</Text>
                  <Text style={s.rewardXp}>-{r.xpCost} XP</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Badges */}
        <View style={s.section}>
          <Text style={s.secTitle}>Badges</Text>
          <View style={s.badgesGrid}>
            {[
              { name: 'Marcheur Bronze', tier: 'Bronze', color: '#CD7F32', unlocked: true, mult: '1.2' },
              { name: 'Explorateur Argent', tier: 'Silver', color: '#C0C0C0', unlocked: true, mult: '1.5' },
              { name: 'Aventurier Or', tier: 'Gold', color: '#FFD700', unlocked: false, mult: '2.0' },
              { name: 'Legende Platine', tier: 'Platinum', color: '#E5E4E2', unlocked: false, mult: '3.0' },
            ].map((b, i) => (
              <View key={i} style={s.badgeCard}>
                <View style={[s.badgeCircle, { backgroundColor: b.unlocked ? b.color : '#e0e0e0' }]}>
                  {b.unlocked ? (
                    <Feather name="eye" size={24} color="#fff" />
                  ) : (
                    <Feather name="lock" size={24} color="#bbb" />
                  )}
                </View>
                <Text style={s.badgeName}>{b.name}</Text>
                <Text style={s.badgeTier}>{b.tier}</Text>
                {b.unlocked ? (
                  <Text style={s.badgeMult}>x{b.mult}</Text>
                ) : (
                  <Text style={s.badgeLock}>Verrouille</Text>
                )}
              </View>
            ))}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 14 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.navy },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(13,27,62,0.07)', justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1 },
  ringWrap: { alignItems: 'center', paddingVertical: 24 },
  ringOuter: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  ringProgress: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: COLORS.navy, borderRadius: 60 },
  ringInner: { alignItems: 'center', zIndex: 1 },
  ringNum: { fontSize: 32, fontWeight: '800', color: COLORS.navy },
  ringLabel: { fontSize: 10, color: '#bbb', letterSpacing: 1 },
  rank: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginTop: 12 },
  xpSub: { fontSize: 12, color: '#888', marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  secTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: 14 },
  rewardCard: { width: 160, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginRight: 10, borderWidth: 1, borderColor: '#f0f0f0' },
  rewardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(200,168,75,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  rewardName: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 4 },
  rewardDesc: { fontSize: 11, color: '#888', lineHeight: 15, marginBottom: 10 },
  rewardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  rewardDist: { fontSize: 11, color: '#aaa' },
  rewardXp: { fontSize: 11, fontWeight: '700', color: COLORS.gold },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: { width: '47%', backgroundColor: '#f8f7f4', borderRadius: 16, padding: 16, alignItems: 'center' },
  badgeCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  badgeName: { fontSize: 12, fontWeight: '600', color: '#111', textAlign: 'center' },
  badgeTier: { fontSize: 10, color: '#888', marginTop: 2 },
  badgeMult: { fontSize: 12, fontWeight: '700', color: COLORS.navy, marginTop: 4 },
  badgeLock: { fontSize: 10, color: '#bbb', marginTop: 4 },
});
