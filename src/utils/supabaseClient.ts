import { createClient } from '@supabase/supabase-js';

// Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://afyyozywnupfdcshxjhk.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EMfJHsDHNjTIatH07CuIzA_BopfHXTe';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Table schemas expected:
// pendaftar: id, nama, telepon, rt, lomba, catatan, created_at
// keuangan: id, nama, jenis (iuran/donasi/sponsor/donatur/cash), jumlah, keterangan, is_anon, created_at
// gallery: id, title, url, type (photo/video), created_at
