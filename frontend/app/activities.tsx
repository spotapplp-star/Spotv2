import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS } from '../src/constants/theme';
import { loadActivities } from '../src/utils/storage';

export default function ActivitiesScreen() {
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    loadActivities().then(data => setActivities(data));
  }, []);

  const hasActivities = activities.length > 0;

  return (
    <View style={s.container} testID="activities-screen">
      <View style={s.header}>
        <Text style={s.title}>Mes activites</Text>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} testID="activities-close-btn">
          <Feather name="x" size={18} color={COLORS.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {!hasActivities ? (
          <View style={s.emptyState}>
            <Feather name="inbox" size={48} color="#ddd" />
            <Text style={s.emptyTitle}>Aucune activite pour le moment</Text>
            <Text style={s.emptySub}>Explorez la carte et likez des activites pour les retrouver ici</Text>
          </View>
        ) : (
          <>
            {/* Liked */}
            <View style={s.section}>
              <View style={s.secHead}>
                <View style={s.secTitleRow}>
                  <Feather name="heart" size={16} color={COLORS.navy} />
                  <Text style={s.secTitle}>Likes du moment</Text>
                </View>
                <Text style={s.secCount}>{activities.length} activites</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {activities.slice(0, 4).map((a, i) => (
                  <TouchableOpacity key={i} style={s.miniCard} onPress={() => router.push(`/detail?id=${a.id}`)}>
                    {a.image ? <Image source={{ uri: a.image }} style={s.miniImg} /> : <View style={[s.miniImg, { backgroundColor: COLORS.navy }]} />}
                    <View style={s.miniBody}>
                      <Text style={s.miniName} numberOfLines={1}>{a.name}</Text>
                      <Text style={s.miniSub}>{a.arrondissement}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Favoris */}
            <View style={s.section}>
              <View style={s.secHead}>
                <View style={s.secTitleRow}>
                  <Feather name="heart" size={16} color={COLORS.yellow} />
                  <Text style={s.secTitle}>Favoris</Text>
                </View>
                <Text style={s.secCount}>{Math.min(activities.length, 2)} activites</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {activities.slice(0, 2).map((a, i) => (
                  <TouchableOpacity key={i} style={s.miniCard} onPress={() => router.push(`/detail?id=${a.id}`)}>
                    {a.image ? <Image source={{ uri: a.image }} style={s.miniImg} /> : <View style={[s.miniImg, { backgroundColor: COLORS.navy }]} />}
                    <View style={s.miniBody}>
                      <Text style={s.miniName} numberOfLines={1}>{a.name}</Text>
                      <Text style={s.miniSub}>{a.arrondissement}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* History */}
            <View style={s.section}>
              <View style={s.secHead}>
                <View style={s.secTitleRow}>
                  <Feather name="clock" size={16} color={COLORS.navy} />
                  <Text style={s.secTitle}>Historique</Text>
                </View>
              </View>
              {activities.slice(0, 3).map((a, i) => (
                <TouchableOpacity key={i} style={s.histItem} onPress={() => router.push(`/detail?id=${a.id}`)}>
                  {a.image ? <Image source={{ uri: a.image }} style={s.histThumb} /> : <View style={[s.histThumb, { backgroundColor: COLORS.navy }]} />}
                  <View style={s.histInfo}>
                    <Text style={s.histName}>{a.name}</Text>
                    <Text style={s.histSub}>{a.arrondissement}</Text>
                    <View style={s.histTags}>
                      <View style={s.histTagDone}><Text style={s.histTagDoneText}>Fait</Text></View>
                      <View style={s.histTagXp}><Text style={s.histTagXpText}>+{a.xp || 0} XP</Text></View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.navy },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(13,27,62,0.07)', justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#888', marginTop: 16 },
  emptySub: { fontSize: 13, color: '#bbb', textAlign: 'center', marginTop: 8, lineHeight: 19 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secTitle: { fontSize: 15, fontWeight: '700', color: COLORS.navy },
  secCount: { fontSize: 12, color: '#888' },
  miniCard: { width: 140, marginRight: 10, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' },
  miniImg: { width: 140, height: 90 },
  miniBody: { padding: 8 },
  miniName: { fontSize: 12, fontWeight: '600', color: '#111' },
  miniSub: { fontSize: 10, color: '#888', marginTop: 2 },
  histItem: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  histThumb: { width: 52, height: 52, borderRadius: 10 },
  histInfo: { flex: 1 },
  histName: { fontSize: 14, fontWeight: '600', color: '#111' },
  histSub: { fontSize: 11, color: '#888', marginTop: 2 },
  histTags: { flexDirection: 'row', gap: 6, marginTop: 6 },
  histTagDone: { backgroundColor: COLORS.navy, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  histTagDoneText: { fontSize: 10, fontWeight: '600', color: '#fff' },
  histTagXp: { backgroundColor: 'rgba(200,168,75,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  histTagXpText: { fontSize: 10, fontWeight: '700', color: COLORS.gold },
});
