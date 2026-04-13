import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';

const MenuItem = ({ icon, iconColor, name, sub, onPress, badge }: any) => (
  <TouchableOpacity style={ms.item} onPress={onPress}>
    <View style={ms.left}>
      <View style={[ms.iconWrap, { backgroundColor: iconColor === COLORS.gold ? 'rgba(200,168,75,0.12)' : 'rgba(13,27,62,0.07)' }]}>
        <Feather name={icon} size={18} color={iconColor || COLORS.navy} />
      </View>
      <View>
        <Text style={ms.name}>{name}</Text>
        <Text style={ms.sub}>{sub}</Text>
      </View>
    </View>
    {badge ? <View style={ms.badge}><Text style={ms.badgeText}>{badge}</Text></View> : <Text style={ms.arrow}>›</Text>}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={s.container} testID="profile-screen">
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>Mon profil</Text>
          <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} testID="profile-close-btn">
            <Feather name="x" size={16} color={COLORS.navy} />
          </TouchableOpacity>
        </View>
        <View style={s.avatarRow}>
          <View style={s.avatar}><Text style={s.avatarText}>{(user?.name || 'P')[0].toUpperCase()}</Text></View>
          <View>
            <Text style={s.userName}>{user?.name || 'Paul'}</Text>
            <Text style={s.userSub}>{user?.city || 'Paris 11e'} - Membre depuis mars 2025</Text>
          </View>
        </View>
        <View style={s.statsCard}>
          <TouchableOpacity style={s.stat} onPress={() => router.push('/activities')}>
            <Text style={s.statNum}>23</Text>
            <Text style={s.statLabel}>SORTIES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.stat, s.statBorder]} onPress={() => router.push('/xp')}>
            <Text style={[s.statNum, { color: COLORS.gold }]}>{user?.xp || 450}</Text>
            <Text style={s.statLabel}>XP</Text>
          </TouchableOpacity>
          <View style={s.stat}>
            <Text style={s.statNum}>{user?.level || 12}</Text>
            <Text style={s.statLabel}>NIVEAU</Text>
          </View>
        </View>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* Mon activite */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>MON ACTIVITE</Text>
          <View style={s.menuCard}>
            <MenuItem icon="star" iconColor={COLORS.gold} name="XP & badges" sub="Niveau 12 - Explorateur Urbain" onPress={() => router.push('/xp')} />
            <MenuItem icon="heart" iconColor={COLORS.gold} name="Favoris & likes" sub="6 activites sauvegardees" onPress={() => router.push('/activities')} />
            <MenuItem icon="clock" iconColor={COLORS.navy} name="Historique" sub="23 activites realisees" onPress={() => router.push('/activities')} />
            <MenuItem icon="calendar" iconColor={COLORS.navy} name="Mes reservations" sub="2 a venir - 3 passees" onPress={() => {}} />
            <MenuItem icon="message-square" iconColor={COLORS.navy} name="Mes avis" sub="2 publies - 1 a laisser" onPress={() => {}} />
          </View>
        </View>

        {/* Espace Createur */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ESPACE CREATEUR</Text>
          <View style={s.menuCard}>
            <MenuItem icon="video" iconColor={COLORS.gold} name="Mes videos" sub="2 publiees - 1 en attente" onPress={() => router.push('/creator')} />
            <MenuItem icon="download" iconColor={COLORS.gold} name="Publier une video" sub="MP4 - vertical - max 60 sec" onPress={() => router.push('/creator')} badge="+ Creer" />
            <MenuItem icon="bar-chart-2" iconColor={COLORS.gold} name="Statistiques createur" sub="1 240 vues - 87 reservations" onPress={() => router.push('/creator')} />
          </View>
        </View>

        {/* Paiements */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>PAIEMENTS</Text>
          <View style={s.menuCard}>
            <MenuItem icon="credit-card" iconColor={COLORS.navy} name="Moyens de paiement" sub="Visa .... 4242" onPress={() => {}} />
            <MenuItem icon="file-text" iconColor={COLORS.navy} name="Historique transactions" sub="3 reservations ce mois - +14EUR commissions" onPress={() => {}} />
          </View>
        </View>

        {/* Compte */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>COMPTE</Text>
          <View style={s.menuCard}>
            <MenuItem icon="user" iconColor={COLORS.navy} name="Modifier mon profil" sub="Nom, photo, ville" onPress={() => {}} />
            <MenuItem icon="bell" iconColor={COLORS.navy} name="Notifications" sub="Activees" onPress={() => {}} />
          </View>
        </View>

        {/* Admin */}
        {user?.is_admin && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>ADMINISTRATION</Text>
            <View style={s.menuCard}>
              <MenuItem icon="shield" iconColor={COLORS.gold} name="Panel Admin" sub="Gestion activites, utilisateurs, videos" onPress={() => router.push('/admin')} />
            </View>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} testID="profile-logout-btn">
          <Feather name="log-out" size={16} color={COLORS.red} />
          <Text style={s.logoutText}>Deconnexion</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const ms = StyleSheet.create({
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '600', color: '#111' },
  sub: { fontSize: 11, color: '#aaa', marginTop: 1 },
  arrow: { fontSize: 20, color: '#ccc', fontWeight: '300' },
  badge: { backgroundColor: COLORS.yellow, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700', color: COLORS.navy },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgProfile },
  header: { backgroundColor: COLORS.bgProfile, paddingTop: 52, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.navy },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(13,27,62,0.07)', justifyContent: 'center', alignItems: 'center' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800', color: COLORS.yellow },
  userName: { fontSize: 21, fontWeight: '800', color: COLORS.navy },
  userSub: { fontSize: 12, color: '#aaa', marginTop: 2 },
  statsCard: { flexDirection: 'row', backgroundColor: COLORS.beigeDark, borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  stat: { flex: 1, padding: 14, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(13,27,62,0.08)' },
  statNum: { fontSize: 22, fontWeight: '800', color: COLORS.navy },
  statLabel: { fontSize: 9, color: '#aaa', letterSpacing: 0.8, marginTop: 3, textTransform: 'uppercase' },
  body: { flex: 1 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#bbb', letterSpacing: 1.5, marginBottom: 10 },
  menuCard: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingVertical: 16 },
  logoutText: { fontSize: 14, fontWeight: '600', color: COLORS.red },
});
