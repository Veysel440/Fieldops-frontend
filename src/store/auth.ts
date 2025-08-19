import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { kv } from './mmkv';


type AuthState = {
  token?: string;
  user?: { id: number; name: string; email: string };
  setAuth: (t: string, u: AuthState['user']) => Promise<void>;
  clear: () => Promise<void>;
};


export const useAuth = create<AuthState>((set) => ({
  token: kv.get('token'),
  user: kv.get('user') ? JSON.parse(kv.get('user')!) : undefined,
  setAuth: async (t, u) => {
    kv.set('token', t);
    kv.set('user', JSON.stringify(u));
    await SecureStore.setItemAsync('token', t);
    set({ token: t, user: u });
  },
  clear: async () => {
    kv.del('token'); kv.del('user');
    await SecureStore.deleteItemAsync('token');
    set({ token: undefined, user: undefined });
  },
}));


export const authHeader = () => {
  const t = kv.get('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};