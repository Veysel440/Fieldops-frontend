import axios, { AxiosHeaders } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { authHeader } from '../store/auth';
import { getETag, setETag, getCache, setCache } from '../utils/etag';

const isAndroid = Platform.OS === 'android';
const baseURL =
  (Constants?.expoConfig?.extra as any)?.[isAndroid ? 'apiUrlAndroid' : 'apiUrliOS'] ||
  'http://10.0.2.2:8000/api/v1';

export const api = axios.create({ baseURL, timeout: 15000 });

function fullUrl(cfg: any) {
  const q = cfg.params ? `?${new URLSearchParams(cfg.params as any).toString()}` : '';
  return `${cfg.baseURL ?? baseURL}${cfg.url ?? ''}${q}`;
}

api.interceptors.request.use((cfg) => {
  const h = cfg.headers instanceof AxiosHeaders ? cfg.headers : new AxiosHeaders(cfg.headers);
  h.set('Accept', 'application/json');

  const auth = authHeader() as Record<string, string | undefined>;
  if (auth.Authorization) h.set('Authorization', auth.Authorization);

  if ((cfg.method ?? 'get').toLowerCase() === 'get') {
    const etag = getETag(fullUrl(cfg));
    if (etag) h.set('If-None-Match', etag);
  }
  cfg.headers = h;
  return cfg;
});

api.interceptors.response.use(
  (res) => {
    const url = fullUrl(res.config);
    const et = res.headers?.etag as string | undefined;
    if (et) setETag(url, et);
    if (res.config.method === 'get' && res.status === 200) setCache(url, res.data);
    return res;
  },
  (err) => {
    const res = err.response;
    const cfg = err.config;
    if (res && res.status === 304 && cfg) {
      const url = fullUrl(cfg);
      const data = getCache(url);
      if (data) return Promise.resolve({ ...res, status: 200, data });
    }
    return Promise.reject(err);
  }
);