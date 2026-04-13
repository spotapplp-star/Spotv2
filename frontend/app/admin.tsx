import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';
import { api } from '../src/utils/api';

export default function AdminScreen() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({ users: 0, activities: 0, reservations: 0, revenue: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, a, u] = await Promise.all([api.getAdminStats(), api.getAdminActivities(), api.getAdminUsers()]);
      setStats(s); setActivities(a); setUsers(u);
    } catch {}
  };

  return (
    <View style={s.container} testID="admin-screen">
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} testID="admin-back-btn">
            <Feather name="arrow-left" size={22} color={COLORS.navy} />
          </TouchableOpacity>
          <Text style={s.title}>Panel Admin</Text>
          <View style={s.adminBadge}><Text style={s.adminBadgeText}>ADMIN</Text></View>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { val: stats.users, label: 'Utilisateurs' },
          { val: stats.activities, label: 'Activites' },
          { val: stats.reservations, label: 'Reservations' },
          { val: `${stats.revenue}EUR`, label: 'Revenus' },
        ].map((st, i) => (
          <View key={i} style={s.statCard}>
            <Text style={s.statVal}>{st.val}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {['Activites', 'Utilisateurs', 'Videos'].map((t, i) => (
          <TouchableOpacity key={i} style={[s.tab, tab === i && s.tabActive]} onPress={() => setTab(i)} testID={`admin-tab-${t.toLowerCase()}`}>
            <Text style={[s.tabText, tab === i && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* Activities Tab */}
        {tab === 0 && (
          <View>
            {activities.map((a, i) => (
              <View key={i} style={s.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemName}>{a.name}</Text>
                  <Text style={s.itemSub}>{a.category} - {a.arrondissement} - {a.status || 'active'}</Text>
                </View>
                <View style={s.itemActions}>
                  <TouchableOpacity style={s.editBtn}><Feather name="edit-2" size={14} color={COLORS.navy} /></TouchableOpacity>
                  <TouchableOpacity style={s.disableBtn}><Feather name="eye-off" size={14} color="#888" /></TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={s.addBtn} testID="admin-add-activity-btn">
              <Feather name="plus" size={18} color="#fff" />
              <Text style={s.addBtnText}>Ajouter une activite</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Users Tab */}
        {tab === 1 && (
          <View>
            {users.map((u, i) => (
              <View key={i} style={s.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemName}>{u.name}</Text>
                  <Text style={s.itemSub}>{u.email} - {u.role} - {u.xp || 0} XP</Text>
                </View>
                <TouchableOpacity style={s.editBtn}><Feather name="more-horizontal" size={16} color="#888" /></TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Videos Tab */}
        {tab === 2 && (
          <View>
            <View style={s.emptyState}>
              <Feather name="video" size={40} color="#ddd" />
              <Text style={s.emptyText}>Aucune video en attente de validation</Text>
            </View>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.beige },
  header: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.navy },
  adminBadge: { backgroundColor: COLORS.yellow, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  adminBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.navy },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: COLORS.navy },
  statLabel: { fontSize: 9, color: '#888', marginTop: 2, textTransform: 'uppercase' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff' },
  tabActive: { backgroundColor: COLORS.navy },
  tabText: { fontSize: 13, fontWeight: '600', color: '#888' },
  tabTextActive: { color: '#fff' },
  body: { flex: 1, paddingHorizontal: 16 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111' },
  itemSub: { fontSize: 11, color: '#888', marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  disableBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.navy, borderRadius: 14, paddingVertical: 14, marginTop: 8 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: '#bbb', marginTop: 12 },
});
