import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Dimensions, ScrollView, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';
import { loadActivities } from '../src/utils/storage';

const { width: W, height: H } = Dimensions.get('window');

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<any>(null);

  const [activities, setActivities] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  // Bottom sheet animated state
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetY = useRef(new Animated.Value(H)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Configurator state
  const [sheetTab, setSheetTab] = useState(0);
  const [members, setMembers] = useState('Solo');
  const [groupCount, setGroupCount] = useState(4);
  const [moods, setMoods] = useState(['Immersif', 'Plein air', 'Culturel', 'Festif', 'Sport', 'Gastro']);
  const [energy, setEnergy] = useState(70);
  const [radius, setRadius] = useState(5);
  const [budget, setBudget] = useState(30);
  const [when, setWhen] = useState('Maintenant');

  useEffect(() => {
    loadActivities().then(data => {
      setActivities(data);
      if (params.mode === 'custom') openSheet();
    });
  }, []);

  const openSheet = () => {
    setSheetVisible(true);
    Animated.parallel([
      Animated.timing(sheetY, { toValue: 0, duration: 350, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(sheetY, { toValue: H, duration: 350, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => setSheetVisible(false));
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 1) {
      const filtered = activities.filter(a => a.name.toLowerCase().includes(text.toLowerCase()) || (a.category || '').toLowerCase().includes(text.toLowerCase()));
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
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%}
.pin{width:36px;height:44px;display:flex;flex-direction:column;align-items:center;cursor:pointer}
.pin-circle{width:32px;height:32px;background:#0D1B3E;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)}
.pin-tail{width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #0D1B3E;margin-top:-2px}
.pin-label{position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:#fff;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:600;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.15);color:#0D1B3E}
.leaflet-control-zoom{display:none}
</style></head><body>
<div id="map"></div>
<script>
var map=L.map('map',{zoomControl:false}).setView([48.8534,2.3488],12.5);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19,attribution:''}).addTo(map);
var acts=${JSON.stringify(activities.map(a => ({ id: a.id, name: a.name, lat: a.lat, lng: a.lng, rating: a.rating })))};
acts.forEach(function(a){
  if(!a.lat||!a.lng)return;
  var icon=L.divIcon({className:'',html:'<div class="pin"><div class="pin-label">'+a.name.substring(0,18)+'</div><div class="pin-circle"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="#0D1B3E"/></svg></div><div class="pin-tail"></div></div>',iconSize:[36,44],iconAnchor:[18,44]});
  L.marker([a.lat,a.lng],{icon:icon}).addTo(map).on('click',function(){
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'pinClick',id:a.id,name:a.name}));
  });
});
<\/script></body></html>`;

  const toggleMood = (mood: string) => {
    setMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
  };

  const moodName = energy < 20 ? 'Au repos' : energy < 40 ? 'Tranquille' : energy < 60 ? 'Equilibre' : energy < 80 ? 'Dynamique' : 'Intense';

  const MOOD_ITEMS = [
    { name: 'Immersif', icon: 'eye' }, { name: 'Plein air', icon: 'sun' }, { name: 'Culturel', icon: 'book' },
    { name: 'Festif', icon: 'music' }, { name: 'Sport', icon: 'zap' }, { name: 'Gastro', icon: 'coffee' },
  ];

  const generateParcours = () => {
    closeSheet();
    setTimeout(() => router.push('/loading-screen'), 400);
  };

  const bottomNavHeight = 90 + Math.max(insets.bottom, 16);

  return (
    <View style={s.container} testID="map-screen">
      {/* Map WebView */}
      <WebView ref={webViewRef} source={{ html: mapHtml }} style={s.map} onMessage={handleMapMessage} javaScriptEnabled scrollEnabled={false} />

      {/* CORRECTION 1: Search Bar - SEPARATE, full width */}
      <View style={[s.searchBar, { top: insets.top + 8, left: 14, right: 64 }]}>
        <Feather name="search" size={16} color="#ccc" style={{ marginRight: 8 }} />
        <TextInput style={s.searchInput} placeholder="Recherche une activite a Paris..." placeholderTextColor="#bbb" value={searchText} onChangeText={handleSearch} testID="map-search-input" />
      </View>

      {/* CORRECTION 1: Profile Button - SEPARATE element, independent */}
      <TouchableOpacity style={[s.profileBtn, { top: insets.top + 11 }]} onPress={() => router.push('/profile')} testID="map-profile-btn">
        <Feather name="user" size={17} color="#fff" />
      </TouchableOpacity>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={[s.searchResults, { top: insets.top + 64 }]}>
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
        <View style={[s.popup, { bottom: bottomNavHeight + 8 }]}>
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
            {(selectedActivity.tags || []).slice(0, 3).map((t: string, i: number) => (
              <View key={i} style={s.popupTag}><Text style={s.popupTagText}>{t}</Text></View>
            ))}
          </View>
          <View style={s.popupXpRow}>
            <Text style={s.popupXpLabel}>A gagner</Text>
            <Text style={s.popupXpVal}>+{selectedActivity.xp || 0} XP</Text>
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

      {/* CORRECTION 2: Navbar - moved up with safe area */}
      <View style={[s.navbar, { height: bottomNavHeight, paddingBottom: Math.max(insets.bottom, 16) }]}>
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
        <TouchableOpacity style={s.navCenter} onPress={openSheet} testID="nav-center-btn">
          <Feather name="play" size={18} color="#fff" />
        </TouchableOpacity>
        {/* XP Bar INSIDE navbar, above bottom edge */}
        <View style={s.xpZone}>
          <View style={s.xpRow}>
            <Text style={s.xpLevel}>Niveau {user?.level || 12}</Text>
            <Text style={s.xpVal}>{user?.xp || 450} XP</Text>
          </View>
          <View style={s.xpTrack}><View style={[s.xpFill, { width: '35%' }]} /></View>
        </View>
      </View>

      {/* CORRECTION 3: Bottom Sheet Overlay (NOT Modal) */}
      {sheetVisible && (
        <>
          <Animated.View style={[s.overlay, { opacity: overlayOpacity }]} pointerEvents="auto">
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeSheet} activeOpacity={1} />
          </Animated.View>
          <Animated.View style={[s.sheet, { transform: [{ translateY: sheetY }] }]}>
            <View style={s.sheetPill} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Personnalisation</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity style={s.skipBtn} onPress={generateParcours} testID="sheet-skip-btn">
                  <Text style={s.skipBtnText}>Skip</Text>
                  <Feather name="arrow-right" size={12} color={COLORS.navy} />
                </TouchableOpacity>
                <TouchableOpacity style={s.sheetClose} onPress={closeSheet} testID="sheet-close-btn">
                  <Feather name="x" size={16} color={COLORS.navy} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.tabs}>
              {['MEMBRES', 'MOOD', 'PRATIQUE'].map((tab, i) => (
                <TouchableOpacity key={i} style={[s.tab, sheetTab === i && s.tabActive]} onPress={() => setSheetTab(i)} testID={`sheet-tab-${tab.toLowerCase()}`}>
                  <Text style={[s.tabText, sheetTab === i && s.tabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.stepDots}>
              {[0, 1, 2].map(i => (
                <View key={i} style={[s.stepDot, i === sheetTab && s.stepDotActive, i < sheetTab && s.stepDotDone]} />
              ))}
            </View>

            <ScrollView style={s.sheetContent} showsVerticalScrollIndicator={false}>
              {/* MEMBRES */}
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

              {/* MOOD */}
              {sheetTab === 1 && (
                <View testID="tab-mood-content">
                  <View style={s.moodIndicator}><Feather name="smile" size={28} color={COLORS.navy} /></View>
                  <Text style={s.moodName}>{moodName}</Text>
                  <View style={s.moodGrid}>
                    {MOOD_ITEMS.map(m => (
                      <TouchableOpacity key={m.name} style={[s.moodChip, moods.includes(m.name) && s.moodChipActive]} onPress={() => toggleMood(m.name)} testID={`mood-${m.name.toLowerCase()}`}>
                        <Feather name={m.icon as any} size={18} color={moods.includes(m.name) ? COLORS.navy : '#aaa'} />
                        <Text style={[s.moodChipLabel, moods.includes(m.name) && { color: COLORS.navy }]}>{m.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={s.nextStepBtn} onPress={() => setSheetTab(2)} testID="mood-next-btn">
                    <Text style={s.nextStepText}>Etape suivante</Text>
                    <Feather name="arrow-right" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              {/* PRATIQUE */}
              {sheetTab === 2 && (
                <View testID="tab-pratique-content">
                  <Text style={s.secLabel}>ADRESSE DE DEPART</Text>
                  <TextInput style={s.pratInput} placeholder="Ex: 57 rue Victor Hugo, Paris 16e" placeholderTextColor="#bbb" testID="pratique-address-input" />
                  <Text style={s.secLabel}>RAYON : {radius} KM</Text>
                  <View style={s.sliderTrack}><View style={[s.sliderFill, { width: `${(radius / 25) * 100}%` }]} /></View>
                  <Text style={[s.secLabel, { marginTop: 20 }]}>QUAND ?</Text>
                  <View style={s.whenRow}>
                    {['Maintenant', 'Ce soir', 'Ce week-end', 'Date precise'].map(w => (
                      <TouchableOpacity key={w} style={[s.whenBtn, when === w && s.whenBtnActive]} onPress={() => setWhen(w)} testID={`when-${w.replace(/\s/g, '-').toLowerCase()}`}>
                        <Text style={[s.whenBtnText, when === w && s.whenBtnTextActive]}>{w}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={[s.secLabel, { marginTop: 20 }]}>BUDGET / PERS : {budget}EUR</Text>
                  <View style={s.sliderTrack}><View style={[s.sliderFill, { width: `${((budget - 5) / 195) * 100}%` }]} /></View>
                  <TouchableOpacity style={[s.nextStepBtn, s.generateBtn]} onPress={generateParcours} testID="generate-parcours-btn">
                    <Text style={s.generateText}>Generer mon parcours</Text>
                    <Feather name="star" size={16} color={COLORS.navy} />
                  </TouchableOpacity>
                </View>
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.beige },
  map: { flex: 1 },
  // CORRECTION 1: Search bar separate, full width
  searchBar: { position: 'absolute', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 50, paddingHorizontal: 16, height: 50, zIndex: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  searchInput: { flex: 1, fontSize: 14, color: '#111' },
  // CORRECTION 1: Profile button separate, absolute right
  profileBtn: { position: 'absolute', right: 14, width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center', zIndex: 20, shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  searchResults: { position: 'absolute', left: 14, right: 14, backgroundColor: '#fff', borderRadius: 16, zIndex: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5 },
  searchItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  searchItemName: { fontSize: 14, fontWeight: '600', color: '#111' },
  searchItemSub: { fontSize: 12, color: '#888', marginTop: 2 },
  popup: { position: 'absolute', left: 16, right: 16, backgroundColor: '#fff', borderRadius: 20, padding: 20, zIndex: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 8 },
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
  // CORRECTION 2: Navbar moved up, safe area
  navbar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 5, zIndex: 10 },
  navInner: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, paddingHorizontal: 30 },
  navBtn: { alignItems: 'center', gap: 2 },
  navLabel: { fontSize: 10, fontWeight: '600', color: '#888' },
  navCenter: { position: 'absolute', top: -24, alignSelf: 'center', width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  xpZone: { paddingHorizontal: 18, marginTop: 8 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  xpLevel: { fontSize: 9, color: '#bbb', textTransform: 'uppercase' },
  xpVal: { fontSize: 9, fontWeight: '700', color: COLORS.gold },
  xpTrack: { height: 2.5, backgroundColor: '#f0f0f0', borderRadius: 2 },
  xpFill: { height: '100%', backgroundColor: COLORS.yellow, borderRadius: 2 },
  // CORRECTION 3: Overlay + Animated Sheet (NOT Modal)
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 50 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: H * 0.92, paddingHorizontal: 20, zIndex: 51, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
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
  sheetContent: { maxHeight: H * 0.6 },
  memGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  memCard: { width: '47%', backgroundColor: '#f8f7f4', borderRadius: 14, padding: 18, alignItems: 'center', gap: 8, borderWidth: 2, borderColor: 'transparent' },
  memCardActive: { backgroundColor: '#fff', borderColor: COLORS.navy, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
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
  secLabel: { fontSize: 10, fontWeight: '700', color: '#bbb', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  pratInput: { backgroundColor: '#f8f7f4', borderRadius: 14, padding: 16, fontSize: 14, color: '#111', marginBottom: 16 },
  sliderTrack: { height: 3, backgroundColor: '#eee', borderRadius: 2, marginBottom: 8 },
  sliderFill: { height: '100%', backgroundColor: COLORS.navy, borderRadius: 2 },
  whenRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  whenBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f5f5f5' },
  whenBtnActive: { backgroundColor: COLORS.navy },
  whenBtnText: { fontSize: 12, fontWeight: '600', color: '#888' },
  whenBtnTextActive: { color: '#fff' },
  generateBtn: { backgroundColor: COLORS.yellow },
  generateText: { color: COLORS.navy, fontSize: 15, fontWeight: '700' },
});
