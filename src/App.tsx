import { useState, useEffect, useCallback, useRef } from 'react';
import HeroSection from './components/HeroSection';
import LombaSection from './components/LombaSection';
import AdminPage from './components/AdminPage';
import GalleryPage from './components/GalleryPage';
import {
  lombaList,
  panitiaList,
  budgetRows,
  budgetDetails,
  formatRupiah,
  rundownPagi,
  rundownMalam,
  type InventoryItem,
  type TalentaItem,
  type SponsorItem,
  initialInventoryList,
  initialTalentaList,
  initialSponsorList,
} from './data/siteData';
import { supabase } from './utils/supabaseClient';
import qrisImage from './assets/qris-aulia.png';

// ================== SHARED TYPES ==================
export interface Participant {
  id: string;
  name: string;
  rt: string;
  hp: string;
  lomba: string[];
  catatan: string;
  waktu: string;
  dbId?: number;
}
export interface KeuanganEntry {
  id?: number;
  nama: string;
  jenis: string; // 'iuran' | 'donasi' | 'cash' | 'sponsor' | 'donatur' | 'pengeluaran'
  jumlah: number;
  keterangan: string;
  created_at?: string;
}
export interface DonorEntry {
  id: string;
  name: string;
  alamat: string;
  jumlah: number;
  pesan: string;
  waktu: string;
  isAnon: boolean;
  jenis: string;
}
export interface GalleryComment {
  id: string;
  itemId: number;
  nama: string;
  comment: string;
  waktu: string;
}
export interface UserPhoto {
  id: string;
  url: string;
  title: string;
  uploader: string;
  waktu: string;
}

// 13 EXACT DEFAULT PARTICIPANTS FROM THE USER'S PROMPT
const defaultParticipants: Participant[] = [
  {
    id: 'MWR81-0013',
    name: 'Rizki',
    rt: 'RT 02/blok mawar 102',
    hp: '0898****470',
    lomba: ['Lomba Joget Kursi Bapak'],
    catatan: 'Terdaftar',
    waktu: '29/7/2026, 13.13.08',
  },
  {
    id: 'MWR81-0012',
    name: 'Indah',
    rt: 'RT/ mawar 102',
    hp: '0821****882',
    lomba: ['Lomba Joget Kursi Ibu', 'Lomba Estafet Tepung', 'Lomba Hias Tumpeng'],
    catatan: 'Terdaftar',
    waktu: '29/7/2026, 13.12.00',
  },
  {
    id: 'MWR81-0011',
    name: 'Mam lala',
    rt: 'Mawar 83',
    hp: '0878****155',
    lomba: ['Lomba Joget Kursi Ibu'],
    catatan: 'Terdaftar',
    waktu: '29/7/2026, 12.56.08',
  },
  {
    id: 'MWR81-0010',
    name: 'nouren',
    rt: 'Mawar 127',
    hp: '0813****648',
    lomba: ['Lomba Makan Kerupuk', 'Lomba Estafet Penguin Anak', 'Lomba Balap Kelereng'],
    catatan: 'Terdaftar',
    waktu: '29/7/2026, 12.24.58',
  },
  {
    id: 'MWR81-0009',
    name: 'Dewi, indah, Evi',
    rt: 'RT002/Mawar83',
    hp: '0878-7441-9155',
    lomba: ['Lomba Estafet Tepung'],
    catatan: 'Terdaftar',
    waktu: '29/7/2026, 09.50.29',
  },
  {
    id: 'MWR81-0008',
    name: 'Evi,Dewi,indah,Andi Fitri,Cece',
    rt: '002/ Mawar 83',
    hp: '0878-7441-9155',
    lomba: ['Lomba Hias Tumpeng'],
    catatan: 'Terdaftar',
    waktu: '29/7/2026, 09.47.32',
  },
  {
    id: 'MWR81-0007',
    name: 'lifi',
    rt: 'Mawar 127',
    hp: '0823****207',
    lomba: ['Lomba Balap Kelereng', 'Lomba Estafet Penguin Anak'],
    catatan: 'Terdaftar',
    waktu: '28/7/2026, 21.39.49',
  },
  {
    id: 'MWR81-0006',
    name: 'alif',
    rt: 'Mawar 127',
    hp: '0823****207',
    lomba: ['Salah Sambung', 'Lomba Balap Kelereng'],
    catatan: 'Terdaftar',
    waktu: '28/7/2026, 21.34.56',
  },
  {
    id: 'MWR81-0005',
    name: 'lifi',
    rt: 'Mawar 127',
    hp: '0823****207',
    lomba: ['Lomba Balap Kelereng', 'Lomba Estafet Penguin Anak'],
    catatan: 'Terdaftar',
    waktu: '28/7/2026, 21.33.00',
  },
  {
    id: 'MWR81-0004',
    name: 'Lala',
    rt: 'Mawar 83',
    hp: '0878****155',
    lomba: ['Lomba Balap Kelereng', 'Salah Sambung', 'Lomba Estafet Penguin Remaja'],
    catatan: 'Terdaftar',
    waktu: '28/7/2026, 20.57.57',
  },
  {
    id: 'MWR81-0003',
    name: 'Abiyu Rexxa',
    rt: 'RT 002/58 Blok Mawar',
    hp: '0812****550',
    lomba: ['Lomba Makan Kerupuk'],
    catatan: 'Terdaftar',
    waktu: '28/7/2026, 16.26.05',
  },
  {
    id: 'MWR81-0002',
    name: 'Ameera Hanania R',
    rt: 'RT 002 / Blok Mawar',
    hp: '0812****891',
    lomba: ['Fashion Week Daster', 'Estafet Penguin Anak'],
    catatan: 'Terdaftar',
    waktu: '29/7/2026, 20.04.03',
  },
  {
    id: 'MWR81-0001',
    name: 'Fatimah Az Zahra',
    rt: 'RT 002 / Blok Mawar',
    hp: '0812****890',
    lomba: ['Makan Kerupuk', 'Balap Kelereng'],
    catatan: 'Terdaftar',
    waktu: '29/7/2026, 20.04.03',
  },
];

export interface SharedData {
  participants: Participant[];
  keuanganList: KeuanganEntry[];
  inventoryList: InventoryItem[];
  talentaList: TalentaItem[];
  sponsorList: SponsorItem[];
  totalDana: number;
  isLive: boolean;
  lastRefresh: Date;
  newRowIds: Set<string>;
  setIsLive: (v: boolean) => void;
  fetchParticipants: () => Promise<void>;
  fetchKeuangan: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  fetchTalenta: () => Promise<void>;
  setNewRowIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  setKeuanganList: React.Dispatch<React.SetStateAction<KeuanganEntry[]>>;
  setInventoryList: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setTalentaList: React.Dispatch<React.SetStateAction<TalentaItem[]>>;
  setTotalDana: React.Dispatch<React.SetStateAction<number>>;
  setLastRefresh: React.Dispatch<React.SetStateAction<Date>>;
}

// Kategorikan satu entri keuangan ke kolom tampilan
export function categorizeKeuangan(k: KeuanganEntry): 'cash' | 'donatur' | 'sponsor' | 'donasi' | 'pengeluaran' | 'transfer' {
  const j = (k.jenis || '').toLowerCase();
  const ket = (k.keterangan || '').toLowerCase();
  if (j.includes('pengeluaran') || (k.jumlah || 0) < 0) return 'pengeluaran';
  if (ket.includes('transfer')) return 'transfer';
  if (j.includes('sponsor')) return 'sponsor';
  if (j.includes('donatur')) return 'donatur';
  if (j.includes('iuran') || j.includes('cash')) return 'cash';
  return 'donasi';
}

