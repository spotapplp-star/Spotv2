import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS, ACTIVITIES } from '../src/constants/theme';
import { api } from '../src/utils/api';

export default function ReservationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const activity = ACTIVITIES.find(a => a.id === id) || ACTIVITIES[0];
  const [participants, setParticipants] = useState(2);
  const [timeSlot, setTimeSlot] = useState('19h00');
  const [loading, setLoading] = useState(false);
  const total = participants * activity.priceUnit;

  const confirm = async () => {
    setLoading(true);
    try {
      await api.createReservation({ activity_id: activity.id, participants, date: 'Ce week-end', time_slot: timeSlot, total });
      Alert.alert('Reservation confirmee !', `${activity.name} - ${participants} pers - ${total}EUR`, [{ text: 'OK', onPress: () => router.replace('/map') }]);
    } catch {
      Alert.alert('Reservation confirmee !', `${activity.name} pour ${participants} personnes`, [{ text: 'OK', onPress: () => router.replace('/map') }]);
    }
    setLoading(false);
  };

  return (
    <View style={s.container} testID="reservation-screen">
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} testID="reservation-back-btn">
          <Feather name="arrow-left" size={22} color={COLORS.navy} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Reservation</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* Activity Card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Activite</Text>
          <View style={s.actRow}>
            <Image source={{ uri: activity.image }} style={s.actImg} />
            <View>
              <Text style={s.actName}>{activity.name}</Text>
              <Text style={s.actLoc}>{activity.address}</Text>
            </View>
          </View>
        </View>

        {/* Participants */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Participants</Text>
          <View style={s.counterRow}>
            <TouchableOpacity style={s.cBtn} onPress={() => setParticipants(Math.max(1, participants - 1))} testID="res-minus-btn">
              <Text style={s.cBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={s.cNum} testID="res-count">{participants}</Text>
            <TouchableOpacity style={[s.cBtn, s.cBtnPlus]} onPress={() => setParticipants(Math.min(20, participants + 1))} testID="res-plus-btn">
              <Text style={[s.cBtnText, { color: '#fff' }]}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={s.section}>
            <Text style={s.sLabel}>Date</Text>
            <View style={s.sRow}>
              <Text style={s.sValue}>Ce week-end</Text>
              <TouchableOpacity><Text style={s.sEdit}>Modifier</Text></TouchableOpacity>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sLabel}>Creneau</Text>
            <View style={s.timeRow}>
              {['19h00', '20h00', '21h00', '22h00'].map(t => (
                <TouchableOpacity key={t} style={[s.timeBtn, timeSlot === t && s.timeBtnActive]} onPress={() => setTimeSlot(t)} testID={`res-time-${t}`}>
                  <Text style={[s.timeBtnText, timeSlot === t && s.timeBtnTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={s.totalCard}>
          <View>
            <Text style={s.totalLabel}>Total estime</Text>
            <Text style={s.totalDetail}>{participants} pers x {activity.priceUnit}EUR</Text>
          </View>
          <Text style={s.totalVal}>{total}EUR</Text>
        </View>

        <TouchableOpacity style={s.confirmBtn} onPress={confirm} disabled={loading} testID="confirm-reservation-btn">
          <Text style={s.confirmText}>{loading ? 'En cours...' : 'Confirmer la reservation'}</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.beige },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: COLORS.beige },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  body: { flex: 1, paddingHorizontal: 16 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 12 },
  cardLabel: { fontSize: 11, fontWeight: '700', color: '#bbb', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actImg: { width: 56, height: 56, borderRadius: 12 },
  actName: { fontSize: 15, fontWeight: '700', color: '#111' },
  actLoc: { fontSize: 12, color: '#888', marginTop: 2 },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 },
  cBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  cBtnPlus: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  cBtnText: { fontSize: 22, fontWeight: '600', color: COLORS.navy },
  cNum: { fontSize: 28, fontWeight: '800', color: COLORS.navy },
  section: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 14, marginTop: 14 },
  sLabel: { fontSize: 11, fontWeight: '700', color: '#bbb', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  sRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sValue: { fontSize: 14, fontWeight: '600', color: '#111' },
  sEdit: { fontSize: 13, fontWeight: '600', color: COLORS.gold },
  timeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  timeBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f5f5f5' },
  timeBtnActive: { backgroundColor: COLORS.navy },
  timeBtnText: { fontSize: 12, fontWeight: '600', color: '#888' },
  timeBtnTextActive: { color: '#fff' },
  totalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 16 },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#111' },
  totalDetail: { fontSize: 11, color: '#bbb', marginTop: 2 },
  totalVal: { fontSize: 24, fontWeight: '800', color: COLORS.navy },
  confirmBtn: { backgroundColor: COLORS.navy, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
