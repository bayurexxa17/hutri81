import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing!")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tambahkan fungsi-fungsi berikut agar bisa diimpor oleh App.tsx
let currentConfig = { url: supabaseUrl, anonKey: supabaseAnonKey };

export function getSupabaseConfig() {
  return currentConfig;
}

export function setSupabaseConfig(newConfig: { url: string; anonKey: string }) {
  currentConfig = newConfig;
}

export function getSupabaseAdmin() {
  return supabase;
}
