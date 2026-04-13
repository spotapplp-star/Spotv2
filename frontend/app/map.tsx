import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Dimensions, ScrollView, Modal, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { COLORS, ACTIVITIES } from '../src/constants/theme';
import { api } from '../src/utils/api';
import { useAuth } from '../src/context/AuthContext';

const { width: W, height: H } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const webViewRef = useRef<any>(null);

  const [activities, setActivities] = useState(ACTIVITIES);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showSheet, setShowSheet] = useState(params.mode === 'custom');
  const [sheetTab, setSheetTab] = useState(0); // 0=MEMBRES, 1=MOOD, 2=PRATIQUE

  // Configurator state
  const [members, setMembers] = useState('Solo');
  const [groupCount, setGroupCount] = useState(4);
  const [moods, setMoods] = useState(['Immersif', 'Plein air', 'Culturel', 'Festif', 'Sport', 'Gastro']);
  const [energy, setEnergy] = useState(70);
  const [walkDesire, setWalkDesire] = useState(50);
  const [openness, setOpenness] = useState(50);
  const [radius, setRadius] = useState(5);
  const [budget, setBudget] = useState(30);
  const [when, setWhen] = useState('Maintenant');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const data = await api.getActivities();
      if (data?.length) setActivities(data);
    } catch { /* use fallback */ }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 1) {
      const filtered = activities.filter(a => a.name.toLowerCase().includes(text.toLowerCase()) || a.category.toLowerCase().includes(text.toLowerCase()));
      setSearchResults(filtered.slice(0, 5));
    } else {
      setSearchResults([]);
    }
  };

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'pinClick') {
        const act = activities.find(a => a.id === data.id || a.name === data.name);
        if (act) setSelectedActivity(act);
      }
    } catch {}
  };

  const mapHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%}
