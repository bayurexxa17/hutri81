import { createClient } from '@supabase/supabase-js';

function getUrl() {
  try {
    const ls = localStorage.getItem('supabaseUrl');
    if (ls) return ls;
  } catch {}
  return (import.meta as any).env?.VITE_SUPABASE_URL || 'https://afyyozywnupfdcshxjhk.supabase.co';
}
function getAnonKey() {
  try {
    const ls = localStorage.getItem('supabaseAnonKey');
    if (ls) return ls;
  } catch {}
  return (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EMfJHsDHNjTIatH07CuIzA_BopfHXTe';
}
function getSecretKey() {
  try {
    const ls = localStorage.getItem('supabaseSecretKey');
    if (ls) return ls;
  } catch {}
  return '';
}

export const supabase = createClient(getUrl(), getAnonKey());

export const getSupabaseAdmin = () => {
  // fallback ke anon jika secret kosong, agar insert tetap jalan di table UNRESTRICTED / policy public
  return createClient(getUrl(), getSecretKey() || getAnonKey());
};

export const setSupabaseConfig = (url: string, anonKey?: string, secretKey?: string) => {
  if (url) localStorage.setItem('supabaseUrl', url);
  if (anonKey) localStorage.setItem('supabaseAnonKey', anonKey);
  if (secretKey) localStorage.setItem('supabaseSecretKey', secretKey);
};

export const getSupabaseConfig = () => ({
  url: getUrl(),
  anonKey: getAnonKey(),
  secretKey: getSecretKey(),
});
