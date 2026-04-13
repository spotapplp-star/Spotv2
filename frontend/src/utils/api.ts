import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('access_token');
}

export async function setToken(token: string) {
  await AsyncStorage.setItem('access_token', token);
}

export async function removeToken() {
  await AsyncStorage.removeItem('access_token');
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    const detail = err.detail;
    const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((e: any) => e.msg || JSON.stringify(e)).join(' ') : String(detail);
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  // Auth
  register: (email: string, password: string, name?: string) =>
    apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  getMe: () => apiFetch('/api/auth/me'),

  // Activities
  getActivities: (search?: string) =>
    apiFetch(`/api/activities${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getActivity: (id: string) => apiFetch(`/api/activities/${id}`),

  // Favorites & Likes
  toggleFavorite: (id: string) => apiFetch(`/api/users/me/favorites/${id}`, { method: 'POST' }),
  getFavorites: () => apiFetch('/api/users/me/favorites'),
  toggleLike: (id: string) => apiFetch(`/api/users/me/likes/${id}`, { method: 'POST' }),
  getLikes: () => apiFetch('/api/users/me/likes'),
  updateProfile: (data: any) => apiFetch('/api/users/me/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Reservations
  createReservation: (data: any) => apiFetch('/api/reservations', { method: 'POST', body: JSON.stringify(data) }),
  getReservations: () => apiFetch('/api/reservations/me'),
  cancelReservation: (id: string) => apiFetch(`/api/reservations/${id}`, { method: 'DELETE' }),

  // Reviews
  createReview: (data: any) => apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  getReviews: () => apiFetch('/api/reviews/me'),

  // XP
  getXP: () => apiFetch('/api/xp/me'),

  // Creator
  getCreatorStats: () => apiFetch('/api/creator/stats'),
  getCreatorVideos: () => apiFetch('/api/creator/videos'),
  submitVideo: (data: any) => apiFetch('/api/creator/videos', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAdminStats: () => apiFetch('/api/admin/stats'),
  getAdminActivities: () => apiFetch('/api/admin/activities'),
  createActivity: (data: any) => apiFetch('/api/admin/activities', { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id: string, data: any) => apiFetch(`/api/admin/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminUsers: () => apiFetch('/api/admin/users'),
  updateUser: (id: string, data: any) => apiFetch(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminVideos: () => apiFetch('/api/admin/videos'),
  updateVideo: (id: string, data: any) => apiFetch(`/api/admin/videos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