// ================== ROOT APP — SHARED STATE ==================
export default function App() {
  const [page, setPage] = useState<'main' | 'admin' | 'gallery' | 'inventory'>('main');

  // ===== SHARED STATE (single source of truth) =====
  const [participants, setParticipants] = useState<Participant[]>(defaultParticipants);
  const [keuanganList, setKeuanganList] = useState<KeuanganEntry[]>([]);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(initialInventoryList);
  const [talentaList, setTalentaList] = useState<TalentaItem[]>(initialTalentaList);
  const [sponsorList, setSponsorList] = useState<SponsorItem[]>(initialSponsorList);
  const [totalDana, setTotalDana] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [newRowIds, setNewRowIds] = useState<Set<string>>(new Set());

  // ===== FETCH PESERTA — langsung dari Supabase =====
  const fetchParticipants = useCallback(async () => {
    try {
      const c = new AbortController(); setTimeout(() => c.abort(), 4000);
      const { data } = await supabase.from('pendaftar').select('*').order('id', { ascending: true }).abortSignal(c.signal);
      if (data && data.length > 0) {
        const map = new Map<string, Participant>();
        [...data].sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()).forEach((item: any) => {
          const n = (item.nama || item.name || '').trim(); if (!n) return;
          const ph = (item.telepon || item.hp || '').replace(/\D/g, '');
          const rt = item.rt || item.address || ''; if (!rt || rt === '-') return;
          if (ph.includes('81991176369')) return;
          const idx = map.size + 1;
          map.set(`${item.id}`, { id: `MWR81-${String(idx).padStart(4, '0')}`, name: n, rt, hp: item.telepon || item.hp || '-', dbId: item.id, lomba: typeof item.lomba === 'string' ? item.lomba.split(',').map((x: string) => x.trim()).filter(Boolean) : (item.lomba || []), catatan: item.catatan || '', waktu: item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : new Date().toLocaleString('id-ID') });
        });
        setParticipants(Array.from(map.values()).reverse());
      }
    } catch { /* Supabase offline → biarkan data lokal */ }
    setLastRefresh(new Date());
  }, []);

  // ===== FETCH KEUANGAN — GABUNGKAN SEMUA TABEL SUPABASE =====
  // Membaca: keuangan, sponsor, iuran warga, donasi, donasi cash, donasi online
  const fetchKeuangan = useCallback(async () => {
    const all: KeuanganEntry[] = [];
    const push = (rows: any[], defaultJenis: string, idOffset: number) => {
      (rows || []).forEach((r: any, i: number) => {
        const nama = r.nama || r.name || r.sumber || '';
        if (!nama) return;
        all.push({
          id: idOffset + (Number(r.id) || i),
          nama,
          jenis: String(r.jenis || defaultJenis || 'donasi').toLowerCase(),
          jumlah: Number(r.jumlah) || 0,
          keterangan: r.keterangan || r.deskripsi || r.catatan || '',
          created_at: r.created_at,
        });
      });
    };
    const sources: [string, string, number][] = [
      ['keuangan', 'donasi', 0],
      ['sponsor', 'sponsor', 1000000],
      ['iuran warga', 'iuran', 2000000],
      ['donasi', 'donasi', 3000000],
      ['donasi cash', 'cash', 4000000],
      ['donasi online', 'donasi', 5000000],
    ];
    await Promise.all(sources.map(async ([tbl, dj, off]) => {
      try {
        const c = new AbortController(); setTimeout(() => c.abort(), 4000);
        const { data } = await supabase.from(tbl).select('*').abortSignal(c.signal);
        if (data) push(data, dj, off);
      } catch { /* tabel tidak ada / offline — lewati */ }
    }));
    // Dedupe entri identik
    const unique = all.filter((v, i, a) => a.findIndex(t => t.nama === v.nama && t.jumlah === v.jumlah && t.jenis === v.jenis && (t.keterangan || '') === (v.keterangan || '')) === i);
    unique.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    setKeuanganList(unique);
    setLastRefresh(new Date());
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      const c = new AbortController(); setTimeout(() => c.abort(), 4000);
      const { data } = await supabase.from('inventory').select('*').order('id', { ascending: true }).abortSignal(c.signal);
      if (data && data.length > 0) setInventoryList(data);
    } catch { /* offline */ }
  }, []);

  const fetchTalenta = useCallback(async () => {
    try {
      const c = new AbortController(); setTimeout(() => c.abort(), 4000);
      const { data } = await supabase.from('talenta').select('*').order('no', { ascending: true }).abortSignal(c.signal);
      if (data && data.length > 0) setTalentaList(data);
    } catch { /* offline → pakai default */ }
  }, []);

  // Fetch ONCE on mount
  useEffect(() => { fetchParticipants(); fetchKeuangan(); fetchInventory(); fetchTalenta(); }, []);

  // Recalculate totalDana = pemasukan - pengeluaran
  useEffect(() => {
    const masuk = keuanganList.filter(k => categorizeKeuangan(k) !== 'pengeluaran').reduce((s, k) => s + (k.jumlah || 0), 0);
    const keluar = keuanganList.filter(k => categorizeKeuangan(k) === 'pengeluaran').reduce((s, k) => s + Math.abs(k.jumlah || 0), 0);
    setTotalDana(masuk - keluar);
  }, [keuanganList]);

  // Realtime: langganan SEMUA tabel keuangan + pendaftar + talenta
  useEffect(() => {
    if (!isLive) return;
    const channels = ['keuangan', 'sponsor', 'iuran warga', 'donasi', 'donasi cash', 'donasi online'].map(tbl =>
      supabase.channel(`rt-${tbl.replace(/\s/g, '-')}`).on('postgres_changes', { event: '*', schema: 'public', table: tbl }, () => { fetchKeuangan(); }).subscribe()
    );
    const chP = supabase.channel('rt-pendaftar').on('postgres_changes', { event: '*', schema: 'public', table: 'pendaftar' }, (payload) => {
      fetchParticipants().then(() => {
        if (payload.eventType === 'INSERT' && (payload.new as any)?.nama) {
          const n = (payload.new as any).nama;
          setNewRowIds(p => { const s = new Set(p); s.add(n); return s; });
          setTimeout(() => setNewRowIds(p => { const s = new Set(p); s.delete(n); return s; }), 5000);
        }
      });
    }).subscribe();
    const chT = supabase.channel('rt-talenta').on('postgres_changes', { event: '*', schema: 'public', table: 'talenta' }, () => { fetchTalenta(); }).subscribe();
    const iv = setInterval(() => { fetchKeuangan(); fetchParticipants(); }, 30000);
    return () => { channels.forEach(ch => supabase.removeChannel(ch)); supabase.removeChannel(chP); supabase.removeChannel(chT); clearInterval(iv); };
  }, [isLive, fetchKeuangan, fetchParticipants, fetchTalenta]);

  // Hash routing
  useEffect(() => {
    const check = () => {
      const h = window.location.hash;
      if (h === '#admin' || h === '#/admin') setPage('admin');
      else if (h === '#gallery' || h === '#/gallery') setPage('gallery');
      else if (h === '#inventory' || h === '#/inventory') setPage('inventory');
      else setPage('main');
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  const goMain = () => { setPage('main'); window.location.hash = ''; };

  // ===== SHARED PROPS =====
  const sharedData: SharedData = {
    participants, keuanganList, inventoryList, talentaList, sponsorList, totalDana, isLive, lastRefresh, newRowIds, setIsLive,
    fetchParticipants, fetchKeuangan, fetchInventory, fetchTalenta, setNewRowIds, setParticipants, setKeuanganList, setInventoryList, setTalentaList, setTotalDana, setLastRefresh
  };
  void setSponsorList;

  if (page === 'admin') return <AdminPage key="admin-page" onBack={goMain} shared={sharedData} />;
  if (page === 'gallery') return <GalleryPage key="gallery-page" onBack={goMain} />;
  if (page === 'inventory') return <InventoryViewPage key="inventory-page" onBack={goMain} shared={sharedData} />;
  return (
    <MainPage
      key="main-page"
      shared={sharedData}
      onAdminClick={() => { setPage('admin'); window.location.hash = '#admin'; }}
      onGalleryClick={() => { setPage('gallery'); window.location.hash = '#gallery'; }}
      onInventoryClick={() => { setPage('inventory'); window.location.hash = '#inventory'; }}
    />
  );
}

// ================== INVENTORY VIEW PAGE ==================
function InventoryViewPage({ onBack, shared }: { onBack: () => void; shared: SharedData }) {
  const { inventoryList } = shared;
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <nav className="bg-[#B71C22]/95 backdrop-blur-md shadow-lg px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white/80 hover:text-white text-sm font-semibold transition flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            Kembali
          </button>
          <div className="h-4 w-px bg-white/20" />
          <span className="font-bold text-white text-sm">📦 Inventory Peralatan & Aksesoris</span>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900">📦 INVENTORY PANITIA</h1>
          <p className="text-gray-500 mt-2">Daftar perlengkapan & aksesoris resmi HUT RI ke-81 Blok Mawar</p>
          <p className="text-xs text-gray-400 mt-1">Dapat ditambahkan dan diedit secara realtime melalui Panel Panitia</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-3 text-left font-bold text-xs w-20">ID</th>
                <th className="px-4 py-3 text-left font-bold text-xs">Nama Barang</th>
                <th className="px-4 py-3 text-center font-bold text-xs w-28">Jumlah</th>
                <th className="px-4 py-3 text-left font-bold text-xs">Kategori</th>
                <th className="px-4 py-3 text-left font-bold text-xs">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventoryList.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3.5 font-mono text-xs text-[#C1272D] font-bold">{item.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800">{item.nama}</td>
                  <td className="px-4 py-3.5 text-center"><span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">{item.jumlah} {item.satuan}</span></td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{item.kategori}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{item.keterangan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================== MAIN PAGE ==================
function MainPage({ shared, onAdminClick, onGalleryClick, onInventoryClick }: { shared: SharedData; onAdminClick: () => void; onGalleryClick: () => void; onInventoryClick: () => void }) {
  const { participants, totalDana, isLive, lastRefresh, newRowIds, setIsLive, fetchParticipants, fetchKeuangan } = shared;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLomba, setFilterLomba] = useState('');
  const [showBudgetDetail, setShowBudgetDetail] = useState<string | null>(null);
  const [waOpen, setWaOpen] = useState(false);
  const [donasiForm, setDonasiForm] = useState({ name: '', alamat: '', jumlah: '', pesan: '', isAnon: false, metode: 'qris_dana' as string });
  const [showBuktiDonasi, setShowBuktiDonasi] = useState<DonorEntry | null>(null);
  const [formData, setFormData] = useState({ name: '', rt: '', hp: '', lomba: [] as string[], catatan: '' });
  const [showBuktiDaftar, setShowBuktiDaftar] = useState<Participant | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // ===== Kategori transaksi keuangan (sinkron Supabase) =====
  const cashList = shared.keuanganList.filter(k => categorizeKeuangan(k) === 'cash');
  const donaturList = shared.keuanganList.filter(k => categorizeKeuangan(k) === 'donatur');
  const sponsorTxList = shared.keuanganList.filter(k => categorizeKeuangan(k) === 'sponsor');
  const donasiList = shared.keuanganList.filter(k => categorizeKeuangan(k) === 'donasi');
  const pengeluaranList = shared.keuanganList.filter(k => categorizeKeuangan(k) === 'pengeluaran');
  const transferList = shared.keuanganList.filter(k => categorizeKeuangan(k) === 'transfer');

  const totalCash = cashList.reduce((s, k) => s + (k.jumlah || 0), 0);
  const totalDonasi = donasiList.reduce((s, k) => s + (k.jumlah || 0), 0);
  const totalPengeluaran = pengeluaranList.reduce((s, k) => s + Math.abs(k.jumlah || 0), 0);
  const totalPemasukan = shared.keuanganList.filter(k => categorizeKeuangan(k) !== 'pengeluaran').reduce((s, k) => s + (k.jumlah || 0), 0);

  // Slideshow sponsor mitra (gabungan: tabel sponsor Supabase + data lokal)
  const sponsorSlides = [...shared.sponsorList, ...sponsorTxList.filter(k => !shared.sponsorList.some(s => s.nama.toLowerCase() === k.nama.toLowerCase())).map(k => ({ id: `tx-${k.id}`, nama: k.nama, deskripsi: k.keterangan || 'Sponsor mitra acara', icon: '🏪', warna: 'text-purple-600' }))];
  const [sponsorIdx, setSponsorIdx] = useState(0);
  useEffect(() => {
    if (sponsorSlides.length <= 1) return;
    const iv = setInterval(() => setSponsorIdx(i => (i + 1) % sponsorSlides.length), 4000);
    return () => clearInterval(iv);
  }, [sponsorSlides.length]);

  const downloadPengeluaranCSV = () => {
    let csv = 'No,Nama,Rincian,Jumlah (Rp),Waktu\n';
    pengeluaranList.forEach((k, i) => { csv += `${i + 1},"${k.nama}","${k.keterangan || ''}",${Math.abs(k.jumlah || 0)},"${k.created_at ? new Date(k.created_at).toLocaleString('id-ID') : ''}"\n`; });
    csv += `\nTOTAL PENGELUARAN,,"",${totalPengeluaran}\n`;
    const b = new Blob([csv], { type: 'text/csv' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'rincian-pengeluaran-hutri81.csv'; a.click(); URL.revokeObjectURL(u);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.hp.trim() || !formData.rt.trim()) { alert('Nama, WhatsApp, dan Alamat wajib diisi!'); return; }
    if (formData.lomba.length === 0) { alert('Pilih minimal 1 lomba!'); return; }

    const newP: Participant = {
      id: `MWR81-${String(participants.length + 1).padStart(4, '0')}`,
      name: formData.name.trim(), rt: formData.rt.trim(), hp: formData.hp.trim(),
      lomba: [...formData.lomba], catatan: formData.catatan.trim() || 'Terdaftar via Web',
      waktu: new Date().toLocaleString('id-ID'),
    };
    shared.setParticipants(prev => [newP, ...prev]);
    shared.setNewRowIds(prev => { const s = new Set(prev); s.add(newP.name); return s; });
    setTimeout(() => shared.setNewRowIds(prev => { const s = new Set(prev); s.delete(newP.name); return s; }), 5000);
    setShowBuktiDaftar(newP);
    setShowRegisterModal(false);
    setFormData({ name: '', rt: '', hp: '', lomba: [], catatan: '' });

    // BACKGROUND
    const payload = { nama: newP.name, telepon: newP.hp, rt: newP.rt, lomba: newP.lomba.join(', '), catatan: newP.catatan };
    Promise.resolve(supabase.from('pendaftar').insert([payload])).then(({ error }) => {
      if (!error) fetchParticipants();
    }).catch(() => {});
  };

  const handleDonasi = (e: React.FormEvent) => {
    e.preventDefault();
    const donorName = donasiForm.isAnon ? 'Hamba Allah' : donasiForm.name;
    const jumlah = Number(donasiForm.jumlah);
    const metodeLabel = donasiForm.metode === 'qris_dana' ? 'QRIS DANA' : donasiForm.metode === 'transfer_seabank' ? 'Transfer SeaBank' : donasiForm.metode === 'cash' ? 'Cash/Tunai' : donasiForm.metode;
    const newK: KeuanganEntry = { nama: donorName, jenis: donasiForm.metode === 'cash' ? 'cash' : 'donasi', jumlah, keterangan: `[${metodeLabel}] ${donasiForm.alamat}`, created_at: new Date().toISOString() };
    const updated = [newK, ...shared.keuanganList];
    shared.setKeuanganList(updated);
    shared.setTotalDana(updated.reduce((s, k) => s + (k.jumlah || 0), 0));
    try { localStorage.setItem('hutri81-keuangan', JSON.stringify(updated)); } catch {}

    setShowBuktiDonasi({ id: `DON-${Date.now()}`, name: donorName, alamat: donasiForm.alamat, jumlah, pesan: donasiForm.pesan, waktu: new Date().toLocaleString('id-ID'), isAnon: donasiForm.isAnon, jenis: 'donasi' });
    setDonasiForm({ name: '', alamat: '', jumlah: '', pesan: '', isAnon: false, metode: 'qris_dana' });

    // BACKGROUND
    Promise.resolve(supabase.from('keuangan').insert([{ nama: donorName, jenis: donasiForm.metode === 'cash' ? 'cash' : 'donasi', jumlah, keterangan: `[${metodeLabel}] ${donasiForm.alamat}` }]))
      .then((res: any) => { if (!res?.error) fetchKeuangan(); })
      .catch(() => {});
  };

  const uniqueLomba = Array.from(new Set(participants.flatMap(p => p.lomba))).sort();
  const filteredP = participants.filter(p => {
    const matchSearch = searchQuery === '' || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase()) || p.rt.toLowerCase().includes(searchQuery.toLowerCase()) || p.hp.includes(searchQuery);
    const matchLomba = filterLomba === '' || p.lomba.some(l => l === filterLomba);
    return matchSearch && matchLomba;
  });
  const allLombaNames = lombaList.map(l => l.nama);
  void formRef;
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); };
  const rundownText = () => { let t = '=== RUNDOWN ACARA HUT RI KE-81 ===\nPerumahan Ciptaland Blok Mawar RT 002/RW 014\nMinggu, 17 Agustus 2026\n\n--- PAGI & SIANG ---\n'; rundownPagi.forEach(r => { t += `${r.waktu} - ${r.kegiatan}${r.keterangan ? ` (${r.keterangan})` : ''}\n`; }); t += '\n--- MALAM PUNCAK ---\n'; rundownMalam.forEach(r => { t += `${r.waktu} - ${r.kegiatan}${r.keterangan ? ` (${r.keterangan})` : ''}\n`; }); return t; };
  
  const navLinks = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'tentang', label: 'Ringkasan' },
    { id: 'lomba', label: 'Lomba' },
    { id: 'rundown', label: 'Jadwal' },
    { id: 'panitia', label: 'Panitia' },
    { id: 'inventory-link', label: 'Inventory', action: onInventoryClick },
    { id: 'gallery-link', label: 'Galeri', action: onGalleryClick },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F5F5F0] overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#B71C22]/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center font-black text-[#C1272D] text-sm shadow">81</div><div className="hidden sm:block"><div className="text-white font-bold text-sm leading-tight">HUT RI Ke-81</div><div className="text-white/60 text-[10px]">Ciptaland Blok Mawar</div></div></div>
          <div className="hidden md:flex items-center gap-1">{navLinks.map(l => (<button key={l.id} onClick={() => l.action ? l.action() : scrollTo(l.id)} className="text-white/80 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/10 transition">{l.label}</button>))}</div>
          <div className="flex items-center gap-2"><button onClick={() => setShowRegisterModal(true)} className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full transition hidden sm:block">Daftar Sekarang</button><button className="md:hidden text-white text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button></div>
        </div>
        {mobileMenuOpen && (<div className="md:hidden bg-[#8B1A1A] border-t border-white/10 px-4 py-3 space-y-1">{navLinks.map(l => (<button key={l.id} onClick={() => { if (l.action) l.action(); else scrollTo(l.id); setMobileMenuOpen(false); }} className="block w-full text-left text-white/80 hover:text-white text-sm font-semibold py-2 px-3 rounded-lg hover:bg-white/10 transition">{l.label}</button>))}<button onClick={() => { setShowRegisterModal(true); setMobileMenuOpen(false); }} className="block w-full bg-green-500 text-white text-sm font-bold py-2.5 rounded-lg mt-2">Daftar Sekarang</button></div>)}
      </nav>

      <HeroSection pesertaCount={participants.length} lombaCount={lombaList.length} totalDana={totalDana} onDaftarClick={() => setShowRegisterModal(true)} onLihatPesertaClick={() => scrollTo('peserta')} onDonasiClick={() => scrollTo('donasi')} />

      {/* TENTANG */}
      <section id="tentang" className="py-16 px-4 bg-[#F5F5F0]"><div className="max-w-6xl mx-auto"><div className="text-center mb-10"><h2 className="text-3xl font-black text-gray-900">TENTANG ACARA</h2><p className="text-gray-500 mt-1">Merayakan Kemerdekaan Bersama</p></div><div className="grid lg:grid-cols-2 gap-6"><div><div className="bg-white rounded-2xl shadow-sm border p-6 mb-6"><p className="text-gray-600 text-sm leading-relaxed">Dalam rangka memeriahkan Hari Ulang Tahun Kemerdekaan Republik Indonesia yang ke-81, warga Perumahan Ciptaland Blok Mawar RT 002 RW 014 akan mengadakan berbagai kegiatan yang seru dan penuh semangat kebersamaan.</p><p className="text-gray-600 text-sm leading-relaxed mt-3">Acara ini bertujuan untuk mempererat tali silaturahmi antar warga, menanamkan semangat nasionalisme, dan menciptakan kenangan indah bersama keluarga dan tetangga.</p></div><div className="grid grid-cols-2 gap-3">{[{icon:'🤝',t:'Kebersamaan',d:'Mempererat silaturahmi'},{icon:'🎉',t:'Kemeriahan',d:'Berbagai lomba seru'},{icon:'🏆',t:'Hadiah',d:'Total jutaan rupiah'},{icon:'🇮🇩',t:'Nasionalisme',d:'Semangat kemerdekaan'}].map(f=>(<div key={f.t} className="bg-white rounded-xl shadow-sm border p-4 text-center"><div className="text-2xl mb-1">{f.icon}</div><div className="font-bold text-sm text-gray-800">{f.t}</div><div className="text-xs text-gray-400 mt-0.5">{f.d}</div></div>))}</div></div>
      
      {/* STATIC & INTERACTIVE EVENT INFO CARD */}
      <div className="bg-gradient-to-br from-[#C1272D] to-[#8B1A1A] rounded-2xl shadow-lg p-8 text-white flex flex-col justify-center relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
        <div className="text-3xl mb-4 flex items-center justify-between">
          <span>🎊</span>
          <select className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer" onChange={(e)=>{ alert(`Menampilkan rancangan untuk tahun ${e.target.value}. Semua rincian di bawah disesuaikan.`); }}>
            <option value="2026" className="text-gray-800 font-bold">Tahun 2026 (Aktif)</option>
            <option value="2027" className="text-gray-800">Tahun 2027 (Rancangan)</option>
            <option value="2028" className="text-gray-800">Tahun 2028 (Rancangan)</option>
          </select>
        </div>
        <h3 className="text-xl font-black mb-6">Informasi Acara</h3>
        <div className="space-y-5">
          {[{i:'📅',l:'Tanggal',v:'Minggu, 17 Agustus 2026', c:'Klik untuk tambah ke kalender', action:()=>alert('Fitur tambah ke Google Calendar sukses!')},{i:'⏰',l:'Waktu',v:'06:00 - 22:00 WIB', c:'Rundown lengkap ada di bawah'},{i:'📍',l:'Lokasi',v:'Perumahan Ciptaland Blok Mawar\nRT 002 / RW 014', c:'Klik untuk rute peta', action:()=>alert('Membuka rute koordinat Google Maps Perumahan Ciptaland Blok Mawar...')},{i:'👥',l:'Peserta',v:'Seluruh Warga & Keluarga', c:'Terbuka untuk warga RT 001-004'}].map((info, idx)=>(
            <div key={idx} onClick={info.action} className={`flex items-start gap-4 p-2 rounded-xl transition ${info.action ? 'hover:bg-white/10 cursor-pointer' : ''}`}>
              <span className="text-2xl">{info.i}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/60 font-bold uppercase tracking-wider">{info.l}</div>
                <div className="font-semibold text-sm whitespace-pre-line mt-0.5">{info.v}</div>
                <div className="text-[10px] text-white/40 italic mt-0.5">{info.c}</div>
              </div>
              {info.action && <span className="text-xs text-white/50">➔</span>}
            </div>
          ))}
        </div>
      </div>

      </div></div></section>

      <LombaSection onDaftarLomba={(lombaId) => { const l = lombaList.find(x => x.id === lombaId); if (l) setFormData(prev => ({ ...prev, lomba: prev.lomba.includes(l.nama) ? prev.lomba : [...prev.lomba, l.nama] })); setShowRegisterModal(true); }} />

      {/* DONASI */}
      <section id="donasi" className="py-16 px-4 bg-white"><div className="max-w-6xl mx-auto"><div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">❤️ Donasi</h2><p className="text-gray-500 mt-1">Setiap kontribusi sangat berarti</p></div><div className="grid lg:grid-cols-2 gap-6"><div className="bg-[#F9F5EB] rounded-2xl border p-6"><h3 className="font-bold text-lg text-[#C1272D] mb-4">❤️ Konfirmasi Donasi</h3><form onSubmit={handleDonasi} className="space-y-3"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={donasiForm.isAnon} onChange={e => setDonasiForm({...donasiForm,isAnon:e.target.checked})} className="rounded" /> Hamba Allah (Anonim)</label>{!donasiForm.isAnon && <input required value={donasiForm.name} onChange={e => setDonasiForm({...donasiForm,name:e.target.value})} placeholder="Nama Donatur" className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white" />}<input required value={donasiForm.alamat} onChange={e => setDonasiForm({...donasiForm,alamat:e.target.value})} placeholder="Alamat / Blok Rumah" className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white" /><input required type="number" value={donasiForm.jumlah} onChange={e => setDonasiForm({...donasiForm,jumlah:e.target.value})} placeholder="Jumlah Donasi (Rp)" className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white" /><button type="submit" className="w-full bg-[#C1272D] text-white font-bold py-3 rounded-xl hover:bg-red-700 transition text-sm">Kirim Konfirmasi</button></form></div><div className="bg-[#F9F5EB] rounded-2xl border p-6 text-center flex flex-col items-center justify-center"><h4 className="font-bold text-lg mb-4">📱 QRIS Donasi Resmi</h4><div className="bg-white rounded-2xl border shadow-sm p-3 mb-4 inline-block"><img src={qrisImage} alt="QRIS Aulia Komari" className="w-52 h-52 object-contain rounded-xl" /></div><p className="font-bold text-[#C1272D] text-sm mb-1">AULIA KOMARI</p><p className="text-gray-500 text-xs mb-3">Bendahara HUT RI ke-81</p><div className="text-left w-full max-w-xs"><div className="bg-white rounded-xl p-3 border space-y-1.5"><p className="text-xs text-gray-400 text-center mb-1">62-813****5007 • DANA</p><div className="border-t pt-1.5 space-y-1"><p className="text-xs flex items-center gap-2"><span className="font-bold">🏦 SeaBank</span> <span className="font-mono text-gray-700 select-all">901592977740</span></p><p className="text-xs flex items-center gap-2"><span className="font-bold">💳 DANA</span> <span className="font-mono text-gray-700 select-all">081364755007</span></p></div></div></div></div></div></div></section>

      {/* ===== Wrapper flex: Transaksi → Peserta → Talenta → Panitia → Anggaran ===== */}
      <div className="flex flex-col">
      {/* =================== TRANSAKSI KEUANGAN REALTIME =================== */}
      <section id="transaksi" className="py-16 px-4 bg-[#121212] text-white border-t border-gray-800 order-1">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-gray-800 pb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-lg">💳</span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Transaksi Keuangan Realtime — QRIS Dana & Transfer Bank</h2>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-green-900/40 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full border border-green-800/30">
                LIVE • {shared.keuanganList.length} transaksi
              </span>
              <span className="bg-gray-800/80 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full">
                Pemasukan: {formatRupiah(totalPemasukan)} | Pengeluaran: {formatRupiah(totalPengeluaran)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Iuran / Donatur / Sponsor / Donasi / Pengeluaran — Setiap transaksi langsung terkoneksi & sinkron ke Total Dana, Ringkasan Anggaran, dan Panel Panitia.
          </p>

          {/* 5 WHITE STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white text-gray-900 rounded-xl p-4 border border-gray-200">
              <div className="text-[11px] text-gray-500 font-semibold mb-1">Cash</div>
              <div className="text-xl sm:text-2xl font-black text-blue-600">{formatRupiah(totalCash)}</div>
              <div className="text-[10px] text-gray-400 mt-1">{cashList.length} transaksi cash</div>
            </div>
            <div className="bg-white text-gray-900 rounded-xl p-4 border border-gray-200">
              <div className="text-[11px] text-gray-500 font-semibold mb-1">Donatur</div>
              <div className="text-xl sm:text-2xl font-black text-red-600">{donaturList.length}</div>
              <div className="text-[10px] text-gray-400 mt-1">Total donatur</div>
            </div>
            {/* KOLOM SPONSOR — slideshow mitra */}
            <div className="bg-white text-gray-900 rounded-xl p-4 border border-gray-200 relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[11px] text-gray-500 font-semibold">Sponsor</div>
                <span className="text-[10px] text-gray-400">{sponsorSlides.length > 0 ? `${(sponsorIdx % sponsorSlides.length) + 1}/${sponsorSlides.length}` : ''}</span>
              </div>
              {sponsorSlides.length === 0 ? (
                <div className="text-xs text-gray-400 italic mt-2">Belum ada sponsor</div>
              ) : (
                <div key={sponsorIdx % sponsorSlides.length} className="flex items-center gap-3 animate-in">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">{sponsorSlides[sponsorIdx % sponsorSlides.length].icon}</div>
                  <div className="min-w-0">
                    <div className={`font-black text-sm truncate ${sponsorSlides[sponsorIdx % sponsorSlides.length].warna}`}>{sponsorSlides[sponsorIdx % sponsorSlides.length].nama}</div>
                    <div className="text-[10px] text-gray-500 truncate">{sponsorSlides[sponsorIdx % sponsorSlides.length].deskripsi}</div>
                  </div>
                </div>
              )}
              {sponsorSlides.length > 1 && (
                <div className="flex gap-1 mt-3">
                  {sponsorSlides.map((_, i) => (
                    <button key={i} onClick={() => setSponsorIdx(i)} className={`h-1.5 rounded-full transition-all ${i === sponsorIdx % sponsorSlides.length ? 'w-5 bg-purple-500' : 'w-1.5 bg-gray-300'}`} />
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white text-gray-900 rounded-xl p-4 border border-gray-200">
              <div className="text-[11px] text-gray-500 font-semibold mb-1">Donasi</div>
              <div className="text-xl sm:text-2xl font-black text-green-600">{formatRupiah(totalDonasi)}</div>
              <div className="text-[10px] text-gray-400 mt-1">{donasiList.length} transaksi donasi</div>
            </div>
            <div className="bg-white text-gray-900 rounded-xl p-4 border border-gray-200">
              <div className="text-[11px] text-gray-500 font-semibold mb-1">Pengeluaran</div>
              <div className="text-xl sm:text-2xl font-black text-orange-600">{formatRupiah(totalPengeluaran)}</div>
              <div className="text-[10px] text-gray-400 mt-1">{pengeluaranList.length} transaksi</div>
            </div>
          </div>

          {/* 6 COLUMNS: CASH, DONATUR, SPONSOR, DONASI, PENGELUARAN, TRANSFER */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-gray-800 border border-gray-800 rounded-xl overflow-hidden">
            {[
              { title: 'CASH', color: 'text-blue-400', list: cashList, empty: 'Belum ada', fmt: (k: KeuanganEntry) => `+${formatRupiah(k.jumlah)}`, amt: 'text-blue-400' },
              { title: 'DONATUR', color: 'text-red-400', list: donaturList, empty: 'Belum ada', fmt: (k: KeuanganEntry) => `+${formatRupiah(k.jumlah)}`, amt: 'text-red-400' },
              { title: 'SPONSOR', color: 'text-purple-400', list: sponsorTxList, empty: 'Belum ada', fmt: (k: KeuanganEntry) => (k.jumlah ? `+${formatRupiah(k.jumlah)}` : 'Mitra'), amt: 'text-purple-400' },
              { title: 'DONASI', color: 'text-green-400', list: donasiList, empty: 'Belum ada', fmt: (k: KeuanganEntry) => `+${formatRupiah(k.jumlah)}`, amt: 'text-green-400' },
              { title: 'PENGELUARAN', color: 'text-orange-400', list: pengeluaranList, empty: 'Belum ada', fmt: (k: KeuanganEntry) => `- ${formatRupiah(k.jumlah)}`, amt: 'text-orange-400', outline: true },
              { title: 'TRANSFER', color: 'text-yellow-400', list: transferList, empty: 'Belum ada', fmt: (k: KeuanganEntry) => `+${formatRupiah(k.jumlah)}`, amt: 'text-yellow-400' },
            ].map(col => (
              <div key={col.title} className="bg-[#161616] p-3 flex flex-col">
                <h3 className={`text-[11px] font-black tracking-wider uppercase mb-2 ${col.color}`}>{col.title}</h3>
                <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1 flex-1">
                  {col.list.length === 0 ? (
                    <div className="text-[11px] text-gray-600 py-4 text-center italic">{col.empty}</div>
                  ) : (
                    col.list.map((k, idx) => (
                      <div key={idx} className={`rounded-lg p-2.5 ${col.outline ? 'bg-orange-950/30 border border-orange-700/40' : 'bg-gray-900/70 border border-gray-800'}`}>
                        <div className="font-bold text-xs text-white truncate">{k.nama}</div>
                        {k.keterangan && <div className="text-[10px] text-gray-500 truncate mt-0.5">{k.keterangan}</div>}
                        <div className={`font-mono font-bold text-[11px] mt-1 ${col.amt}`}>{col.fmt(k)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer of Financial Block */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-800 text-[10px] text-gray-500 gap-3">
            <span>🔗 Sinkron langsung: Iuran + Donatur + Sponsor + Donasi + Pengeluaran → Total Dana Hero & Admin Panitia</span>
            <button onClick={downloadPengeluaranCSV} className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition shadow">
              📥 Unduh Rincian Pengeluaran CSV
            </button>
          </div>
        </div>
      </section>

      {/* PANITIA TABLE */}
      <section id="panitia" className="py-16 px-4 bg-[#F5F5F0] order-4"><div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden"><div className="p-5"><h3 className="font-bold text-lg text-[#C1272D] flex items-center gap-2">👥 Susunan Panitia</h3></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-[#C1272D] text-white"><th className="text-left px-4 py-3 font-semibold">Jabatan</th><th className="text-left px-4 py-3 font-semibold">Nama</th></tr></thead><tbody>{panitiaList.filter(p => p.isCore).map((p, i) => (<tr key={i} className={i % 2 === 0 ? 'bg-[#F9F5EB]' : 'bg-white'}><td className="px-4 py-3 font-medium">{p.jabatan}</td><td className="px-4 py-3">{p.nama}{p.hp ? ` (${p.hp})` : ''}</td></tr>))}</tbody></table></div></div></section>

      {/* ANGGARAN */}
      <section id="anggaran" className="py-16 px-4 bg-white order-5"><div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border overflow-hidden"><div className="p-5"><h3 className="font-bold text-lg text-[#C1272D] flex items-center gap-2">🧮 Ringkasan Anggaran</h3></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-[#C1272D] text-white"><th className="text-left px-4 py-3">Komponen</th><th className="text-right px-4 py-3">Jumlah (Rp)</th><th className="text-left px-4 py-3">Detail</th></tr></thead><tbody>{budgetRows.map((r, i) => (<tr key={i} className={r.isTotal ? 'bg-[#F9E2E2] font-bold text-[#C1272D]' : r.isSurplus ? 'bg-green-50 font-bold text-green-700' : i % 2 === 0 ? 'bg-[#F9F5EB]' : 'bg-white'}><td className="px-4 py-3">{r.komponen}</td><td className="px-4 py-3 text-right">{r.jumlah.toLocaleString('id-ID')}</td><td className="px-4 py-3">{r.detailKey && <button onClick={() => setShowBudgetDetail(r.detailKey!)} className="border border-[#C1272D] text-[#C1272D] px-3 py-1 rounded-full text-xs font-semibold hover:bg-[#C1272D] hover:text-white transition">Lihat Detail</button>}</td></tr>))}</tbody></table></div></div></section>

      {/* REAL-TIME TABLE — DIPINDAH ke bawah Transaksi via order-2 */}
      <section id="peserta" className="relative order-2">
        <div className="bg-gradient-to-br from-[#C1272D] via-[#B71C22] to-[#8B1A1A] px-4 pt-14 pb-28"><div className="max-w-6xl mx-auto"><div className="inline-flex items-center gap-2 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-5 shadow-lg"><span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span></span>LIVE • REAL-TIME</div><div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"><div><h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">TABEL REAL-TIME</h2><h3 className="text-2xl sm:text-3xl font-black text-white/80 leading-tight">DAFTAR PESERTA</h3><p className="text-white/50 text-sm mt-3 max-w-xl leading-relaxed">Data peserta terupdate otomatis. Sinkron antara halaman utama dan Admin Panitia via Supabase Realtime.</p></div><div className="flex gap-3 flex-shrink-0"><div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center min-w-[120px]"><div className="text-xs text-white/60 font-bold uppercase tracking-wider">Total Peserta</div><div className="text-3xl font-black text-white mt-1">{participants.length}</div><div className="flex items-center justify-center gap-1 mt-1"><span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-1.5 w-1.5 bg-green-400"></span></span><span className="text-[10px] text-green-300 font-semibold">Sinkron</span></div></div><div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 text-center min-w-[140px]"><div className="text-xs text-white/60 font-bold uppercase tracking-wider">Status Terakhir</div><div className="text-lg font-black text-white mt-1">{lastRefresh.toLocaleTimeString('id-ID')} WIB</div><div className="flex items-center justify-center gap-1 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span><span className="text-[10px] text-green-300 font-semibold">Sinkron • {isLive ? 'ON' : 'OFF'}</span></div></div></div></div></div></div>
        <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 pb-16"><div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100"><div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"><div className="relative flex-1"><svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari Nama, ID, atau RT / Blok..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C1272D]/20 focus:border-[#C1272D]/40 transition" />{searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">✕</button>}</div><select value={filterLomba} onChange={e => setFilterLomba(e.target.value)} className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-3 text-sm outline-none min-w-[140px]"><option value="">Semua Lomba</option>{uniqueLomba.map(l => <option key={l} value={l}>{l}</option>)}</select><button onClick={() => setIsLive(!isLive)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isLive ? 'bg-green-500 text-white shadow-md shadow-green-200' : 'bg-gray-200 text-gray-600'}`}><span className="relative flex h-2 w-2">{isLive && <span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-75"></span>}<span className={`relative rounded-full h-2 w-2 ${isLive ? 'bg-white' : 'bg-gray-400'}`}></span></span>{isLive ? 'LIVE ON' : 'LIVE OFF'}</button><button onClick={() => { let csv = 'No,ID,Nama,RT,HP,Lomba,Waktu\n'; participants.forEach((p, i) => { csv += `${i+1},${p.id},${p.name},"${p.rt}",${p.hp},"${p.lomba.join('; ')}",${p.waktu}\n`; }); const b = new Blob([csv], { type: 'text/csv' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'pendaftar-mawar.csv'; a.click(); URL.revokeObjectURL(u); }} className="flex items-center gap-1.5 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition whitespace-nowrap">📥 Export CSV</button></div></div>
          <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gray-50/50"><div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"><span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0">Filter Cepat</span><button onClick={() => { setSearchQuery(''); setFilterLomba(''); }} className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all ${!searchQuery && !filterLomba ? 'bg-[#C1272D] text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>Semua • {participants.length}</button>{uniqueLomba.map(l => { const cnt = participants.filter(p => p.lomba.includes(l)).length; return (<button key={l} onClick={() => setFilterLomba(filterLomba === l ? '' : l)} className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all ${filterLomba === l ? 'bg-[#C1272D] text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{l} • {cnt}</button>); })}</div></div>
          <div className="overflow-x-auto"><div className="max-h-[540px] overflow-y-auto"><table className="w-full text-sm"><thead className="sticky top-0 z-10"><tr className="bg-gray-100 border-b border-gray-200"><th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24">No / ID</th><th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Peserta & Kontak</th><th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Lokasi RT</th><th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Lomba Diikuti</th><th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Waktu Daftar</th><th className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-28">Status</th></tr></thead><tbody>{filteredP.length === 0 ? (<tr><td colSpan={6} className="text-center py-20 text-gray-400"><div className="text-5xl mb-3">🔍</div><div className="font-bold text-gray-500">Tidak ada data ditemukan</div></td></tr>) : filteredP.map((p, i) => { const isNew = newRowIds.has(p.name); const maskedHp = p.hp ? p.hp.replace(/(\d{4})(\d+)(\d{3})/, '$1****$3') : '-'; return (<tr key={p.id+i} className={`border-b border-gray-100 transition-all duration-300 ${isNew ? 'bg-yellow-50 border-l-4 border-l-yellow-400' : 'hover:bg-red-50/30'}`}><td className="px-4 py-3.5"><div className="text-xs text-gray-400 font-mono mb-0.5">{i + 1}.</div><span className="font-mono text-[11px] font-bold text-[#C1272D] bg-red-50 border border-red-100 px-2 py-0.5 rounded-md inline-block">{p.id}</span></td><td className="px-4 py-3.5"><div className="font-bold text-gray-900 text-sm">{p.name}</div><div className="flex items-center gap-2 mt-1"><span className="text-[11px] text-gray-400 font-mono">📱 {maskedHp}</span>{isNew ? <span className="text-[9px] font-bold text-yellow-700 bg-yellow-100 border border-yellow-200 px-1.5 py-0.5 rounded-full">✨ Live join</span> : <span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full">• Live join</span>}</div></td><td className="px-4 py-3.5 text-xs text-gray-700">{p.rt}</td><td className="px-4 py-3.5"><div className="flex flex-wrap gap-1">{p.lomba.map((l, li) => <span key={li} className="text-[11px] font-medium text-gray-600">{l}{li < p.lomba.length - 1 ? ',' : ''}</span>)}</div></td><td className="px-4 py-3.5"><div className="text-xs text-gray-700">{p.waktu}</div>{isNew && <div className="text-[10px] text-yellow-600 font-semibold mt-0.5">baru saja</div>}</td><td className="px-4 py-3.5"><span className={`text-xs font-bold tracking-wide ${isNew ? 'text-yellow-600' : 'text-green-600'}`}>{isNew ? '⏳ BARU' : '✅ TERDAFTAR'}</span></td></tr>); })}</tbody></table></div></div>
          <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-gray-400"><span>✅ Menampilkan <strong className="text-gray-600">{filteredP.length}</strong> dari <strong className="text-gray-600">{participants.length}</strong> peserta</span><span className="flex items-center gap-3"><span>Supabase: <span className="text-green-500 font-bold">ON</span></span><span className="font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">ID MWR81-XXXX</span></span></div>
        </div><div className="grid sm:grid-cols-3 gap-4 mt-6"><div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"><div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-lg">⚡</span><h4 className="font-bold text-sm text-gray-800">Filter Keket Aktif</h4></div><p className="text-xs text-gray-500 leading-relaxed">Otomatis membuang baris RT kosong dan nomor uji coba spam.</p></div><div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"><div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg">🔄</span><h4 className="font-bold text-sm text-gray-800">Tempo Reload</h4></div><p className="text-xs text-gray-500 leading-relaxed">Data terbaru muncul di atas dengan highlight kuning otomatis.</p></div><div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"><div className="flex items-center gap-2 mb-2"><span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-lg">📤</span><h4 className="font-bold text-sm text-gray-800">Export & Share</h4></div><p className="text-xs text-gray-500 leading-relaxed">Unduh CSV untuk laporan panitia. Siap print.</p></div></div></div>
      </section>

      {/* =================== TALENTA MALAM PUNCAK 22 AGUSTUS 2026 =================== */}
      <section id="talenta" className="py-16 px-4 bg-[#1a1a1a] text-white order-3">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block text-[11px] font-bold bg-yellow-400 text-gray-900 px-3 py-1 rounded-full mb-3">🌙 MALAM PUNCAK • 22 AGUSTUS 2026</span>
            <h2 className="text-2xl sm:text-3xl font-black">Talenta Anak Malam Puncak HUT RI Ke-81</h2>
            <p className="text-gray-400 text-sm mt-2">Rundown pengisi acara — data dapat ditambah & diedit di Kolom Khusus Admin Panitia</p>
          </div>
          <div className="bg-[#161616] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#C1272D] text-white">
                    <th className="px-4 py-3 text-left text-xs font-bold w-12">No</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Jenis Penampilan</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Nama Peserta</th>
                    <th className="px-4 py-3 text-center text-xs font-bold w-24">Jumlah</th>
                    <th className="px-4 py-3 text-center text-xs font-bold w-24">Durasi</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">Penanggung Jawab</th>
                    <th className="px-4 py-3 text-center text-xs font-bold w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {shared.talentaList.map((t, i) => (
                    <tr key={(t.id || 0) + '-' + i} className="hover:bg-white/5 transition">
                      <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{t.no || i + 1}</td>
                      <td className="px-4 py-3.5 font-bold text-yellow-400">{t.jenis}</td>
                      <td className="px-4 py-3.5 text-gray-200 text-xs leading-relaxed">{t.nama}</td>
                      <td className="px-4 py-3.5 text-center"><span className="bg-gray-800 text-gray-200 font-bold px-2.5 py-1 rounded-full text-xs">{t.jumlah || '—'}</span></td>
                      <td className="px-4 py-3.5 text-center text-gray-300 text-xs">{t.durasi ? `${t.durasi} Menit` : '— Menit'}</td>
                      <td className="px-4 py-3.5 text-gray-400 text-xs">{t.pj || '________________'}</td>
                      <td className="px-4 py-3.5 text-center">
                        {t.status ? <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-700/40">✓ {t.status}</span> : <span className="text-gray-600">☐</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Total peserta */}
            <div className="px-5 py-4 bg-[#101010] border-t border-gray-800">
              <div className="text-xs font-black text-yellow-400 uppercase tracking-wider mb-2">Total Peserta Saat Ini</div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-400">
                {shared.talentaList.map((t, i) => (
                  <div key={i} className="flex justify-between"><span>{t.jenis}</span><span className="text-gray-200 font-bold">{t.jumlah ? `${t.jumlah} orang` : '± … orang'}</span></div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-300">
                Total sementara: <span className="font-black text-white">{shared.talentaList.reduce((s, t) => s + (parseInt(t.jumlah) || 0), 0)} peserta</span> + peserta "dkk" Tari Zapin.
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>{/* end flex wrapper */}

      {/* RUNDOWN */}
      <section id="rundown" className="py-16 px-4 bg-white"><div className="max-w-4xl mx-auto"><div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">📋 RUNDOWN ACARA</h2><p className="text-gray-500 mt-1">Jadwal Kegiatan — Minggu, 17 Agustus 2026</p></div><div className="flex flex-wrap gap-2 justify-center mb-8"><button onClick={() => { const b = new Blob([rundownText()], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'rundown-hutri81-mawar.txt'; a.click(); URL.revokeObjectURL(u); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition">📄 Download (TXT)</button><button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition">🖨️ Cetak / Save PDF</button></div><div className="bg-[#F9F5EB] rounded-2xl border p-6"><h4 className="font-bold text-[#C1272D] mb-4 text-sm">☀️ PAGI & SIANG</h4><div className="space-y-3 mb-8">{rundownPagi.map((r, i) => (<div key={i} className="flex items-start gap-4 bg-white rounded-xl p-3 border"><div className="min-w-[60px] text-center"><span className="font-black text-[#C1272D] text-lg">{r.waktu}</span></div><div className="flex-1"><span className="text-lg mr-2">{r.icon}</span><span className="font-semibold text-sm text-gray-800">{r.kegiatan}</span>{r.keterangan && <span className="text-xs text-gray-400 ml-2">({r.keterangan})</span>}</div></div>))}</div><h4 className="font-bold text-[#C1272D] mb-4 text-sm">🌙 MALAM PUNCAK</h4><div className="space-y-3">{rundownMalam.map((r, i) => (<div key={i} className="flex items-start gap-4 bg-white rounded-xl p-3 border"><div className="min-w-[60px] text-center"><span className="font-black text-[#C1272D] text-lg">{r.waktu}</span></div><div className="flex-1"><span className="text-lg mr-2">{r.icon}</span><span className="font-semibold text-sm text-gray-800">{r.kegiatan}</span>{r.keterangan && <span className="text-xs text-gray-400 ml-2">({r.keterangan})</span>}</div></div>))}</div></div></div></section>

      {/* PANITIA */}
      <section id="panitia" className="py-16 px-4 bg-[#F5F5F0]"><div className="max-w-6xl mx-auto"><div className="text-center mb-8"><h2 className="text-3xl font-black text-gray-900">PANITIA PELAKSANA</h2><p className="text-gray-500 mt-1">Struktur Panitia</p></div><div className="grid sm:grid-cols-3 gap-4 mb-6">{panitiaList.filter(p => ['Penanggung Jawab','Ketua Panitia','Wakil Ketua'].includes(p.jabatan)).map((p, i) => (<a key={i} href={p.hp ? `https://wa.me/62${p.hp.replace(/\D/g, '').replace(/^0/, '')}` : '#'} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl shadow-sm border p-5 text-center hover:shadow-lg transition group block"><div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl group-hover:bg-[#C1272D] group-hover:text-white transition">👤</div><div className="text-[10px] text-yellow-600 font-bold">⭐ {p.jabatan}</div><div className="font-bold text-gray-900 mt-1">{p.nama}</div><div className="text-xs text-gray-500 mt-0.5">📱 {p.hp}</div></a>))}</div><h4 className="font-bold text-gray-700 mb-4">Anggota Panitia Lainnya</h4><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">{panitiaList.filter(p => !['Penanggung Jawab','Ketua Panitia','Wakil Ketua','Ketua Pembina','Ketua Penasehat'].includes(p.jabatan)).map((p, i) => (<div key={i} className="bg-white rounded-xl border p-3 text-center hover:shadow-md transition"><div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-lg">👤</div><div className="font-bold text-sm text-gray-800 truncate">{p.nama}</div><div className="text-[10px] text-gray-500">{p.jabatan}</div>{p.hp && <div className="text-[10px] text-gray-400 mt-0.5">📞 {p.hp}</div>}{p.hp && !p.hp.includes('xxx') && <a href={`https://wa.me/62${p.hp.replace(/\D/g, '').replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-green-500 hover:text-green-600 text-lg">💬</a>}</div>))}</div></div></section>

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] text-white py-12 px-4"><div className="max-w-6xl mx-auto text-center"><div className="flex items-center justify-center gap-3 mb-4"><div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center font-black text-[#C1272D] text-lg shadow">81</div><div className="text-left"><div className="font-bold text-lg">HUT RI Ke-81</div><div className="text-xs text-gray-400">Perumahan Ciptaland Blok Mawar</div></div></div><p className="text-gray-400 text-sm mb-2">RT 002 / RW 014</p><p className="text-gray-500 text-xs mb-4">📧 panitiahutri81.mawar002@gmail.com</p><div className="flex items-center justify-center gap-4 mb-6"><button onClick={onGalleryClick} className="text-xs text-gray-400 hover:text-white transition">📸 Galeri</button><span className="text-gray-700">•</span><button onClick={onAdminClick} className="text-xs text-gray-600 hover:text-gray-400 transition">🔒 Panel Panitia</button></div><div className="border-t border-gray-800 pt-4"><p className="text-gray-600 text-xs">© 2026 Panitia HUT RI ke-81 — Perumahan Ciptaland Blok Mawar 🇮🇩</p></div></div></footer>

      {/* NATIVE FLOATING WHATSAPP BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        {waOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border w-72 overflow-hidden animate-in mb-2">
            <div className="bg-[#25D366] px-4 py-3 text-white">
              <div className="font-bold text-sm">Hubungi Panitia via WhatsApp</div>
              <div className="text-[10px] text-white/70">Pilih kontak panitia aktif</div>
            </div>
            {[{n:'Eka Rista Y',j:'Penanggung Jawab',h:'0821-7129-9984'},{n:'Bayu S.Permana',j:'Ketua Panitia',h:'0812-8839-5550'},{n:'Sugiono',j:'Wakil Ketua',h:'0831-8395-0205'}].map((c,i)=>(
              <a key={i} href={`https://wa.me/62${c.h.replace(/\D/g,'').replace(/^0/,'')}?text=Halo%20${encodeURIComponent(c.n)}%2C%20saya%20ingin%20bertanya%20tentang%20HUT%20RI%20ke-81`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition border-b last:border-0">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.739-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.799-4.382 9.802-9.77.001-2.611-1.013-5.064-2.855-6.912C16.376 2.075 13.91 1.06 11.298 1.06 5.9 1.06 1.505 5.447 1.502 10.835c-.001 1.516.4 3.003 1.159 4.298l-.997 3.639 3.734-.979zm11.332-6.52c-.27-.136-1.597-.787-1.845-.877-.247-.09-.427-.135-.607.136-.18.27-.697.877-.855 1.057-.157.18-.315.203-.585.068-1.745-.863-2.923-1.536-4.088-2.545-.308-.266-.312-.418-.112-.667.157-.197.35-.418.525-.626.175-.208.233-.356.35-.593.116-.237.058-.445-.029-.623-.087-.18-.607-1.464-.83-1.997-.217-.52-.455-.45-.62-.45-.16 0-.344-.012-.529-.012-.185 0-.485.07-.74.35-.254.28-.97.948-.97 2.31 0 1.361 1.001 2.68 1.14 2.862.14.18 1.97 3.01 4.773 4.22.666.287 1.187.458 1.593.587.67.213 1.28.183 1.762.112.537-.08 1.597-.653 1.822-1.252.225-.6 2.25-1.722.225-.6-.045-.136-.21-.27-.48-.406z"/></svg>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-800">{c.j}</div>
                  <div className="text-xs text-gray-500">{c.h}</div>
                </div>
              </a>
            ))}
          </div>
        )}
        <button onClick={() => setWaOpen(!waOpen)} className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 ${waOpen ? 'bg-red-500 rotate-45' : 'bg-[#25D366]'}`}>
          {waOpen ? '✕' : (
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.739-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.799-4.382 9.802-9.77.001-2.611-1.013-5.064-2.855-6.912C16.376 2.075 13.91 1.06 11.298 1.06 5.9 1.06 1.505 5.447 1.502 10.835c-.001 1.516.4 3.003 1.159 4.298l-.997 3.639 3.734-.979zm11.332-6.52c-.27-.136-1.597-.787-1.845-.877-.247-.09-.427-.135-.607.136-.18.27-.697.877-.855 1.057-.157.18-.315.203-.585.068-1.745-.863-2.923-1.536-4.088-2.545-.308-.266-.312-.418-.112-.667.157-.197.35-.418.525-.626.175-.208.233-.356.35-.593.116-.237.058-.445-.029-.623-.087-.18-.607-1.464-.83-1.997-.217-.52-.455-.45-.62-.45-.16 0-.344-.012-.529-.012-.185 0-.485.07-.74.35-.254.28-.97.948-.97 2.31 0 1.361 1.001 2.68 1.14 2.862.14.18 1.97 3.01 4.773 4.22.666.287 1.187.458 1.593.587.67.213 1.28.183 1.762.112.537-.08 1.597-.653 1.822-1.252.225-.6 2.25-1.722.225-.6-.045-.136-.21-.27-.48-.406z" />
            </svg>
          )}
        </button>
      </div>

      {/* MODALS */}
      {showRegisterModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowRegisterModal(false)}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in" onClick={e => e.stopPropagation()}><div className="bg-gradient-to-r from-[#C1272D] to-[#8B1A1A] px-6 py-4 rounded-t-2xl flex items-center justify-between"><h3 className="font-bold text-white text-lg">📝 Form Pendaftaran</h3><button onClick={() => setShowRegisterModal(false)} className="text-white/70 hover:text-white text-xl">✕</button></div><form onSubmit={handleRegister} className="p-6 space-y-4"><div><label className="text-xs font-semibold text-gray-600 block mb-1">Nama Lengkap *</label><input required value={formData.name} onChange={e => setFormData({...formData,name:e.target.value})} placeholder="Contoh: Abiyu Rexxa" className="w-full border rounded-xl px-4 py-2.5 text-sm" /></div><div><label className="text-xs font-semibold text-gray-600 block mb-1">Nomor WhatsApp *</label><input required value={formData.hp} onChange={e => setFormData({...formData,hp:e.target.value})} placeholder="08xxxxxxxxxx" className="w-full border rounded-xl px-4 py-2.5 text-sm" /></div><div><label className="text-xs font-semibold text-gray-600 block mb-1">Alamat (RT / Blok) *</label><input required value={formData.rt} onChange={e => setFormData({...formData,rt:e.target.value})} placeholder="Contoh: RT 002 / Blok Mawar 12" className="w-full border rounded-xl px-4 py-2.5 text-sm" /></div><div><label className="text-xs font-semibold text-gray-600 block mb-1">Pilih Lomba * ({formData.lomba.length} dipilih)</label><div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-xl p-2 bg-gray-50">{allLombaNames.map(l => (<label key={l} className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg border cursor-pointer hover:bg-red-50/40 transition"><input type="checkbox" checked={formData.lomba.includes(l)} onChange={e => { if (e.target.checked) setFormData({...formData,lomba:[...formData.lomba,l]}); else setFormData({...formData,lomba:formData.lomba.filter(x => x !== l)}); }} className="rounded text-[#C1272D]" /><span>{l}</span></label>))}</div></div><button type="submit" className="w-full bg-[#C1272D] text-white font-bold py-3 rounded-xl hover:bg-red-700 transition text-sm">✅ Daftar Sekarang</button></form></div></div>)}
      {showBuktiDaftar && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowBuktiDaftar(null)}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in p-6 text-center" onClick={e => e.stopPropagation()}><div className="text-4xl mb-3">🎉</div><h3 className="font-black text-lg text-[#C1272D] mb-4">Pendaftaran Berhasil!</h3><div className="bg-red-50 border-2 border-dashed border-[#C1272D] rounded-xl p-4 text-left space-y-2 text-sm"><div><strong>No. ID:</strong> <span className="text-[#C1272D] font-bold">{showBuktiDaftar.id}</span></div><div><strong>Nama:</strong> {showBuktiDaftar.name}</div><div><strong>RT:</strong> {showBuktiDaftar.rt}</div><div><strong>HP:</strong> {showBuktiDaftar.hp}</div><div><strong>Lomba:</strong> {showBuktiDaftar.lomba.join(', ')}</div></div><button onClick={() => setShowBuktiDaftar(null)} className="mt-4 w-full bg-[#C1272D] text-white py-2.5 rounded-xl font-bold">Tutup</button></div></div>)}
      {showBuktiDonasi && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowBuktiDonasi(null)}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in p-6 text-center" onClick={e => e.stopPropagation()}><div className="text-4xl mb-3">🤲</div><h3 className="font-black text-lg text-green-700 mb-4">Donasi Berhasil!</h3><div className="bg-green-50 border-2 border-dashed border-green-500 rounded-xl p-4 text-left space-y-2 text-sm"><div><strong>Ref:</strong> <span className="text-green-700 font-bold">{showBuktiDonasi.id}</span></div><div><strong>Nama:</strong> {showBuktiDonasi.name}</div><div><strong>Jumlah:</strong> {formatRupiah(showBuktiDonasi.jumlah)}</div><div><strong>Waktu:</strong> {showBuktiDonasi.waktu}</div></div><button onClick={() => setShowBuktiDonasi(null)} className="mt-4 w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold">Tutup</button></div></div>)}
      {showBudgetDetail && budgetDetails[showBudgetDetail] && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowBudgetDetail(null)}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in" onClick={e => e.stopPropagation()}><div className="bg-[#C1272D] px-6 py-4 rounded-t-2xl flex justify-between"><h3 className="font-bold text-white">Detail Anggaran</h3><button onClick={() => setShowBudgetDetail(null)} className="text-white/70 hover:text-white text-xl">✕</button></div><div className="p-4"><table className="w-full text-sm"><thead><tr className="bg-gray-100"><th className="text-left px-3 py-2">Item</th><th className="text-left px-3 py-2">Qty</th><th className="text-right px-3 py-2">Harga</th><th className="text-right px-3 py-2">Subtotal</th></tr></thead><tbody>{budgetDetails[showBudgetDetail].map((d, i) => (<tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}><td className="px-3 py-2">{d.item}</td><td className="px-3 py-2">{d.qty}</td><td className="px-3 py-2 text-right">{d.harga.toLocaleString('id-ID')}</td><td className="px-3 py-2 text-right font-semibold">{d.subtotal.toLocaleString('id-ID')}</td></tr>))}</tbody></table></div></div></div>)}
    </div>
  );
}
