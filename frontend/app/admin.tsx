import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';
import { api } from '../src/utils/api';
import { loadActivities, addActivityToStore, deleteActivityFromStore, setStoredActivities } from '../src/utils/storage';

const CATEGORIES = ['Culturel', 'Festif', 'Sport', 'Creatif', 'Immersif', 'Plein air', 'Gastronomie', 'Aventure'];

const emptyForm = {
  name: '', description: '', address: '', arrondissement: '', lat: '', lng: '',
  category: '', price: '', price_unit: '', duration: '', rating: '', xp: '150',
  tags: '', image: '', schedule_text: '',
};

export default function AdminScreen() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({ users: 0, activities: 0, reservations: 0, revenue: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, a, u] = await Promise.all([api.getAdminStats().catch(() => ({ users: 0, activities: 0, reservations: 0, revenue: 0 })), api.getAdminActivities().catch(() => []), api.getAdminUsers().catch(() => [])]);
      setStats(s); setActivities(a); setUsers(u);
    } catch {}
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (act: any) => {
    setForm({
      name: act.name || '', description: act.description || '', address: act.address || '',
      arrondissement: act.arrondissement || '', lat: String(act.lat || ''), lng: String(act.lng || ''),
      category: act.category || '', price: act.price || '', price_unit: String(act.price_unit || act.priceUnit || ''),
      duration: act.duration || '', rating: String(act.rating || ''), xp: String(act.xp || '150'),
      tags: (act.tags || []).join(', '), image: act.image || '',
      schedule_text: (act.schedule || []).map((s: any) => `${s.day}: ${s.hours}`).join('\n'),
    });
    setEditId(act.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { Alert.alert('Erreur', 'Le nom est obligatoire'); return; }
    if (!form.description.trim()) { Alert.alert('Erreur', 'La description est obligatoire'); return; }

    const schedule = form.schedule_text.split('\n').filter(Boolean).map(line => {
      const [day, ...rest] = line.split(':');
      const hours = rest.join(':').trim();
      return { day: day.trim(), hours, closed: hours.toLowerCase().includes('ferm') };
    });

    const actData = {
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      arrondissement: form.arrondissement.trim(),
      lat: parseFloat(form.lat) || 48.8534,
      lng: parseFloat(form.lng) || 2.3488,
      category: form.category,
      price: form.price.trim(),
      price_unit: parseInt(form.price_unit) || 0,
      duration: form.duration.trim(),
      rating: parseFloat(form.rating) || 0,
      xp: parseInt(form.xp) || 150,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3),
      image: form.image.trim(),
      schedule,
      status: 'active',
    };

    try {
      if (editId) {
        await api.updateActivity(editId, actData);
        Alert.alert('Modifie !', `${actData.name} a ete mis a jour`);
      } else {
        await addActivityToStore(actData);
        Alert.alert('Ajoute !', `${actData.name} est maintenant visible sur la carte et dans le feed`);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      loadData();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Echec de sauvegarde');
    }
  };

  const handleDelete = (act: any) => {
    Alert.alert('Supprimer ?', `Voulez-vous supprimer "${act.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive', onPress: async () => {
          await deleteActivityFromStore(act.id);
          loadData();
        }
      },
    ]);
  };

  const updateField = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  if (showForm) {
    return (
      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} testID="admin-form">
        <View style={s.header}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={() => setShowForm(false)} testID="admin-form-back">
              <Feather name="arrow-left" size={22} color={COLORS.navy} />
            </TouchableOpacity>
            <Text style={s.title}>{editId ? 'Modifier' : 'Ajouter'} une activite</Text>
          </View>
        </View>
        <ScrollView style={s.formBody} showsVerticalScrollIndicator={false}>
          <Text style={s.fieldLabel}>NOM *</Text>
          <TextInput style={s.input} placeholder="Nom de l'activite" placeholderTextColor="#bbb" value={form.name} onChangeText={v => updateField('name', v)} testID="admin-input-name" />

          <Text style={s.fieldLabel}>DESCRIPTION *</Text>
          <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Description de l'activite" placeholderTextColor="#bbb" value={form.description} onChangeText={v => updateField('description', v)} multiline testID="admin-input-desc" />

          <Text style={s.fieldLabel}>ADRESSE COMPLETE *</Text>
          <TextInput style={s.input} placeholder="17 Rue de la Roquette, Paris" placeholderTextColor="#bbb" value={form.address} onChangeText={v => updateField('address', v)} testID="admin-input-address" />

          <Text style={s.fieldLabel}>ARRONDISSEMENT *</Text>
          <TextInput style={s.input} placeholder="11e" placeholderTextColor="#bbb" value={form.arrondissement} onChangeText={v => updateField('arrondissement', v)} testID="admin-input-arrond" />

          <Text style={s.fieldLabel}>CATEGORIE *</Text>
          <View style={s.catGrid}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} style={[s.catChip, form.category === c && s.catChipActive]} onPress={() => updateField('category', c)}>
                <Text style={[s.catChipText, form.category === c && { color: '#fff' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.row}>
            <View style={s.halfField}>
              <Text style={s.fieldLabel}>PRIX / PERS (EUR) *</Text>
              <TextInput style={s.input} placeholder="28" placeholderTextColor="#bbb" value={form.price_unit} onChangeText={v => { updateField('price_unit', v); updateField('price', v ? `${v}EUR/pers` : ''); }} keyboardType="numeric" testID="admin-input-price" />
            </View>
            <View style={s.halfField}>
              <Text style={s.fieldLabel}>DUREE *</Text>
              <TextInput style={s.input} placeholder="1h30" placeholderTextColor="#bbb" value={form.duration} onChangeText={v => updateField('duration', v)} testID="admin-input-duration" />
            </View>
          </View>

          <Text style={s.fieldLabel}>HORAIRES (un par ligne, format "Jour: Heures")</Text>
          <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} placeholder={"Lun-Ven: 14h-23h\nSam-Dim: 10h-23h"} placeholderTextColor="#bbb" value={form.schedule_text} onChangeText={v => updateField('schedule_text', v)} multiline testID="admin-input-schedule" />

          <View style={s.row}>
            <View style={s.halfField}>
              <Text style={s.fieldLabel}>NOTE (0-5)</Text>
              <TextInput style={s.input} placeholder="4.8" placeholderTextColor="#bbb" value={form.rating} onChangeText={v => updateField('rating', v)} keyboardType="numeric" testID="admin-input-rating" />
            </View>
            <View style={s.halfField}>
              <Text style={s.fieldLabel}>XP A GAGNER</Text>
              <TextInput style={s.input} placeholder="150" placeholderTextColor="#bbb" value={form.xp} onChangeText={v => updateField('xp', v)} keyboardType="numeric" testID="admin-input-xp" />
            </View>
          </View>

          <Text style={s.fieldLabel}>TAGS (max 3, separes par virgules)</Text>
          <TextInput style={s.input} placeholder="Escape Game, Groupe, Immersif" placeholderTextColor="#bbb" value={form.tags} onChangeText={v => updateField('tags', v)} testID="admin-input-tags" />

          <Text style={s.fieldLabel}>URL IMAGE</Text>
          <TextInput style={s.input} placeholder="https://images.unsplash.com/..." placeholderTextColor="#bbb" value={form.image} onChangeText={v => updateField('image', v)} testID="admin-input-image" />

          <Text style={s.fieldLabel}>COORDONNEES GPS</Text>
          <Text style={s.fieldHelper}>Trouvez les coordonnees sur Google Maps (clic droit sur un lieu)</Text>
          <View style={s.row}>
            <View style={s.halfField}>
              <TextInput style={s.input} placeholder="Latitude (48.8542)" placeholderTextColor="#bbb" value={form.lat} onChangeText={v => updateField('lat', v)} keyboardType="numeric" testID="admin-input-lat" />
            </View>
            <View style={s.halfField}>
              <TextInput style={s.input} placeholder="Longitude (2.3712)" placeholderTextColor="#bbb" value={form.lng} onChangeText={v => updateField('lng', v)} keyboardType="numeric" testID="admin-input-lng" />
            </View>
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} testID="admin-submit-btn">
            <Text style={s.submitText}>{editId ? "Modifier l'activite" : "Ajouter l'activite"}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
          { val: stats.users, label: 'Utilisateurs' }, { val: stats.activities, label: 'Activites' },
          { val: stats.reservations, label: 'Reservations' }, { val: `${stats.revenue}EUR`, label: 'Revenus' },
        ].map((st, i) => (
          <View key={i} style={s.statCard}>
            <Text style={s.statVal}>{st.val}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={s.tabsRow}>
        {['Activites', 'Utilisateurs', 'Videos'].map((t, i) => (
          <TouchableOpacity key={i} style={[s.tabItem, tab === i && s.tabItemActive]} onPress={() => setTab(i)} testID={`admin-tab-${t.toLowerCase()}`}>
            <Text style={[s.tabItemText, tab === i && s.tabItemTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* Activities Tab */}
        {tab === 0 && (
          <View>
            {activities.length === 0 && (
              <View style={s.emptyState}>
                <Feather name="map-pin" size={40} color="#ddd" />
                <Text style={s.emptyText}>Aucune activite pour le moment</Text>
                <Text style={s.emptySubText}>Ajoutez des activites via le bouton ci-dessous</Text>
              </View>
            )}
            {activities.map((a, i) => (
              <View key={i} style={s.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemName}>{a.name}</Text>
                  <Text style={s.itemSub}>{a.category} - {a.arrondissement} - {a.status || 'active'}</Text>
                </View>
                <View style={s.itemActions}>
                  <TouchableOpacity style={s.editBtn} onPress={() => openEditForm(a)} testID={`admin-edit-${i}`}>
                    <Feather name="edit-2" size={14} color={COLORS.navy} />
                  </TouchableOpacity>
                  <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(a)} testID={`admin-delete-${i}`}>
                    <Feather name="trash-2" size={14} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={s.addBtn} onPress={openAddForm} testID="admin-add-activity-btn">
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
              </View>
            ))}
          </View>
        )}

        {/* Videos Tab */}
        {tab === 2 && (
          <View style={s.emptyState}>
            <Feather name="video" size={40} color="#ddd" />
            <Text style={s.emptyText}>Aucune video en attente de validation</Text>
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
  tabsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 12 },
  tabItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff' },
  tabItemActive: { backgroundColor: COLORS.navy },
  tabItemText: { fontSize: 13, fontWeight: '600', color: '#888' },
  tabItemTextActive: { color: '#fff' },
  body: { flex: 1, paddingHorizontal: 16 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111' },
  itemSub: { fontSize: 11, color: '#888', marginTop: 2 },
  itemActions: { flexDirection: 'row', gap: 8 },
  editBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,68,85,0.08)', justifyContent: 'center', alignItems: 'center' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.navy, borderRadius: 14, paddingVertical: 14, marginTop: 8 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: '#888', marginTop: 12 },
  emptySubText: { fontSize: 12, color: '#bbb', marginTop: 4 },
  // Form styles
  formBody: { flex: 1, paddingHorizontal: 20 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, marginTop: 14 },
  fieldHelper: { fontSize: 11, color: '#aaa', marginBottom: 8, fontStyle: 'italic' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 14, color: '#111', borderWidth: 1, borderColor: '#f0f0f0' },
  row: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  catChipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  catChipText: { fontSize: 12, fontWeight: '600', color: '#888' },
  submitBtn: { backgroundColor: COLORS.navy, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
