import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';

export default function Auth() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) { setError('Email et mot de passe requis'); return; }
    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password, name || undefined);
      router.replace('/map');
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} testID="auth-screen">
      <TouchableOpacity style={s.backBtn} onPress={() => router.back()} testID="auth-back-btn">
        <Feather name="chevron-left" size={22} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <View style={s.content}>
        <Text style={s.logo}>Sp<Text style={s.logoY}>o</Text>t</Text>
        <Text style={s.title}>{isLogin ? 'Connexion' : 'Inscription'}</Text>

        {!isLogin && (
          <TextInput style={s.input} placeholder="Prenom" placeholderTextColor="#666" value={name} onChangeText={setName} testID="auth-name-input" />
        )}
        <TextInput style={s.input} placeholder="Email" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" testID="auth-email-input" />
        <TextInput style={s.input} placeholder="Mot de passe" placeholderTextColor="#666" value={password} onChangeText={setPassword} secureTextEntry testID="auth-password-input" />

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading} testID="auth-submit-btn">
          {loading ? <ActivityIndicator color={COLORS.navy} /> : (
            <Text style={s.submitText}>{isLogin ? 'Se connecter' : "S'inscrire"}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); }} testID="auth-toggle-btn">
          <Text style={s.toggleText}>{isLogin ? "Pas de compte ? S'inscrire" : 'Deja un compte ? Se connecter'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy, padding: 32 },
  backBtn: { marginTop: 52, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, justifyContent: 'center' },
  logo: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: -2, textAlign: 'center', marginBottom: 8 },
  logoY: { color: COLORS.yellow },
  title: { fontSize: 20, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, fontSize: 15, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  error: { color: '#FF4455', fontSize: 13, textAlign: 'center', marginBottom: 12 },
  submitBtn: { backgroundColor: COLORS.yellow, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  submitText: { color: COLORS.navy, fontSize: 16, fontWeight: '700' },
  toggleText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginTop: 20 },
});