.pin{width:36px;height:44px;display:flex;flex-direction:column;align-items:center;cursor:pointer}
.pin-circle{width:32px;height:32px;background:#0D1B3E;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)}
.pin-tail{width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #0D1B3E;margin-top:-2px}
.pin.active .pin-circle{background:#F5C542}
.pin.active .pin-tail{border-top-color:#F5C542}
.pin-label{position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:#fff;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:600;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.15);color:#0D1B3E}
.leaflet-control-zoom{display:none}
</style></head><body>
<div id="map"></div>
<script>
var map=L.map('map',{zoomControl:false}).setView([48.8534,2.3488],12.5);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19,attribution:''}).addTo(map);
var activities=${JSON.stringify(activities.map(a => ({ id: a.id, name: a.name, lat: a.lat, lng: a.lng, rating: a.rating })))};
activities.forEach(function(a){
  var icon=L.divIcon({className:'',html:'<div class="pin" id="pin-'+a.id+'"><div class="pin-label">'+a.name.substring(0,18)+'</div><div class="pin-circle"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#0D1B3E"/></svg></div><div class="pin-tail"></div></div>',iconSize:[36,44],iconAnchor:[18,44]});
  L.marker([a.lat,a.lng],{icon:icon}).addTo(map).on('click',function(){
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'pinClick',id:a.id,name:a.name}));
  });
});
</script></body></html>`;

  const toggleMood = (mood: string) => {
    setMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
  };

  const moodName = energy < 20 ? 'Au repos' : energy < 40 ? 'Tranquille' : energy < 60 ? 'Equilibre' : energy < 80 ? 'Dynamique' : 'Intense';

  const MOOD_ITEMS = [
    { name: 'Immersif', icon: 'eye' },
    { name: 'Plein air', icon: 'sun' },
    { name: 'Culturel', icon: 'book' },
    { name: 'Festif', icon: 'music' },
    { name: 'Sport', icon: 'zap' },
    { name: 'Gastro', icon: 'coffee' },
  ];

  const generateParcours = () => {
    setShowSheet(false);
    router.push('/loading-screen');
  };

  return (
    <View style={s.container} testID="map-screen">
      {/* Map WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={s.map}
        onMessage={handleMapMessage}
        javaScriptEnabled
        scrollEnabled={false}
      />

      {/* Search Bar */}
      <View style={s.searchBar}>
        <Feather name="search" size={16} color="#ccc" style={s.searchIcon} />
        <TextInput
          style={s.searchInput}
          placeholder="Recherche une activite a Paris..."
          placeholderTextColor="#bbb"
          value={searchText}
          onChangeText={handleSearch}
          testID="map-search-input"
        />
        <TouchableOpacity style={s.profileBtn} onPress={() => router.push('/profile')} testID="map-profile-btn">
          <Feather name="user" size={17} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={s.searchResults}>
          {searchResults.map((a, i) => (
            <TouchableOpacity key={i} style={s.searchItem} onPress={() => { setSelectedActivity(a); setSearchResults([]); setSearchText(''); }}>
              <Text style={s.searchItemName}>{a.name}</Text>
              <Text style={s.searchItemSub}>{a.arrondissement} - {a.category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Activity Popup */}
      {selectedActivity && (
        <View style={s.popup}>
          <View style={s.popupHead}>
            <View style={{ flex: 1 }}>
              <Text style={s.popupName}>{selectedActivity.name}</Text>
              <Text style={s.popupLoc}>{selectedActivity.address}</Text>
            </View>
            <TouchableOpacity style={s.popupClose} onPress={() => setSelectedActivity(null)} testID="popup-close-btn">
              <Feather name="x" size={16} color="#888" />
            </TouchableOpacity>
          </View>
          <Text style={s.popupDesc} numberOfLines={2}>{selectedActivity.description}</Text>
          <View style={s.popupTags}>
            {selectedActivity.tags?.slice(0, 3).map((t: string, i: number) => (
              <View key={i} style={s.popupTag}><Text style={s.popupTagText}>{t}</Text></View>
            ))}
          </View>
          <View style={s.popupXpRow}>
            <Text style={s.popupXpLabel}>A gagner</Text>
            <Text style={s.popupXpVal}>+{selectedActivity.xp} XP</Text>
          </View>
          <View style={s.popupActions}>
            <TouchableOpacity style={s.popupBtnSec} onPress={() => { setSelectedActivity(null); router.push(`/detail?id=${selectedActivity.id}`); }} testID="popup-view-btn">
              <Text style={s.popupBtnSecText}>Voir l'activite</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.popupBtnPri} onPress={() => { setSelectedActivity(null); router.push(`/reservation?id=${selectedActivity.id}`); }} testID="popup-reserve-btn">
              <Text style={s.popupBtnPriText}>Reserver</Text>
              <Feather name="arrow-right" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Navbar */}
      <View style={s.navbar}>
        <View style={s.navInner}>
          <TouchableOpacity style={s.navBtn} onPress={() => router.push('/activities')} testID="nav-activities-btn">
            <Feather name="heart" size={20} color={COLORS.navy} />
            <Text style={s.navLabel}>Activite</Text>
          </TouchableOpacity>
          <View style={{ width: 70 }} />
          <TouchableOpacity style={s.navBtn} onPress={() => router.push('/feed')} testID="nav-explorer-btn">
            <Ionicons name="compass-outline" size={22} color={COLORS.navy} />
            <Text style={s.navLabel}>Explorer</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.navCenter} onPress={() => setShowSheet(true)} testID="nav-center-btn">
          <Feather name="play" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={s.xpZone} onPress={() => router.push('/xp')} testID="nav-xp-bar">
          <View style={s.xpRow}>
            <Text style={s.xpLevel}>Niveau {user?.level || 12}</Text>
            <Text style={s.xpVal}>{user?.xp || 450} XP</Text>
          </View>
          <View style={s.xpTrack}><View style={[s.xpFill, { width: '35%' }]} /></View>
        </TouchableOpacity>
      </View>

      {/* Configurator Sheet */}
      <Modal visible={showSheet} animationType="slide" transparent testID="configurator-modal">
        <View style={s.sheetOverlay}>
          <View style={s.sheet}>
            <View style={s.sheetPill} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Personnalisation</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity style={s.skipBtn} onPress={generateParcours} testID="sheet-skip-btn">
                  <Text style={s.skipBtnText}>Skip</Text>
                  <Feather name="arrow-right" size={12} color={COLORS.navy} />
                </TouchableOpacity>
                <TouchableOpacity style={s.sheetClose} onPress={() => setShowSheet(false)} testID="sheet-close-btn">
                  <Feather name="x" size={16} color={COLORS.navy} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tabs */}
            <View style={s.tabs}>
              {['MEMBRES', 'MOOD', 'PRATIQUE'].map((tab, i) => (
                <TouchableOpacity key={i} style={[s.tab, sheetTab === i && s.tabActive]} onPress={() => setSheetTab(i)} testID={`sheet-tab-${tab.toLowerCase()}`}>
                  <Text style={[s.tabText, sheetTab === i && s.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Step dots */}
            <View style={s.stepDots}>
              {[0, 1, 2].map(i => (
                <View key={i} style={[s.stepDot, i === sheetTab && s.stepDotActive, i < sheetTab && s.stepDotDone]} />
              ))}
            </View>

            <ScrollView style={s.sheetContent} showsVerticalScrollIndicator={false}>
              {/* MEMBRES TAB */}
              {sheetTab === 0 && (
                <View testID="tab-membres-content">
                  <View style={s.memGrid}>
                    {[{n:'Solo',icon:'user'},{n:'Duo',icon:'users'},{n:'Trio',icon:'users'},{n:'Groupe',icon:'users'}].map(m => (
                      <TouchableOpacity key={m.n} style={[s.memCard, members === m.n && s.memCardActive]} onPress={() => setMembers(m.n)} testID={`members-${m.n.toLowerCase()}`}>
                        <Feather name={m.icon as any} size={24} color={members === m.n ? COLORS.navy : '#aaa'} />
                        <Text style={[s.memLabel, members === m.n && s.memLabelActive]}>{m.n}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {members === 'Groupe' && (
                    <View style={s.counterRow}>
                      <TouchableOpacity style={s.counterBtn} onPress={() => setGroupCount(Math.max(4, groupCount - 1))}><Text style={s.counterBtnText}>-</Text></TouchableOpacity>
                      <Text style={s.counterNum}>{groupCount}</Text>
                      <TouchableOpacity style={[s.counterBtn, s.counterBtnPlus]} onPress={() => setGroupCount(Math.min(20, groupCount + 1))}><Text style={[s.counterBtnText, { color: '#fff' }]}>+</Text></TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity style={s.nextStepBtn} onPress={() => setSheetTab(1)} testID="membres-next-btn">
                    <Text style={s.nextStepText}>Etape suivante</Text>
                    <Feather name="arrow-right" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              {/* MOOD TAB */}
              {sheetTab === 1 && (
                <View testID="tab-mood-content">
                  <View style={s.moodIndicator}>
                    <Feather name="smile" size={28} color={COLORS.navy} />
                  </View>
                  <Text style={s.moodName}>{moodName}</Text>
                  <View style={s.moodGrid}>
                    {MOOD_ITEMS.map(m => (
                      <TouchableOpacity key={m.name} style={[s.moodChip, moods.includes(m.name) && s.moodChipActive]} onPress={() => toggleMood(m.name)} testID={`mood-${m.name.toLowerCase()}`}>
                        <Feather name={m.icon as any} size={18} color={moods.includes(m.name) ? COLORS.navy : '#aaa'} />
                        <Text style={[s.moodChipLabel, moods.includes(m.name) && { color: COLORS.navy }]}>{m.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {[{label:"Niveau d'energie", val: energy, set: setEnergy}, {label:'Envie de marcher', val: walkDesire, set: setWalkDesire}, {label:'Ouverture aux rencontres', val: openness, set: setOpenness}].map((sl, i) => (
                    <View key={i} style={s.sliderRow}>
                      <View style={s.sliderHead}>
                        <Text style={s.sliderName}>{sl.label}</Text>
                        <Text style={s.sliderVal}>{sl.val}%</Text>
                      </View>
                      <View style={s.sliderTrack}>
                        <View style={[s.sliderFill, { width: `${sl.val}%` }]} />
                        <View style={[s.sliderThumb, { left: `${sl.val}%` }]} />
                      </View>
                      <TouchableOpacity style={s.sliderTouchArea} onPress={() => {}} />
                    </View>
                  ))}
                  <TouchableOpacity style={s.nextStepBtn} onPress={() => setSheetTab(2)} testID="mood-next-btn">
                    <Text style={s.nextStepText}>Etape suivante</Text>
                    <Feather name="arrow-right" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              {/* PRATIQUE TAB */}
              {sheetTab === 2 && (
                <View testID="tab-pratique-content">
                  <Text style={s.secLabel}>ADRESSE DE DEPART</Text>
                  <TextInput style={s.pratInput} placeholder="Ex: 57 rue Victor Hugo, Paris 16e" placeholderTextColor="#bbb" testID="pratique-address-input" />

                  <Text style={s.secLabel}>RAYON : {radius} KM</Text>
                  <View style={s.sliderTrack}>
                    <View style={[s.sliderFill, { width: `${(radius / 25) * 100}%` }]} />
                    <View style={[s.sliderThumb, { left: `${(radius / 25) * 100}%` }]} />
                  </View>

                  <Text style={[s.secLabel, { marginTop: 20 }]}>QUAND ?</Text>
                  <View style={s.whenRow}>
                    {['Maintenant', 'Ce soir', 'Ce week-end', 'Date precise'].map(w => (
                      <TouchableOpacity key={w} style={[s.whenBtn, when === w && s.whenBtnActive]} onPress={() => setWhen(w)} testID={`when-${w.replace(/\s/g, '-').toLowerCase()}`}>
                        <Text style={[s.whenBtnText, when === w && s.whenBtnTextActive]}>{w}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[s.secLabel, { marginTop: 20 }]}>BUDGET / PERS : {budget}EUR</Text>
                  <View style={s.sliderTrack}>
                    <View style={[s.sliderFill, { width: `${((budget - 5) / 195) * 100}%` }]} />
                    <View style={[s.sliderThumb, { left: `${((budget - 5) / 195) * 100}%` }]} />
                  </View>

                  <TouchableOpacity style={[s.nextStepBtn, s.generateBtn]} onPress={generateParcours} testID="generate-parcours-btn">
                    <Text style={s.generateText}>Generer mon parcours</Text>
                    <Feather name="star" size={16} color={COLORS.navy} />
                  </TouchableOpacity>
                </View>
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.beige },
  map: { flex: 1 },
  searchBar: { position: 'absolute', top: 52, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 50, paddingLeft: 16, height: 50, ...({ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 }) },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#111' },
  profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center', marginRight: 3 },
  searchResults: { position: 'absolute', top: 108, left: 16, right: 16, backgroundColor: '#fff', borderRadius: 16, ...({ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5 }) },
  searchItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  searchItemName: { fontSize: 14, fontWeight: '600', color: '#111' },
  searchItemSub: { fontSize: 12, color: '#888', marginTop: 2 },
  popup: { position: 'absolute', bottom: 120, left: 16, right: 16, backgroundColor: '#fff', borderRadius: 20, padding: 20, ...({ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 8 }) },
  popupHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  popupName: { fontSize: 17, fontWeight: '700', color: '#111' },
  popupLoc: { fontSize: 12, color: '#888', marginTop: 2 },
  popupClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  popupDesc: { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 10 },
  popupTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  popupTag: { backgroundColor: 'rgba(13,27,62,0.07)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  popupTagText: { fontSize: 11, fontWeight: '600', color: COLORS.navy },
  popupXpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  popupXpLabel: { fontSize: 12, color: '#888' },
  popupXpVal: { fontSize: 14, fontWeight: '700', color: COLORS.gold },
  popupActions: { flexDirection: 'row', gap: 10 },
  popupBtnSec: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center' },
  popupBtnSecText: { fontSize: 13, fontWeight: '600', color: '#555' },
  popupBtnPri: { flex: 1, flexDirection: 'row', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center' },
  popupBtnPriText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  navbar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, ...({ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 5 }) },
  navInner: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 10, paddingHorizontal: 30 },
  navBtn: { alignItems: 'center', gap: 2 },
  navLabel: { fontSize: 10, fontWeight: '600', color: '#888' },
  navCenter: { position: 'absolute', top: -24, alignSelf: 'center', width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center', ...({ shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }) },
  xpZone: { position: 'absolute', bottom: 8, left: 18, right: 18 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  xpLevel: { fontSize: 9, color: '#bbb', textTransform: 'uppercase' },
  xpVal: { fontSize: 9, fontWeight: '700', color: COLORS.gold },
  xpTrack: { height: 2.5, backgroundColor: '#f0f0f0', borderRadius: 2 },
  xpFill: { height: '100%', backgroundColor: COLORS.yellow, borderRadius: 2 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: H * 0.92, paddingHorizontal: 20 },
  sheetPill: { width: 36, height: 4, backgroundColor: '#eee', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 14 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: COLORS.navy },
  skipBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f5f5f5', borderRadius: 20 },
  skipBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.navy },
  sheetClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', gap: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10 },
  tab: { paddingVertical: 4 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.navy },
  tabText: { fontSize: 12, fontWeight: '600', color: '#bbb', letterSpacing: 1 },
  tabTextActive: { color: COLORS.navy },
  stepDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14, marginBottom: 16 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd' },
  stepDotActive: { width: 20, backgroundColor: COLORS.yellow },
  stepDotDone: { backgroundColor: COLORS.navy },
  sheetContent: { flex: 1 },
  memGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  memCard: { width: '47%', backgroundColor: '#f8f7f4', borderRadius: 14, padding: 18, alignItems: 'center', gap: 8, borderWidth: 2, borderColor: 'transparent' },
  memCardActive: { backgroundColor: '#fff', borderColor: COLORS.navy, ...({ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }) },
  memLabel: { fontSize: 11, fontWeight: '600', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
  memLabelActive: { color: COLORS.navy },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 16 },
  counterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  counterBtnPlus: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  counterBtnText: { fontSize: 20, fontWeight: '600', color: COLORS.navy },
  counterNum: { fontSize: 28, fontWeight: '800', color: COLORS.navy },
  nextStepBtn: { backgroundColor: COLORS.navy, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 },
  nextStepText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  moodIndicator: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: '#f8f7f4', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  moodName: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: COLORS.navy, marginBottom: 16 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodChip: { width: '30%', backgroundColor: '#f8f7f4', borderRadius: 12, padding: 14, alignItems: 'center', gap: 6, borderWidth: 2, borderColor: 'transparent' },
  moodChipActive: { backgroundColor: '#fff', borderColor: COLORS.navy },
  moodChipLabel: { fontSize: 10, fontWeight: '600', color: '#aaa', textTransform: 'uppercase' },
  sliderRow: { marginTop: 18 },
  sliderHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sliderName: { fontSize: 13, fontWeight: '500', color: '#555' },
  sliderVal: { fontSize: 13, fontWeight: '700', color: COLORS.navy },
  sliderTrack: { height: 3, backgroundColor: '#eee', borderRadius: 2, position: 'relative' },
  sliderFill: { height: '100%', backgroundColor: COLORS.navy, borderRadius: 2 },
  sliderThumb: { position: 'absolute', top: -8.5, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.navy, marginLeft: -10 },
  sliderTouchArea: { position: 'absolute', top: -20, left: 0, right: 0, height: 40 },
  secLabel: { fontSize: 10, fontWeight: '700', color: '#bbb', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  pratInput: { backgroundColor: '#f8f7f4', borderRadius: 14, padding: 16, fontSize: 14, color: '#111', marginBottom: 16 },
  whenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  whenBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f5f5f5' },
  whenBtnActive: { backgroundColor: COLORS.navy },
  whenBtnText: { fontSize: 12, fontWeight: '600', color: '#888' },
  whenBtnTextActive: { color: '#fff' },
  generateBtn: { backgroundColor: COLORS.yellow },
  generateText: { color: COLORS.navy, fontSize: 15, fontWeight: '700' },
});
