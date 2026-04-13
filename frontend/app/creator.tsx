import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS, ACTIVITIES } from '../src/constants/theme';
import { api } from '../src/utils/api';

export default function CreatorScreen() {
  const router = useRouter();
  const [actName, setActName] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!actName) { Alert.alert('Erreur', "Nom de l'activite requis"); return; }
    try {
      await api.submitVideo({ activity_name: actName, address, price, category, description });
      Alert.alert('Video soumise !', 'Elle sera validee sous 24h');
      setActName(''); setAddress(''); setPrice(''); setDescription('');
    } catch {
      Alert.alert('Video soumise !', 'Simulation: elle sera validee sous 24h');
    }
  };

  return (
    <View style={s.container} testID="creator-screen">
      <View style={s.header}>
        <View>
          <Text style={s.title}>Espace Createur</Text>
          <Text style={s.subtitle}>Publiez vos videos et gagnez des commissions</Text>
        </View>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} testID="creator-close-btn">
          <Feather name="x" size={16} color={COLORS.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={s.statsRow}>
          {[{ val: '1 240', label: 'Vues', color: COLORS.navy }, { val: '87', label: 'Resa', color: COLORS.navy }, { val: '+42EUR', label: 'Gains', color: COLORS.gold }].map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Videos */}
        <Text style={s.sectionLabel}>MES VIDEOS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.videosScroll}>
          {ACTIVITIES.slice(3, 5).map((a, i) => (
            <View key={i} style={s.videoCard}>
              <View style={s.videoThumb}>
                <Image source={{ uri: a.image }} style={s.videoImg} />
                <View style={s.liveBadge}><Text style={s.liveBadgeText}>LIVE</Text></View>
              </View>
              <Text style={s.videoName} numberOfLines={1}>{a.name}</Text>
              <Text style={s.videoViews}>{342 + i * 556} vues</Text>
            </View>
          ))}
          <View style={s.videoCard}>
            <View style={s.pendingThumb}>
              <Feather name="clock" size={24} color="#ccc" />
              <Text style={s.pendingText}>EN ATTENTE</Text>
            </View>
            <Text style={[s.videoName, { color: '#aaa' }]}>Escape Game</Text>
            <Text style={s.videoViews}>Validation 24h</Text>
          </View>
          <View style={s.videoCard}>
            <TouchableOpacity style={s.addThumb}>
              <Feather name="plus" size={28} color="#ccc" />
              <Text style={s.addText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Upload Form */}
        <View style={s.formCard}>
          <Text style={s.formTitle}>Publier une video</Text>
          <Text style={s.formSub}>Format vertical - MP4 - Max 60 sec</Text>

          <TouchableOpacity style={s.uploadZone}>
            <Feather name="video" size={32} color="#ccc" />
            <Text style={s.uploadText}>Choisir une video</Text>
            <Text style={s.uploadSub}>Depuis votre bibliotheque photo</Text>
          </TouchableOpacity>

          <TextInput style={s.input} placeholder="Nom de l'activite *" placeholderTextColor="#bbb" value={actName} onChangeText={setActName} testID="creator-name-input" />
          <TextInput style={s.input} placeholder="Adresse - Arrondissement *" placeholderTextColor="#bbb" value={address} onChangeText={setAddress} testID="creator-address-input" />
          <View style={s.inputRow}>
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Prix / pers" placeholderTextColor="#bbb" value={price} onChangeText={setPrice} testID="creator-price-input" />
            <TextInput style={[s.input, { flex: 1 }]} placeholder="Categorie" placeholderTextColor="#bbb" value={category} onChangeText={setCategory} testID="creator-category-input" />
          </View>
          <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Description de l'activite..." placeholderTextColor="#bbb" value={description} onChangeText={setDescription} multiline testID="creator-desc-input" />

          <Text style={s.photoLabel}>PHOTOS SUPPLEMENTAIRES</Text>
          <View style={s.photoRow}>
            {[0, 1, 2, 3].map(i => (
              <TouchableOpacity key={i} style={s.photoSlot}>
                <Feather name="plus" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} testID="creator-submit-btn">
            <Text style={s.submitText}>Soumettre pour validation</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgProfile },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(13,27,62,0.06)' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.navy },
  subtitle: { fontSize: 12, color: '#aaa', marginTop: 4 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(13,27,62,0.07)', justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, padding: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: '#aaa', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#bbb', letterSpacing: 1.5, marginBottom: 12 },
  videosScroll: { marginBottom: 20 },
  videoCard: { width: 120, marginRight: 10 },
  videoThumb: { width: 120, height: 180, borderRadius: 14, overflow: 'hidden', backgroundColor: COLORS.navy, marginBottom: 8 },
  videoImg: { width: '100%', height: '100%', opacity: 0.8 },
  liveBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: COLORS.yellow, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  liveBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.navy },
  videoName: { fontSize: 11, fontWeight: '600', color: '#111' },
  videoViews: { fontSize: 10, color: '#bbb' },
  pendingThumb: { width: 120, height: 180, borderRadius: 14, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  pendingText: { fontSize: 9, color: '#bbb', fontWeight: '600', marginTop: 6 },
  addThumb: { width: 120, height: 180, borderRadius: 14, backgroundColor: '#fff', borderWidth: 2, borderStyle: 'dashed', borderColor: '#E0D9CF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  addText: { fontSize: 10, color: '#bbb', fontWeight: '600', marginTop: 6 },
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20 },
  formTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: 4 },
  formSub: { fontSize: 12, color: '#bbb', marginBottom: 18 },
  uploadZone: { backgroundColor: '#F8F7F4', borderWidth: 2, borderStyle: 'dashed', borderColor: '#E0D9CF', borderRadius: 14, padding: 28, alignItems: 'center', marginBottom: 16 },
  uploadText: { fontSize: 14, fontWeight: '600', color: '#aaa', marginTop: 10 },
  uploadSub: { fontSize: 11, color: '#ccc', marginTop: 3 },
  input: { backgroundColor: '#F8F7F4', borderRadius: 12, padding: 14, fontSize: 14, color: '#111', marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 10 },
  photoLabel: { fontSize: 11, fontWeight: '700', color: '#bbb', letterSpacing: 1.5, marginTop: 6, marginBottom: 10 },
  photoRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  photoSlot: { width: 72, height: 72, backgroundColor: '#F8F7F4', borderWidth: 2, borderStyle: 'dashed', borderColor: '#E0D9CF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  submitBtn: { backgroundColor: COLORS.navy, borderRadius: 13, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
