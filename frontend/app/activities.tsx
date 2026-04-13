import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS, ACTIVITIES } from '../src/constants/theme';

export default function ActivitiesScreen() {
  const router = useRouter();

  return (
    <View style={s.container} testID="activities-screen">
      <View style={s.header}>
        <Text style={s.title}>Mes activites</Text>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} testID="activities-close-btn">
          <Feather name="x" size={18} color={COLORS.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* Liked */}
        <View style={s.section}>
          <View style={s.secHead}>
            <View style={s.secTitleRow}>
              <Feather name="heart" size={16} color={COLORS.navy} />
              <Text style={s.secTitle}>Likes du moment</Text>
            </View>
            <Text style={s.secCount}>4 activites</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
            {ACTIVITIES.slice(0, 4).map((a, i) => (
              <TouchableOpacity key={i} style={s.miniCard} onPress={() => router.push(`/detail?id=${a.id}`)}>
                <Image source={{ uri: a.image }} style={s.miniImg} />
                <View style={s.miniBody}>
                  <Text style={s.miniName} numberOfLines={1}>{a.name}</Text>
                  <Text style={s.miniSub}>{a.arrondissement}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Favorites */}
        <View style={s.section}>
          <View style={s.secHead}>
            <View style={s.secTitleRow}>
              <Feather name="heart" size={16} color={COLORS.yellow} />
              <Text style={s.secTitle}>Favoris</Text>
            </View>
            <Text style={s.secCount}>2 activites</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.hScroll}>
            {ACTIVITIES.slice(1, 3).map((a, i) => (
              <TouchableOpacity key={i} style={s.miniCard} onPress={() => router.push(`/detail?id=${a.id}`)}>
                <Image source={{ uri: a.image }} style={s.miniImg} />
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
            <Text style={s.secCount}>3 sorties</Text>
          </View>
          {[
            { act: ACTIVITIES[3], when: 'Hier soir - 3 personnes', xp: 120 },
            { act: ACTIVITIES[0], when: 'Samedi dernier - 4 pers', xp: 200 },
            { act: ACTIVITIES[2], when: 'Il y a 2 semaines - Solo', xp: 130 },
          ].map((h, i) => (
            <TouchableOpacity key={i} style={s.histItem} onPress={() => router.push(`/detail?id=${h.act.id}`)}>
              <Image source={{ uri: h.act.image }} style={s.histThumb} />
              <View style={s.histInfo}>
                <Text style={s.histName}>{h.act.name}</Text>
                <Text style={s.histSub}>{h.when}</Text>
                <View style={s.histTags}>
                  <View style={s.histTagDone}><Text style={s.histTagDoneText}>Fait</Text></View>
                  <View style={s.histTagXp}><Text style={s.histTagXpText}>+{h.xp} XP</Text></View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trajet */}
        <View style={s.section}>
          <View style={s.secHead}>
            <View style={s.secTitleRow}>
              <Feather name="activity" size={16} color={COLORS.navy} />
              <Text style={s.secTitle}>Mon trajet</Text>
            </View>
            <Text style={s.secCount}>Dernier parcours</Text>
          </View>
          <View style={s.trajetCard}>
            <View style={s.trajetStops}>
              {[
                { name: 'Depart - Oberkampf', detail: 'Point de rendez-vous', time: '18h30', color: COLORS.navy },
                { name: 'Le Perchoir', detail: 'Menilmontant - 11e', time: '19h15', color: COLORS.yellow },
                { name: 'Diner dans le Noir', detail: '9e - Gastronomie immersive', time: '21h00', color: COLORS.yellow },
              ].map((stop, i) => (
                <View key={i} style={s.trajetRow}>
                  <View style={s.trajetDotCol}>
                    <View style={[s.trajetDot, { backgroundColor: stop.color }]} />
                    {i < 2 && <View style={s.trajetLine} />}
                  </View>
                  <View style={s.trajetInfo}>
                    <Text style={s.trajetName}>{stop.name}</Text>
                    <Text style={s.trajetDetail}>{stop.detail}</Text>
                  </View>
                  <Text style={s.trajetTime}>{stop.time}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
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
  section: { paddingHorizontal: 16, paddingTop: 20 },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secTitle: { fontSize: 15, fontWeight: '700', color: COLORS.navy },
  secCount: { fontSize: 12, color: '#888' },
  hScroll: { marginBottom: 4 },
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
  trajetCard: { backgroundColor: '#f8f7f4', borderRadius: 16, padding: 16 },
  trajetStops: {},
  trajetRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  trajetDotCol: { alignItems: 'center', width: 20 },
  trajetDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  trajetLine: { width: 2, height: 30, backgroundColor: '#ddd', marginVertical: 2 },
  trajetInfo: { flex: 1, marginLeft: 10 },
  trajetName: { fontSize: 13, fontWeight: '600', color: '#111' },
  trajetDetail: { fontSize: 11, color: '#888', marginTop: 1 },
  trajetTime: { fontSize: 12, fontWeight: '600', color: '#888' },
});
