import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';

export default function HomeChoice() {
  const router = useRouter();

  return (
    <View style={s.container} testID="home-choice-screen">
      <View style={s.content}>
        <Text style={s.logo}>Sp<Text style={s.logoY}>o</Text>t</Text>
        <Text style={s.paris}>PARIS</Text>
        <Text style={s.tagline}>Trouve ta prochaine sortie a Paris</Text>

        <View style={s.btns}>
          <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/map?mode=auto')} testID="je-me-lance-btn">
            <Feather name="zap" size={18} color={COLORS.navy} />
            <Text style={s.primaryText}>Je me lance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => router.push('/map?mode=custom')} testID="je-personnalise-btn">
            <Feather name="sliders" size={18} color="#fff" />
            <Text style={s.secondaryText}>Je personnalise</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={s.loginLink} onPress={() => router.push('/auth')} testID="login-link">
        <Text style={s.loginText}>Deja un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy, justifyContent: 'center', alignItems: 'center', padding: 32 },
  content: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  logo: { fontSize: 52, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  logoY: { color: COLORS.yellow },
  paris: { fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, marginTop: 4, marginBottom: 40, textTransform: 'uppercase' },
  tagline: { fontSize: 17, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 48, lineHeight: 24 },
  btns: { flexDirection: 'row', gap: 12, width: '100%' },
  primaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.yellow, paddingVertical: 16, borderRadius: 14 },
  primaryText: { color: COLORS.navy, fontSize: 15, fontWeight: '700' },
  secondaryBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  secondaryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  loginLink: { paddingBottom: 50 },
  loginText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
});
