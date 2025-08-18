import { MMKV } from 'react-native-mmkv';
export const storage = new MMKV();
export const kv = {
  get: (k: string) => storage.getString(k) ?? undefined,
  set: (k: string, v: string) => storage.set(k, v),
  del: (k: string) => storage.delete(k),
};