import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY = 'campusfind.session';

export async function readSession(): Promise<string | null> {
  if (Platform.OS === 'web') return window.sessionStorage.getItem(KEY);
  return SecureStore.getItemAsync(KEY);
}

export async function writeSession(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.sessionStorage.setItem(KEY, value);
    return;
  }
  await SecureStore.setItemAsync(KEY, value);
}

export async function clearSession(): Promise<void> {
  if (Platform.OS === 'web') {
    window.sessionStorage.removeItem(KEY);
    return;
  }
  await SecureStore.deleteItemAsync(KEY);
}
