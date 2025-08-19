import { kv } from '../store/mmkv';


const key = (url: string) => `etag:${url}`;
export const getETag = (url: string) => kv.get(key(url));
export const setETag = (url: string, etag?: string | null) => {
  if (!etag) return; kv.set(key(url), etag);
};


const ckey = (url: string) => `cache:${url}`;
export const getCache = (url: string) => {
  const s = kv.get(ckey(url)); return s ? JSON.parse(s) : undefined;
};
export const setCache = (url: string, data: unknown) => kv.set(ckey(url), JSON.stringify(data));