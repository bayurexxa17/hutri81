import { useState, memo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { formatRupiah } from '../data/siteData';
import type { Participant, KeuanganEntry, SharedData } from '../App';

interface Props { onBack: () => void; shared: SharedData; }

const jenisOptions = [
  { value: 'iuran', label: '💰 Iuran Warga', color: 'bg-blue-100 text-blue-700' },
  { value: 'donasi', label: '❤️ Donasi Online', color: 'bg-pink-100 text-pink-700' },
  { value: 'cash', label: '💵 Donasi Cash', color: 'bg-green-100 text-green-700' },
  { value: 'sponsor', label: '🏢 Sponsor', color: 'bg-purple-100 text-purple-700' },
  { value: 'donatur', label: '🤝 Donatur', color: 'bg-amber-100 text-amber-700' },
];
const getJenisStyle = (j: string) => jenisOptions.find(o => o.value === j)?.color || 'bg-gray-100 text-gray-700';
const getJenisLabel = (j: string) => jenisOptions.find(o => o.value === j)?.label || j;

// ===== FORM COMPONENTS — DEFINED OUTSIDE to prevent re-mount on parent re-render =====
const PesertaFormModal = memo(function PesertaFormModal({ initial, title, onSave, onCancel }: {
  initial: { nama: string; telepon: string; rt: string; lomba: string; catatan: string };
  title: string; onSave: (d: { nama: string; telepon: string; rt: string; lomba: string; catatan: string }) => void; onCancel: () => void;
}) {
  const [nama, setNama] = useState(initial.nama);
  const [telepon, setTelepon] = useState(initial.telepon);
  const [rt, setRt] = useState(initial.rt);
  const [lomba, setLomba] = useState(initial.lomba);
  const [catatan, setCatatan] = useState(initial.catatan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="bg-[#C1272D] px-6 py-4 rounded-t-2xl flex justify-between">
          <h3 className="font-bold text-white">{title}</h3>
          <button onClick={onCancel} className="text-white/70 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-6 space-y-3">
          <div><label className="text-xs font-semibold text-gray-500 block mb-1">Nama Lengkap *</label>
            <input value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama Lengkap" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#C1272D]/20 outline-none" autoFocus /></div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1">No. Telepon *</label>
            <input value={telepon} onChange={e => setTelepon(e.target.value)} placeholder="08xxxxxxxxxx" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#C1272D]/20 outline-none" /></div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1">RT / Alamat *</label>
            <input value={rt} onChange={e => setRt(e.target.value)} placeholder="RT 002 / Blok Mawar" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#C1272D]/20 outline-none" /></div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1">Lomba (pisah koma)</label>
            <input value={lomba} onChange={e => setLomba(e.target.value)} placeholder="Makan Kerupuk, Balap Kelereng" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#C1272D]/20 outline-none" /></div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1">Catatan</label>
            <input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan opsional" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#C1272D]/20 outline-none" /></div>
          <div className="flex gap-2 pt-3">
            <button onClick={onCancel} className="flex-1 py-2.5 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
            <button onClick={() => { if (!nama || !telepon || !rt) { alert('Nama, Telepon, dan RT wajib diisi!'); return; } onSave({ nama, telepon, rt, lomba, catatan }); }} className="flex-1 py-2.5 bg-[#C1272D] text-white rounded-xl text-sm font-bold hover:bg-red-700">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
});

const KeuanganFormModal = memo(function KeuanganFormModal({ initial, title, onSave, onCancel }: {
  initial: KeuanganEntry; title: string; onSave: (d: KeuanganEntry) => void; onCancel: () => void;
}) {
  const [nama, setNama] = useState(initial.nama);
  const [jenis, setJenis] = useState(initial.jenis || 'iuran');
  const [jumlah, setJumlah] = useState(initial.jumlah || 0);
  const [keterangan, setKeterangan] = useState(initial.keterangan || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="bg-gray-900 px-6 py-4 rounded-t-2xl flex justify-between">
          <h3 className="font-bold text-white">{title}</h3>
          <button onClick={onCancel} className="text-white/70 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-6 space-y-3">
          <div><label className="text-xs font-semibold text-gray-500 block mb-1">Jenis</label>
            <select value={jenis} onChange={e => setJenis(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-gray-300 outline-none">
              {jenisOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select></div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1">Nama Pembayar *</label>
            <input value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-300 outline-none" autoFocus /></div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1">Jumlah (Rp) *</label>
            <input type="number" value={jumlah || ''} onChange={e => setJumlah(Number(e.target.value))} placeholder="50000" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-300 outline-none" /></div>
          <div><label className="text-xs font-semibold text-gray-500 block mb-1">Keterangan</label>
            <input value={keterangan} onChange={e => setKeterangan(e.target.value)} placeholder="Keterangan opsional" className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-300 outline-none" /></div>
          <div className="flex gap-2 pt-3">
            <button onClick={onCancel} className="flex-1 py-2.5 border rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
            <button onClick={() => { if (!nama || !jumlah) { alert('Nama dan Jumlah wajib diisi!'); return; } onSave({ ...initial, nama, jenis, jumlah, keterangan }); }} className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ===== MAIN ADMIN COMPONENT =====
export default function AdminPage({ onBack, shared }: Props) {
  const [authed, setAuthed] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [tab, setTab] = useState<'peserta' | 'keuangan'>('peserta');
  const [searchP, setSearchP] = useState('');
  const [filterJenis, setFilterJenis] = useState('semua');

  // Modal states (simple booleans + initial data, not inline components)
  const [pesertaModal, setPesertaModal] = useState<{ mode: 'add' | 'edit'; data: { nama: string; telepon: string; rt: string; lomba: string; catatan: string } } | null>(null);
  const [keuanganModal, setKeuanganModal] = useState<{ mode: 'add' | 'edit'; data: KeuanganEntry } | null>(null);

  const authorizedUsers = [
    { user: 'admin', pass: 'mawar81', nama: 'Administrator' },
    { user: 'eka', pass: 'pj2026!', nama: 'Eka Rista Y (PJ)' },
    { user: 'bayu', pass: 'ketua2026!', nama: 'Bayu S.Permana (Ketua)' },
    { user: 'aulia', pass: 'bendahara2026!', nama: 'Aulia Komari (Bendahara)' },
    { user: 'sugiono', pass: 'wakil2026!', nama: 'Sugiono (Wakil)' },
    { user: 'lani', pass: 'sekretaris2026!', nama: 'Lani (Sekretaris)' },
    { user: 'puput', pass: 'bendahara2!', nama: 'Puput (Bendahara 2)' },
  ];

  const { participants, keuanganList, totalDana, lastRefresh } = shared;
  const filteredPeserta = participants.filter(p => searchP === '' || p.name.toLowerCase().includes(searchP.toLowerCase()) || p.rt.toLowerCase().includes(searchP.toLowerCase()) || p.hp.includes(searchP));
  const filteredKeuangan = filterJenis === 'semua' ? keuanganList : keuanganList.filter(k => k.jenis === filterJenis);
  const totalByJenis = (jenis: string) => keuanganList.filter(k => k.jenis === jenis).reduce((s, k) => s + (k.jumlah || 0), 0);

  // ===== CRUD handlers =====
  const handleSavePeserta = (f: { nama: string; telepon: string; rt: string; lomba: string; catatan: string }) => {
    const newP: Participant = {
      id: `MWR81-${String(participants.length + 1).padStart(4, '0')}`,
      name: f.nama, rt: f.rt, hp: f.telepon,
      lomba: f.lomba.split(',').map(x => x.trim()).filter(Boolean),
      catatan: f.catatan || 'Via Admin', waktu: new Date().toLocaleString('id-ID'),
    };
    shared.setParticipants(prev => [newP, ...prev]);
    shared.setNewRowIds(prev => { const s = new Set(prev); s.add(newP.name); return s; });
    setTimeout(() => shared.setNewRowIds(prev => { const s = new Set(prev); s.delete(newP.name); return s; }), 5000);
    setPesertaModal(null);
    Promise.resolve(supabase.from('pendaftar').insert([{ nama: f.nama, telepon: f.telepon, rt: f.rt, lomba: f.lomba, catatan: f.catatan }])).then(() => shared.fetchParticipants()).catch(() => {});
  };

  const handleDeletePeserta = (p: Participant) => {
    if (!confirm(`Hapus "${p.name}"?`)) return;
    shared.setParticipants(prev => prev.filter(x => x.id !== p.id));
    if (p.dbId && p.dbId > 0) Promise.resolve(supabase.from('pendaftar').delete().eq('id', p.dbId)).then(() => shared.fetchParticipants()).catch(() => {});
  };

  const [dbError, setDbError] = useState('');

  // Helper: simpan keuangan ke localStorage LANGSUNG
  const saveToLocal = (list: KeuanganEntry[]) => {
    try { localStorage.setItem('hutri81-keuangan', JSON.stringify(list)); } catch { /* storage full */ }
  };

  const handleSaveKeuangan = (k: KeuanganEntry) => {
    const newK: KeuanganEntry = { ...k, id: k.id || -(Date.now()), created_at: k.created_at || new Date().toISOString() };
    const updated = [newK, ...shared.keuanganList];
    shared.setKeuanganList(updated);
    shared.setTotalDana(updated.reduce((s, x) => s + (x.jumlah || 0), 0));
    saveToLocal(updated); // LANGSUNG simpan ke localStorage
    setKeuanganModal(null);
    setDbError('');
    // Coba simpan ke Supabase juga
    supabase.from('keuangan').insert([{ nama: k.nama, jenis: k.jenis, jumlah: k.jumlah, keterangan: k.keterangan }])
      .then((res) => {
        if (res.error) {
          setDbError(`Supabase: ${res.error.message}`);
        } else {
          setDbError('');
          shared.fetchKeuangan();
        }
      });
  };

  const testKeuanganTable = async () => {
    setDbError('Testing...');
    try {
      // Test 1: Coba SELECT
      const { data, error: selErr } = await supabase.from('keuangan').select('*').limit(1);
      if (selErr) {
        const msg = `SELECT gagal: ${selErr.message} (${selErr.code})\n\nTabel 'keuangan' kemungkinan BELUM DIBUAT di Supabase.\n\nBuka Supabase SQL Editor dan jalankan:\n\nCREATE TABLE keuangan (\n  id BIGSERIAL PRIMARY KEY,\n  nama TEXT NOT NULL,\n  jenis TEXT DEFAULT 'donasi',\n  jumlah BIGINT DEFAULT 0,\n  keterangan TEXT,\n  is_anon BOOLEAN DEFAULT FALSE,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nALTER TABLE keuangan ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "public_all" ON keuangan FOR ALL USING (true) WITH CHECK (true);`;
        setDbError(msg);
        alert(`❌ ${msg}`);
        return;
      }
      // Test 2: Coba INSERT
      const { error: insErr } = await supabase.from('keuangan').insert([{ nama: 'TEST', jenis: 'donasi', jumlah: 0, keterangan: 'Test koneksi — hapus baris ini' }]);
      if (insErr) {
        const msg = `INSERT gagal: ${insErr.message} (${insErr.code})\n\nKemungkinan: RLS policy belum diset.\n\nJalankan di SQL Editor:\nALTER TABLE keuangan ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "public_all" ON keuangan FOR ALL USING (true) WITH CHECK (true);`;
        setDbError(msg);
        alert(`❌ ${msg}`);
        return;
      }
      setDbError('');
      alert(`✅ Tabel 'keuangan' OK!\n\nSELECT: ✅\nINSERT: ✅\nJumlah data: ${(data?.length || 0) + 1}\n\nCatatan: 1 baris test telah ditambahkan (nama: TEST, jumlah: 0). Hapus manual jika perlu.`);
      shared.fetchKeuangan();
    } catch (e: any) {
      setDbError(`Network error: ${e.message}`);
      alert(`❌ Koneksi gagal: ${e.message}\n\nPeriksa VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY`);
    }
  };

  const handleDeleteKeuangan = (k: KeuanganEntry) => {
    if (!confirm('Hapus data keuangan ini?')) return;
    const updated = shared.keuanganList.filter(x => x.id !== k.id);
    shared.setKeuanganList(updated);
    shared.setTotalDana(updated.reduce((s, x) => s + (x.jumlah || 0), 0));
    saveToLocal(updated); // LANGSUNG simpan ke localStorage
    if (k.id && k.id > 0) {
      supabase.from('keuangan').delete().eq('id', k.id).then(() => shared.fetchKeuangan());
    }
  };

  // ===== LOGIN =====
  if (!authed) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in">
        <div className="w-16 h-16 bg-[#C1272D] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-white">🔒</div>
        <h2 className="text-xl font-black text-gray-900 mb-1">Panel Panitia</h2>
        <p className="text-xs text-gray-500 mb-6">HUT RI ke-81 — Blok Mawar</p>
        <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Username" className="w-full border-2 rounded-xl px-4 py-3 text-sm mb-3 focus:border-[#C1272D] outline-none" />
        <input type="password" value={loginPw} onChange={e => setLoginPw(e.target.value)} placeholder="Password" className="w-full border-2 rounded-xl px-4 py-3 text-sm mb-3 focus:border-[#C1272D] outline-none" onKeyDown={e => { if (e.key === 'Enter') { const found = authorizedUsers.find(u => u.user === loginUser.toLowerCase().trim() && u.pass === loginPw); if (found) { setAuthed(true); setCurrentUser(found.nama); } else alert('Username atau password salah!'); }}} />
        <button onClick={() => { const found = authorizedUsers.find(u => u.user === loginUser.toLowerCase().trim() && u.pass === loginPw); if (found) { setAuthed(true); setCurrentUser(found.nama); } else alert('Username atau password salah!'); }} className="w-full bg-[#C1272D] text-white font-bold py-3 rounded-xl hover:bg-red-700 transition">Masuk</button>
        <button onClick={onBack} className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition">← Kembali ke Website</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition">← Kembali</button>
          <div className="h-4 w-px bg-gray-700" />
          <span className="font-bold text-sm">🔒 Panel Panitia</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-green-500/20 rounded-full px-3 py-1.5">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-2 w-2 bg-green-400"></span></span>
            <span className="text-[10px] text-green-400 font-bold">SINKRON</span>
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">👤 {currentUser}</span>
          <button onClick={() => { setAuthed(false); onBack(); }} className="text-xs bg-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-700">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div className="flex-1"><div className="font-bold text-sm text-green-800">Sinkronisasi Real-Time Aktif</div><p className="text-xs text-green-600">Perubahan di sini langsung terlihat di halaman utama.</p></div>
          <div className="text-[10px] text-green-500 font-mono text-right hidden sm:block">Peserta: {participants.length} | Sync: {lastRefresh.toLocaleTimeString('id-ID')}</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border p-5 text-center"><div className="text-3xl font-black text-[#C1272D]">{participants.length}</div><div className="text-xs text-gray-500 font-semibold mt-1">Peserta</div></div>
          <div className="bg-white rounded-2xl shadow-sm border p-5 text-center"><div className="text-xl font-black text-green-600">{formatRupiah(totalDana)}</div><div className="text-xs text-gray-500 font-semibold mt-1">Total Dana</div></div>
          <div className="bg-white rounded-2xl shadow-sm border p-5 text-center"><div className="text-xl font-black text-blue-600">{formatRupiah(totalByJenis('iuran'))}</div><div className="text-xs text-gray-500 font-semibold mt-1">Iuran</div></div>
          <div className="bg-white rounded-2xl shadow-sm border p-5 text-center"><div className="text-xl font-black text-pink-600">{formatRupiah(totalByJenis('donasi') + totalByJenis('cash'))}</div><div className="text-xs text-gray-500 font-semibold mt-1">Donasi</div></div>
          <div className="bg-white rounded-2xl shadow-sm border p-5 text-center"><div className="text-xl font-black text-purple-600">{formatRupiah(totalByJenis('sponsor') + totalByJenis('donatur'))}</div><div className="text-xs text-gray-500 font-semibold mt-1">Sponsor</div></div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('peserta')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${tab === 'peserta' ? 'bg-[#C1272D] text-white shadow' : 'bg-white text-gray-600 border'}`}>📝 Peserta ({participants.length})</button>
          <button onClick={() => setTab('keuangan')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${tab === 'keuangan' ? 'bg-gray-900 text-white shadow' : 'bg-white text-gray-600 border'}`}>💰 Keuangan ({keuanganList.length})</button>
          <button onClick={() => { shared.fetchParticipants(); shared.fetchKeuangan(); }} className="ml-auto px-4 py-2.5 rounded-xl text-sm font-bold bg-white border text-gray-600 hover:bg-gray-50">🔄 Refresh</button>
        </div>

        {tab === 'peserta' && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between border-b bg-gray-50/50">
              <input value={searchP} onChange={e => setSearchP(e.target.value)} placeholder="🔍 Cari peserta..." className="flex-1 border rounded-xl px-4 py-2.5 text-sm w-full sm:w-auto outline-none focus:ring-2 focus:ring-[#C1272D]/30" />
              <button onClick={() => setPesertaModal({ mode: 'add', data: { nama: '', telepon: '', rt: '', lomba: '', catatan: '' } })} className="text-xs font-bold px-4 py-2.5 bg-[#C1272D] text-white rounded-xl hover:bg-red-700 transition">+ Tambah Peserta</button>
            </div>
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-800 text-white"><tr>
                  <th className="px-3 py-3 text-left text-xs">No</th><th className="px-3 py-3 text-left text-xs">ID</th><th className="px-3 py-3 text-left text-xs">Nama</th><th className="px-3 py-3 text-left text-xs">Telepon</th><th className="px-3 py-3 text-left text-xs">RT</th><th className="px-3 py-3 text-left text-xs">Lomba</th><th className="px-3 py-3 text-left text-xs">Waktu</th><th className="px-3 py-3 text-center text-xs w-24">Aksi</th>
                </tr></thead>
                <tbody>
                  {filteredPeserta.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">Tidak ada data</td></tr> : filteredPeserta.map((p, i) => (
                    <tr key={p.id + i} className={`border-b hover:bg-red-50/40 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-3 py-2.5 text-xs text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2.5"><span className="font-mono text-[11px] font-bold text-[#C1272D] bg-red-50 px-1.5 py-0.5 rounded">{p.id}</span></td>
                      <td className="px-3 py-2.5 font-semibold">{p.name}</td>
                      <td className="px-3 py-2.5 text-xs font-mono">{p.hp}</td>
                      <td className="px-3 py-2.5 text-xs">{p.rt}</td>
                      <td className="px-3 py-2.5 text-xs max-w-[200px] truncate">{p.lomba.join(', ')}</td>
                      <td className="px-3 py-2.5 text-[11px] text-gray-400 whitespace-nowrap">{p.waktu}</td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => setPesertaModal({ mode: 'edit', data: { nama: p.name, telepon: p.hp, rt: p.rt, lomba: p.lomba.join(', '), catatan: p.catatan } })} className="text-[11px] px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100">✏️</button>
                          <button onClick={() => handleDeletePeserta(p)} className="text-[11px] px-2 py-1 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t text-[11px] text-gray-400">Total: <strong className="text-gray-600">{filteredPeserta.length}</strong> peserta — ↔ Sinkron dengan Tabel Real-Time</div>
          </div>
        )}

        {tab === 'keuangan' && (
          <div>
            {/* DB Error Banner */}
            {dbError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
                <span className="text-xl flex-shrink-0">❌</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-red-800">Supabase Error — Tabel Keuangan</div>
                  <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap break-all">{dbError}</pre>
                </div>
                <button onClick={() => setDbError('')} className="text-red-400 hover:text-red-600 text-lg flex-shrink-0">✕</button>
              </div>
            )}
            {/* Test Button */}
            <div className="flex gap-2 mb-4">
              <button onClick={testKeuanganTable} className="text-xs font-bold px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition">🔧 Test Koneksi Tabel Keuangan</button>
              <span className="text-[10px] text-gray-400 self-center">Klik untuk cek apakah tabel &apos;keuangan&apos; sudah dibuat di Supabase</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              {jenisOptions.map(o => (<div key={o.value} className={`${o.color} rounded-xl p-3 text-center`}><div className="text-xs font-bold opacity-70">{o.label}</div><div className="font-black text-lg mt-1">{formatRupiah(totalByJenis(o.value))}</div></div>))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between border-b bg-gray-50/50">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  <button onClick={() => setFilterJenis('semua')} className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${filterJenis === 'semua' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Semua</button>
                  {jenisOptions.map(o => <button key={o.value} onClick={() => setFilterJenis(o.value)} className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${filterJenis === o.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{o.label}</button>)}
                </div>
                <button onClick={() => setKeuanganModal({ mode: 'add', data: { nama: '', jenis: 'iuran', jumlah: 0, keterangan: '' } })} className="text-xs font-bold px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800">+ Tambah Dana</button>
              </div>
              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-800 text-white"><tr>
                    <th className="px-3 py-3 text-left text-xs">Jenis</th><th className="px-3 py-3 text-left text-xs">Nama</th><th className="px-3 py-3 text-right text-xs">Jumlah</th><th className="px-3 py-3 text-left text-xs">Keterangan</th><th className="px-3 py-3 text-left text-xs">Waktu</th><th className="px-3 py-3 text-center text-xs w-24">Aksi</th>
                  </tr></thead>
                  <tbody>
                    {filteredKeuangan.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Tidak ada data</td></tr> : filteredKeuangan.map((k, i) => (
                      <tr key={(k.id || '') + '' + i} className={`border-b hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-3 py-2.5"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getJenisStyle(k.jenis)}`}>{getJenisLabel(k.jenis)}</span></td>
                        <td className="px-3 py-2.5 font-semibold">{k.is_anon ? '🙈 Anonim' : k.nama}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-green-700">{formatRupiah(k.jumlah)}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-500 max-w-[200px] truncate">{k.keterangan || '-'}</td>
                        <td className="px-3 py-2.5 text-[11px] text-gray-400 whitespace-nowrap">{k.created_at ? new Date(k.created_at).toLocaleString('id-ID') : '-'}</td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => setKeuanganModal({ mode: 'edit', data: k })} className="text-[11px] px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100">✏️</button>
                            <button onClick={() => handleDeleteKeuangan(k)} className="text-[11px] px-2 py-1 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-sm">
                <span className="text-gray-500 text-[11px]">Total: <strong>{filteredKeuangan.length}</strong> — ↔ Sinkron Hero Dana</span>
                <span className="font-black text-green-700 text-lg">{formatRupiah(filteredKeuangan.reduce((s, k) => s + k.jumlah, 0))}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FORM MODALS — rendered conditionally, stable components */}
      {pesertaModal && <PesertaFormModal key="peserta-form" initial={pesertaModal.data} title={pesertaModal.mode === 'add' ? 'Tambah Peserta Baru' : 'Edit Peserta'} onSave={handleSavePeserta} onCancel={() => setPesertaModal(null)} />}
      {keuanganModal && <KeuanganFormModal key="keuangan-form" initial={keuanganModal.data} title={keuanganModal.mode === 'add' ? 'Tambah Data Keuangan' : 'Edit Data Keuangan'} onSave={handleSaveKeuangan} onCancel={() => setKeuanganModal(null)} />}
    </div>
  );
}
