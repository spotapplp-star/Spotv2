import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';
import { getActivityById } from '../src/utils/storage';

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getActivityById(id as string).then(act => { setActivity(act); setLoading(false); });
    }
  }, [id]);

  if (loading) return <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={COLORS.navy} /></View>;
  if (!activity) return (
    <View style={[s.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
      <Feather name="alert-circle" size={40} color="#ddd" />
      <Text style={{ color: '#888', fontSize: 16, marginTop: 12 }}>Activite introuvable</Text>
      <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}><Text style={{ color: COLORS.navy, fontWeight: '600' }}>Retour</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container} testID="detail-screen">
      {activity.image ? (
        <ImageBackground source={{ uri: activity.image }} style={s.hero} imageStyle={{ resizeMode: 'cover' }}>
          <View style={s.heroOverlay} />
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} testID="detail-back-btn"><Feather name="chevron-left" size={16} color="#fff" /></TouchableOpacity>
          <TouchableOpacity style={s.favBtn} testID="detail-fav-btn"><Feather name="heart" size={18} color="#fff" /></TouchableOpacity>
          <View style={s.heroBadge}><Text style={s.heroBadgeText}>{activity.category}</Text></View>
        </ImageBackground>
      ) : (
        <View style={[s.hero, { backgroundColor: COLORS.navy, justifyContent: 'flex-end' }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} testID="detail-back-btn"><Feather name="chevron-left" size={16} color="#fff" /></TouchableOpacity>
          <View style={s.heroBadge}><Text style={s.heroBadgeText}>{activity.category}</Text></View>
        </View>
      )}

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        <Text style={s.name}>{activity.name}</Text>
        <View style={s.locRow}><Feather name="map-pin" size={14} color="#888" /><Text style={s.locText}>{activity.address} - {activity.arrondissement}</Text></View>
        <View style={s.tags}>
          {(activity.tags || []).map((t: string, i: number) => (<View key={i} style={s.tag}><Text style={s.tagText}>{t}</Text></View>))}
        </View>
        <View style={s.statsGrid}>
          {[{ label: 'Note', value: String(activity.rating || '-'), icon: 'star' }, { label: 'Prix', value: activity.price || '-', icon: 'tag' }, { label: 'Duree', value: activity.duration || '-', icon: 'clock' }, { label: 'XP', value: `+${activity.xp || 0}`, icon: 'award', isXp: true }].map((stat, i) => (
            <View key={i} style={[s.statCard, stat.isXp && s.statCardXp]}>
              <Feather name={stat.icon as any} size={16} color={stat.isXp ? COLORS.gold : COLORS.navy} />
              <Text style={[s.statVal, stat.isXp && { color: COLORS.gold }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.desc}>{activity.description}</Text>
        <Text style={s.sectionTitle}>Horaires</Text>
        {(activity.schedule || []).map((sch: any, i: number) => (
          <View key={i} style={s.scheduleRow}>
            <Text style={s.schedDay}>{sch.day}</Text>
            <Text style={[s.schedHours, sch.closed && { color: COLORS.red }]}>{sch.hours}</Text>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={s.cta}>
        <TouchableOpacity style={s.ctaBtn} onPress={() => router.push(`/reservation?id=${activity.id}`)} testID="detail-reserve-btn">
          <Text style={s.ctaText}>Reserver maintenant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { height: 280, justifyContent: 'flex-end' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  backBtn: { position: 'absolute', top: 52, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  favBtn: { position: 'absolute', top: 52, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  heroBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginLeft: 16, marginBottom: 16 },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  body: { flex: 1, padding: 20 },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.navy, marginBottom: 6 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  locText: { fontSize: 13, color: '#888' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tag: { backgroundColor: 'rgba(13,27,62,0.07)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: '600', color: COLORS.navy },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: '#f8f7f4', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  statCardXp: { backgroundColor: '#fff7e0' },
  statVal: { fontSize: 15, fontWeight: '800', color: COLORS.navy },
  statLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase' },
  desc: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: 10 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  schedDay: { fontSize: 13, fontWeight: '600', color: '#333' },
  schedHours: { fontSize: 13, color: '#666' },
  cta: { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  ctaBtn: { backgroundColor: COLORS.yellow, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  ctaText: { color: COLORS.navy, fontSize: 16, fontWeight: '700' },
});
