import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const ACTIVITIES_KEY = 'spot_activities';

export async function getStoredActivities(): Promise<any[]> {
  try {
    const data = await AsyncStorage.getItem(ACTIVITIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function setStoredActivities(activities: any[]) {
  await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
}

export async function loadActivities(): Promise<any[]> {
  try {
    const data = await api.getActivities();
    if (data?.length) {
      await setStoredActivities(data);
      return data;
    }
  } catch {}
  return getStoredActivities();
}

export async function addActivityToStore(activity: any): Promise<any> {
  try {
    const result = await api.createActivity(activity);
    const all = await loadActivities();
    return result;
  } catch {
    const all = await getStoredActivities();
    const newAct = { ...activity, id: Date.now().toString(), createdAt: new Date().toISOString() };
    all.push(newAct);
    await setStoredActivities(all);
    return newAct;
  }
}

export async function updateActivityInStore(id: string, updates: any): Promise<void> {
  try {
    await api.updateActivity(id, updates);
  } catch {}
  const all = await getStoredActivities();
  const idx = all.findIndex((a: any) => a.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    await setStoredActivities(all);
  }
}

export async function deleteActivityFromStore(id: string): Promise<void> {
  try {
    await api.updateActivity(id, { status: 'inactive' });
  } catch {}
  const all = await getStoredActivities();
  await setStoredActivities(all.filter((a: any) => a.id !== id));
}

export async function getActivityById(id: string): Promise<any | null> {
  try {
    const act = await api.getActivity(id);
    if (act) return act;
  } catch {}
  const all = await getStoredActivities();
  return all.find((a: any) => a.id === id) || null;
}
