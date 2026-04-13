import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home-choice" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="map" />
        <Stack.Screen name="loading-screen" />
        <Stack.Screen name="feed" />
        <Stack.Screen name="detail" />
        <Stack.Screen name="reservation" />
        <Stack.Screen name="activities" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="xp" />
        <Stack.Screen name="creator" />
        <Stack.Screen name="admin" />
      </Stack>
    </AuthProvider>
  );
}
