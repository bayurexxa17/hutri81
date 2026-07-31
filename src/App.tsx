import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase, getSupabaseAdmin, setSupabaseConfig, getSupabaseConfig } from './utils/supabaseClient';
import GalleryPage from './components/GalleryPage';

interface Participant { id: string; name: string; rt: string; hp: string; lomba: string[]; catatan: string; waktu: string; createdAt: number; }
interface Donor { id: string; name: string; alamat: string; jumlah: number; pesan: string; waktu: string; isAnon: boolean; metode?: string; jenis?: string; }
interface Funding { id: string; sumber: string; jumlah: number; kategori: 'iuran'|'donasi'|'sponsor'|'donatur'|'kas'|'donasi_cash'|'donasi_online'; status: 'confirmed'|'pending'; metode: 'cash'|'transfer'|'qris'; jenis?: string; }
interface LombaItem { id: string; title: string; kategori: 'anak'|'ibu'|'bapak'|'remaja'|'keluarga'|'umum'; emoji: string; waktu: string; hadiah: string; peserta: string; deskripsi: string; }
interface GalleryItem { id: string; type: 'image'|'video'; src: string; title: string; credit?: string; thumb?: string; }
interface InventoryItem { id: string; nama: string; kategori: 'peralatan'|'aksesoris'|'dekorasi'|'sound'|'lainnya'; jumlah: number; kondisi: 'baik'|'rusak'|'hilang'; lokasi: string; penanggungJawab: string; }
interface CommentItem { id: string; galleryId: string; nama: string; pesan: string; waktu: string; }
interface ArchiveItem { tahun: number; tema: string; peserta: number; dana: number; lomba: number; deskripsi: string; }

const LOMBA_DATA: LombaItem[] = [
  { id: 'kerupuk', title: 'Lomba Makan Kerupuk', kategori: 'anak', emoji: '🍘', waktu: '08:00 WIB', hadiah: 'Menarik', peserta: 'Anak-anak', deskripsi: 'Peserta: Anak-anak. Peralatan: Kerupuk, Tali, Tiang gantungan. Cara Bermain: Kerupuk digantung menggunakan tali. Peserta berdiri tanpa menyentuh kerupuk menggunakan tangan. Tangan harus berada di belakang badan. Pemenang adalah peserta yang paling cepat menghabiskan kerupuk.' },
  { id: 'futsal', title: 'Futsal Mini', kategori: 'remaja', emoji: '⚽', waktu: '10:00 WIB', hadiah: 'Menarik', peserta: 'Tim 5 pemain', deskripsi: 'Peserta: Tim 5 pemain. Peraturan: Durasi pertandingan 2 x 10 menit. Sistem gugur. Tidak diperbolehkan bermain kasar. Keputusan wasit bersifat mutlak. Pemenang ditentukan dari jumlah gol terbanyak.' },
  { id: 'kelereng', title: 'Lomba Balap Kelereng', kategori: 'anak', emoji: '🔵', waktu: '08:30 WIB', hadiah: 'Menarik', peserta: 'Anak-anak', deskripsi: 'Peserta: Anak-anak. Peralatan: Sendok, Kelereng. Cara Bermain: Kelereng diletakkan di atas sendok. Sendok digigit menggunakan mulut. Tidak boleh dipegang tangan. Bila kelereng jatuh, peserta kembali ke titik awal. Peserta tercepat menjadi pemenang.' },
  { id: 'tambang', title: 'Lomba Tarik Tambang', kategori: 'bapak', emoji: '💪', waktu: '11:00 WIB', hadiah: 'Menarik', peserta: 'Dua tim', deskripsi: 'Peserta: Dua tim. Peraturan: Setiap tim memiliki jumlah peserta yang sama. Tim menarik tali hingga tanda tengah melewati garis kemenangan. Best of 3.' },
  { id: 'tumpeng', title: 'Lomba Hias Tumpeng', kategori: 'ibu', emoji: '🍛', waktu: '13:00 WIB', hadiah: 'Menarik', peserta: 'Ibu-ibu', deskripsi: 'Peserta: Ibu-ibu. Waktu maksimal 60 menit. Penilaian: Kreativitas, Kerapihan, Kebersihan, Keindahan penyajian, Kesesuaian tema Kemerdekaan, Kekompakan tim, Cita rasa (opsional apabila ada dewan juri). Peserta diperbolehkan menambah dekorasi maupun bahan makanan di luar anggaran pribadi selama tidak melanggar tema lomba.' },
  { id: 'daster', title: 'Lomba Fashion Week Daster', kategori: 'ibu', emoji: '👗', waktu: '13:00 WIB', hadiah: 'Menarik', peserta: 'Ibu-ibu', deskripsi: 'Peserta: Ibu-ibu. Cara Bermain: Mengenakan daster dengan gaya sekreatif mungkin. Berjalan di catwalk. Menampilkan pose terbaik. Boleh membawa properti sederhana. Penilaian: Kepercayaan diri, Kreativitas, Ekspresi, Penampilan, Interaksi dengan penonton.' },
  { id: 'sambung', title: 'Salah Sambung', kategori: 'remaja', emoji: '🗣️', waktu: '10:00 WIB', hadiah: 'Menarik', peserta: 'Bebas', deskripsi: 'Peserta: Bebas. Cara Bermain: MC menyebutkan awal kalimat. Peserta wajib melanjutkan dengan cepat. Jawaban salah atau terlalu lama dianggap gugur. Sistem eliminasi.' },
  { id: 'joget-bapak', title: 'Lomba Joget Kursi Bapak', kategori: 'bapak', emoji: '💃', waktu: '11:00 WIB', hadiah: 'Menarik', peserta: 'Bapak-bapak', deskripsi: 'Peserta: Bapak-bapak. Cara Bermain: Musik diputar. Peserta berjalan mengelilingi kursi. Saat musik berhenti peserta segera duduk. Peserta yang tidak mendapatkan kursi gugur. Kursi dikurangi setiap ronde.' },
  { id: 'penguin-anak', title: 'Lomba Estafet Penguin Anak', kategori: 'anak', emoji: '🐧', waktu: '08:30 WIB', hadiah: 'Menarik', peserta: 'Anak-anak berpasangan', deskripsi: 'Peserta: Anak-anak berpasangan. Cara Bermain: Bola dijepit di antara kedua lutut. Berjalan seperti penguin menuju garis finis. Bola tidak boleh dipegang tangan. Bila bola jatuh kembali ke titik sebelumnya. Tim tercepat menang.' },
  { id: 'penguin-remaja', title: 'Lomba Estafet Penguin Remaja', kategori: 'remaja', emoji: '🐧', waktu: '10:00 WIB', hadiah: 'Menarik', peserta: 'Remaja', deskripsi: 'Peserta: Remaja. Cara Bermain: Sama seperti Estafet Penguin Anak, namun jarak lintasan lebih panjang dan dilakukan secara estafet antar anggota tim.' },
  { id: 'tepung', title: 'Lomba Estafet Tepung', kategori: 'bapak', emoji: '🌾', waktu: '11:00 WIB', hadiah: 'Menarik', peserta: 'Tim', deskripsi: 'Peserta: Tim. Peralatan: Tepung, Gelas, Baskom. Cara Bermain: Peserta berbaris ke belakang. Tepung dipindahkan dari peserta pertama ke peserta terakhir melalui atas kepala. Tidak boleh melihat ke belakang. Tepung yang berhasil dikumpulkan paling banyak menjadi pemenang.' },
  { id: 'joget-ibu', title: 'Lomba Joget Kursi Ibu', kategori: 'ibu', emoji: '🪑', waktu: '13:00 WIB', hadiah: 'Menarik', peserta: 'Ibu-ibu', deskripsi: 'Peserta: Ibu-ibu. Cara Bermain: Sama seperti Joget Kursi Bapak. Penilaian berdasarkan ketahanan hingga babak final.' },
  { id: 'makeup', title: 'Lomba Make Up Buta', kategori: 'keluarga', emoji: '💄', waktu: '15:00 WIB', hadiah: 'Menarik', peserta: 'Berpasangan', deskripsi: 'Peserta: Berpasangan. Peralatan: Alat make up. Cara Bermain: Salah satu peserta ditutup matanya. Peserta tersebut merias wajah pasangannya. Tidak boleh membuka penutup mata. Waktu maksimal 10 menit.' },
];

const defaultParticipants: Participant[] = [
  { id: 'MWR81-0013', name: 'Rizki', rt: 'RT 02/blok mawar 102', hp: '08981234470', lomba: ['Lomba Joget Kursi Bapak'], catatan: 'Live join', waktu: '29/7/2026, 13:13:08', createdAt: Date.now()-60000 },
  { id: 'MWR81-0012', name: 'Indah', rt: 'RT/ mawar 102', hp: '08211234882', lomba: ['Lomba Joget Kursi Ibu','Lomba Estafet Tepung','Lomba Hias Tumpeng'], catatan: 'Live join', waktu: '29/7/2026, 13:12:00', createdAt: Date.now()-120000 },
  { id: 'MWR81-0011', name: 'Mam lala', rt: 'Mawar 83', hp: '08781234155', lomba: ['Lomba Joget Kursi Ibu'], catatan: 'Live join', waktu: '29/7/2026, 12:56:08', createdAt: Date.now()-300000 },
  { id: 'MWR81-0002', name: 'Ameera Hanania R', rt: 'RT 002 / Blok Mawar', hp: '081299176369', lomba: ['Fashion Week Daster','Estafet Penguin Anak'], catatan: 'Live join', waktu: '29/7/2026, 20:04:03', createdAt: Date.now()-800000 },
  { id: 'MWR81-0001', name: 'Fatimah Az Zahra', rt: 'RT 002 / Blok Mawar', hp: '081234567890', lomba: ['Makan Kerupuk','Balap Kelereng'], catatan: 'Live join', waktu: '29/7/2026, 20:04:03', createdAt: Date.now()-900000 },
];

const defaultFunding: Funding[] = [
  { id: 'f1', sumber: 'Iuran Warga 50K/KK x 200 KK', jumlah: 10000000, kategori: 'iuran', status: 'confirmed', metode: 'cash', jenis: 'iuran warga' },
  { id: 'f2', sumber: 'Donasi Warga via DANA/SeaBank', jumlah: 5000000, kategori: 'donasi_online', status: 'confirmed', metode: 'transfer', jenis: 'donasi online' },
  { id: 'f3', sumber: 'Sponsor UMKM Lokal', jumlah: 3000000, kategori: 'sponsor', status: 'confirmed', metode: 'transfer', jenis: 'sponsor' },
  { id: 'f4', sumber: 'Kas RT 002', jumlah: 1000000, kategori: 'kas', status: 'confirmed', metode: 'cash', jenis: 'kas' },
  { id: 'f5', sumber: 'Donasi Cash Warga', jumlah: 2000000, kategori: 'donasi_cash', status: 'confirmed', metode: 'cash', jenis: 'donasi cash' },
  { id: 'f6', sumber: 'Donatur Hamba Allah', jumlah: 1500000, kategori: 'donatur', status: 'confirmed', metode: 'qris', jenis: 'donatur' },
];

const PANITIA_USERS = [
  { username: 'admin', password: 'mawar81', nama: 'Administrator', role: 'admin' },
  { username: 'eka', password: 'pj2026!', nama: 'Eka Rista Y (PJ)', role: 'pj' },
  { username: 'bayu', password: 'ketua2026!', nama: 'Bayu S.Permana (Ketua)', role: 'ketua' },
  { username: 'aulia', password: 'bendahara2026!', nama: 'Aulia Komari (Bendahara)', role: 'bendahara' },
  { username: 'sugiono', password: 'wakil2026!', nama: 'Sugiono (Wakil)', role: 'wakil' },
  { username: 'lani', password: 'sekretaris2026!', nama: 'Lani (Sekretaris)', role: 'sekretaris' },
  { username: 'puput', password: 'bendahara2!', nama: 'Puput (Bendahara 2)', role: 'bendahara2' },
];
const OWNER_USERS = [
  { username: 'owner', password: 'owner81', nama: 'Owner', role: 'owner' },
  { username: 'superadmin', password: 'super2026!', nama: 'Super Admin', role: 'owner' },
];

const PANITIA_DATA = [
  { jabatan: 'Ketua Pembina', nama: 'IPTU Saharudin' },
  { jabatan: 'Ketua Penasehat', nama: 'Syamsul Piliano' },
  { jabatan: 'Penanggung Jawab', nama: 'Eka Rista Y (0821-7129-9984)' },
  { jabatan: 'Ketua Panitia', nama: 'Bayu S.Permana (0812-8839-5550)' },
  { jabatan: 'Wakil Ketua', nama: 'Sugiono (0831-8395-0205)' },
  { jabatan: 'Sekretaris', nama: 'Lani (0813-7116-2792)' },
  { jabatan: 'Bendahara I', nama: 'Aulia Komari (0812-3456-7892)' },
  { jabatan: 'Bendahara II', nama: 'Puput (0831-8330-3884)' },
];

const ANGGARAN_DATA = [
  { komponen: 'Total Anggaran — Pesta Rakyat (17 Agt)', jumlah: 10000000, detail: 'pesta-rakyat' },
  { komponen: 'Total Anggaran — Malam Puncak (22 Agt Malam)', jumlah: 7000000, detail: 'malam-puncak' },
  { komponen: 'TOTAL KEBUTUHAN ANGGARAN', jumlah: 17000000, total: true },
  { komponen: 'Total Dana Masuk (Pendanaan)', jumlah: 19000000, masuk: true, detail: 'dana-masuk' },
  { komponen: 'SELISIH (Dana Masuk - Kebutuhan)', jumlah: 2000000, selisih: true },
];

const ANGGARAN_DETAIL: any = {
  'pesta-rakyat': { title: 'Rincian Pesta Rakyat 17 Agt (10jt)', items: [{ nama: 'Hadiah Lomba', qty: '13 kategori', harga: 5000000 }, { nama: 'Konsumsi', qty: '200 pax', harga: 3000000 }]},
  'malam-puncak': { title: 'Rincian Malam Puncak (7jt)', items: [{ nama: 'Panggung', qty: '1 set', harga: 3000000 }, { nama: 'Hadiah Utama', qty: '1 paket', harga: 2500000 }]},
  'dana-masuk': { title: 'Rincian Dana Masuk (19jt)', items: [{ nama: 'Iuran Warga', qty: '200', harga: 10000000 }, { nama: 'Donasi', qty: 'realtime', harga: 5000000 }]},
};

const RUNDOWN = [
  { jam: '06:00', kegiatan: '📋 Persiapan Lokasi & Registrasi Peserta (Panitia & Peserta)', group: 'PAGI & PERLOMBAAN' },
  { jam: '07:00', kegiatan: '🇮🇩 Upacara Bendera & Pembukaan Resmi (Seluruh Warga)', group: 'PAGI & PERLOMBAAN' },
  { jam: '07:00', kegiatan: '🎤 Sambutan Ketua RT & Ketua Panitia (Undangan)', group: 'PAGI & PERLOMBAAN' },
  { jam: '08:30', kegiatan: '👶 Lomba Anak-anak (Makan Kerupuk, Balap Kelereng, Estafet Penguin) (Usia 5-15 tahun)', group: 'PAGI & PERLOMBAAN' },
  { jam: '10:00', kegiatan: '🧑 Lomba Remaja (Futsal Mini, Salah Sambung, Estafet Penguin) (Usia 13-17 tahun)', group: 'PAGI & PERLOMBAAN' },
  { jam: '11:00', kegiatan: '🪢 Lomba Bapak-bapak (Tarik Tambang, Joget Kursi, Estafet Tepung) (Bapak-bapak)', group: 'PAGI & PERLOMBAAN' },
  { jam: '12:00', kegiatan: '🍛 Istirahat, Sholat & Makan Siang (Seluruh Warga)', group: 'PAGI & PERLOMBAAN' },
  { jam: '13:00', kegiatan: '👗 Lomba Ibu-ibu (Hias Tumpeng, Fashion Daster, Joget Kursi) (Ibu-ibu)', group: 'PAGI & PERLOMBAAN' },
  { jam: '15:00', kegiatan: '👨‍👩‍👧 Lomba Keluarga (Make Up Buta) (Pasangan)', group: 'PAGI & PERLOMBAAN' },
  { jam: '16:00', kegiatan: '✅ Penutupan Perlombaan & Persiapan Malam Puncak', group: 'PAGI & PERLOMBAAN' },
  { jam: '19:00', kegiatan: '🎊 Pembukaan Malam Puncak (MC & Panitia)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '19:30', kegiatan: '🎶 Hiburan Rakyat & Pentas Seni (Warga)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '20:00', kegiatan: '🏆 Pengumuman Pemenang & Penyerahan Hadiah (Seluruh Warga)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '20:30', kegiatan: '🍱 Penilaian Hias Tumpeng (Peserta Ibu-ibu)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '21:00', kegiatan: '🎁 Doorprize (Seluruh Warga)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '21:30', kegiatan: '🙏 Sambutan Penutup & Doa Bersama (Ketua RT)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '22:00', kegiatan: '🏁 Penutupan Acara & Ramah Tamah (Seluruh Warga)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
];

const DEFAULT_GALLERY: any[] = [
  { id: 'g1', type: 'image', src: '/images/20260726_091521.jpg', title: 'Panjat Pinang — Lomba Tradisional 17 Agustus', credit: 'Dokumentasi Warga Blok Mawar' },
  { id: 'g2', type: 'image', src: 'https://images.pexels.com/photos/33807994/pexels-photo-33807994.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Perayaan Kemerdekaan — Kirab Bendera', credit: 'Rakhmat Suwandi / Pexels' },
  { id: 'g3', type: 'image', src: 'https://images.pexels.com/photos/35161342/pexels-photo-35161342.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Upacara Bendera Merah Putih', credit: 'Tommy Kurniawan / Pexels' },
  { id: 'v1', type: 'video', src: 'https://videos.pexels.com/video-files/34373272/14563035_1920_1080_30fps.mp4', title: 'Karnaval 17 Agustus — Parade Desa', credit: 'just a hobby / Pexels' },
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'inv1', nama: 'Tenda Terpal 3x3', kategori: 'peralatan', jumlah: 5, kondisi: 'baik', lokasi: 'Gudang RT', penanggungJawab: 'Sugiono' },
  { id: 'inv2', nama: 'Sound System + Mic', kategori: 'sound', jumlah: 1, kondisi: 'baik', lokasi: 'Rumah Ketua', penanggungJawab: 'Bayu' },
  { id: 'inv3', nama: 'Bendera Merah Putih Besar', kategori: 'dekorasi', jumlah: 10, kondisi: 'baik', lokasi: 'Gudang', penanggungJawab: 'Lani' },
  { id: 'inv4', nama: 'Kursi Plastik', kategori: 'peralatan', jumlah: 50, kondisi: 'baik', lokasi: 'Balai Warga', penanggungJawab: 'Eka' },
  { id: 'inv5', nama: 'Kostum Daster Fashion Show', kategori: 'aksesoris', jumlah: 15, kondisi: 'baik', lokasi: 'Rumah Aulia', penanggungJawab: 'Aulia' },
];

function formatRupiah(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n); }
function maskHp(hp: string) { if (!hp || hp.length < 7) return hp; return hp.slice(0,4)+'****'+hp.slice(-3); }

export default function App() {
  const [countdown, setCountdown] = useState({ hari: 18, jam: 13, menit: 38, detik: 51 });
  useEffect(()=>{ const target=new Date('2026-08-17T06:00:00').getTime(); const t=setInterval(()=>{ const diff=target-Date.now(); if(diff<=0){ setCountdown({hari:0,jam:0,menit:0,detik:0}); return; } setCountdown({hari:Math.floor(diff/(1000*60*60*24)),jam:Math.floor((diff/(1000*60*60))%24),menit:Math.floor((diff/(1000*60))%60),detik:Math.floor((diff/1000)%60)}); },1000); return()=>clearInterval(t); },[]);

  const [participants, setParticipants] = useState<Participant[]>(()=>{ try{ const s=localStorage.getItem('hutri-participants-mawar'); if(s){ const p=JSON.parse(s); if(Array.isArray(p)) return p; } }catch{} return []; });
  const [donors, setDonors] = useState<Donor[]>(()=>{ try{ const s=localStorage.getItem('hutri-donors-mawar'); if(s){ const p=JSON.parse(s); if(Array.isArray(p)) return p; } }catch{} return []; });
  const [funding, setFunding] = useState<Funding[]>(()=>{ try{ const s=localStorage.getItem('hutri-funding-mawar'); if(s){ const p=JSON.parse(s); if(Array.isArray(p)) return p; } }catch{} return []; });
  const [transaksi, setTransaksi] = useState<any[]>(()=>{ try{ const s=localStorage.getItem('hutri-transaksi'); if(s){ const p=JSON.parse(s); if(Array.isArray(p)) return p; } }catch{} return []; });
  const [iuranRows, setIuranRows] = useState<any[]>([]);
  const [donasiRowsRaw, setDonasiRowsRaw] = useState<any[]>([]);
  const [donasiCashRows, setDonasiCashRows] = useState<any[]>([]);
  const [donasiOnlineRows, setDonasiOnlineRows] = useState<any[]>([]);
  const [sponsorRows, setSponsorRows] = useState<any[]>([]);
  const [keuanganRowsRaw, setKeuanganRowsRaw] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>(()=>{ try{ const s=localStorage.getItem('hutri-gallery'); if(s) return JSON.parse(s); }catch{} return DEFAULT_GALLERY; });
  const [inventory, setInventory] = useState<InventoryItem[]>(()=>{ try{ const s=localStorage.getItem('hutri-inventory'); if(s){ const p=JSON.parse(s); if(Array.isArray(p)) return p; } }catch{} return []; });
  const [comments, setComments] = useState<CommentItem[]>(()=>{ try{ const s=localStorage.getItem('hutri-comments'); if(s){ const p=JSON.parse(s); if(Array.isArray(p)) return p; } }catch{} return []; });
  const [archive, setArchive] = useState<ArchiveItem[]>(()=>{ try{ const s=localStorage.getItem('hutri-archive'); if(s) return JSON.parse(s); }catch{} return [
    { tahun: 2024, tema: 'Semarak Kemerdekaan 79', peserta: 85, dana: 15000000, lomba: 10, deskripsi: 'Perayaan HUT RI ke-79 dengan lomba tradisional' },
    { tahun: 2025, tema: 'Bersatu dalam Keberagaman', peserta: 120, dana: 17500000, lomba: 12, deskripsi: 'HUT RI ke-80 dimeriahkan Karnaval Budaya' },
    { tahun: 2026, tema: 'Blok Mawar Bersatu — HUT RI ke-81', peserta: 13, dana: 19000000, lomba: 13, deskripsi: 'HUT RI ke-81 dengan 13 lomba dan total hadiah jutaan' },
  ]; });

  const [search, setSearch] = useState(''); const [filterLomba, setFilterLomba] = useState('Semua'); const [filterRT, setFilterRT] = useState('Semua'); const [filterKategori, setFilterKategori] = useState('Semua');
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('id-ID')); const [live, setLive] = useState(true); const [highlightId, setHighlightId] = useState<string|null>(null);
  const [showRegister, setShowRegister] = useState(false); const [showDetail, setShowDetail] = useState<string|null>(null); const [showLomba, setShowLomba] = useState<LombaItem|null>(null);
  const [formData, setFormData] = useState({ name:'', rt:'', hp:'', lomba:[] as string[], catatan:'' });
  const [donasiForm, setDonasiForm] = useState({ name:'', alamat:'', jumlah:'', pesan:'', isAnon:false });
  const [showPanitiaLogin, setShowPanitiaLogin] = useState(false); const [loginUsername, setLoginUsername] = useState(''); const [loginPassword, setLoginPassword] = useState('');
  const [isPanitia, setIsPanitia] = useState(()=>{ try{ return localStorage.getItem('isPanitia')==='true'; }catch{ return false; } });
  const [isOwner, setIsOwner] = useState(()=>{ try{ return localStorage.getItem('isOwner')==='true'; }catch{ return false; } });
  const [currentUser, setCurrentUser] = useState<any>(()=>{ try{ const s=localStorage.getItem('currentUser'); if(s) return JSON.parse(s); }catch{} return null; });
  const [showWA, setShowWA] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(DEFAULT_GALLERY.find((g:any)=>g.type==='video')||null);
  const [adminTab, setAdminTab] = useState<'overview'|'peserta'|'keuangan'|'pengeluaran'|'donasi'|'gallery'|'supabase'|'inventory'>('overview');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(getSupabaseConfig().url);
  const [supabaseStatus, setSupabaseStatus] = useState<'idle'|'testing'|'ok'|'fail'>('idle');
  const [editParticipant, setEditParticipant] = useState<Participant|null>(null);
  const [newFunding, setNewFunding] = useState({ sumber:'', jumlah:'', kategori:'iuran' as any, metode:'cash' as any });
  const [cashDonasi, setCashDonasi] = useState({ nama:'', jumlah:'', metode:'cash' as any });
  const [galleryZoom, setGalleryZoom] = useState<any|null>(null);
  const [galleryFilter, setGalleryFilter] = useState<'semua'|'foto'|'video'>('semua');
  const [showGalleryPage, setShowGalleryPage] = useState(false);
  const [showInventoryPage, setShowInventoryPage] = useState(false);
  const [showArchivePage, setShowArchivePage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrisCustom, setQrisCustom] = useState<string|null>(()=>{ try{ return localStorage.getItem('qris-custom-image'); }catch{ return null; } });
  const [newInventory, setNewInventory] = useState({ nama:'', kategori:'peralatan' as any, jumlah:'', kondisi:'baik' as any, lokasi:'', penanggungJawab:'' });
  const [commentForm, setCommentForm] = useState({ galleryId:'', nama:'', pesan:'' });
  const [pengeluaran, setPengeluaran] = useState<any[]>(()=>{ try{ const s=localStorage.getItem('hutri-pengeluaran'); if(s) return JSON.parse(s); }catch{} return [
    { id:'OUT-001', nama:'Pembelian Hadiah Lomba', kategori:'hadiah', jumlah:5000000, metode:'transfer', penerima:'Toko Maju Jaya', waktu:new Date().toLocaleString('id-ID'), catatan:'Hadiah juara 1,2,3 semua lomba' },
    { id:'OUT-002', nama:'Sewa Sound System', kategori:'jasa', jumlah:1500000, metode:'cash', penerima:'DJ音响 Rental', waktu:new Date().toLocaleString('id-ID'), catatan:'Sound + mic wireless 1 hari' },
  ]; });
  const [newPengeluaran, setNewPengeluaran] = useState({ nama:'', kategori:'hadiah' as any, jumlah:'', metode:'cash' as any, penerima:'', catatan:'' });
  const [sponsorSlideIdx, setSponsorSlideIdx] = useState(0);
  const [sponsors, setSponsors] = useState<any[]>(()=>{ try{ const s=localStorage.getItem('hutri-sponsors'); if(s) return JSON.parse(s); }catch{} return [
    { id:'SP001', nama:'Toko Berkah Mawar', deskripsi:'Sponsor utama — sembako & hadiah', logo:'', website:'tokobekah-mawar.com' },
    { id:'SP002', nama:'Bengkel Sukses Motor', deskripsi:'Sponsor doorprize — servis motor 1 tahun', logo:'', website:'sukses-motor.id' },
    { id:'SP003', nama:'Warung Bu RT', deskripsi:'Konsumsi panitia & peserta lomba', logo:'🍱', website:'-' },
    { id:'SP004', nama:'Apotek Sehat Sentosa', deskripsi:'P3K & obat-obatan acara', logo:'💊', website:'sehat-sentosa.com' },
  ]; });
  const [newSponsor, setNewSponsor] = useState({ nama:'', deskripsi:'', logo:'🏪', website:'' });
  const editParticipantRef = useRef<Participant|null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ localStorage.setItem('hutri-participants-mawar', JSON.stringify(participants)); setLastUpdate(new Date().toLocaleTimeString('id-ID')); },[participants]);
  useEffect(()=>{ localStorage.setItem('hutri-donors-mawar', JSON.stringify(donors)); },[donors]);
  useEffect(()=>{ localStorage.setItem('hutri-funding-mawar', JSON.stringify(funding)); },[funding]);
  useEffect(()=>{ localStorage.setItem('hutri-transaksi', JSON.stringify(transaksi)); },[transaksi]);
  useEffect(()=>{ localStorage.setItem('hutri-gallery', JSON.stringify(gallery)); },[gallery]);
  useEffect(()=>{ localStorage.setItem('hutri-inventory', JSON.stringify(inventory)); },[inventory]);
  useEffect(()=>{ localStorage.setItem('hutri-comments', JSON.stringify(comments)); },[comments]);
  useEffect(()=>{ localStorage.setItem('hutri-archive', JSON.stringify(archive)); },[archive]);
  useEffect(()=>{ localStorage.setItem('hutri-pengeluaran', JSON.stringify(pengeluaran)); },[pengeluaran]);
  useEffect(()=>{ localStorage.setItem('hutri-sponsors', JSON.stringify(sponsors)); },[sponsors]);
  useEffect(()=>{ const t = setInterval(()=>setSponsorSlideIdx(prev=>(prev+1)%Math.max(1,sponsors.length)), 4000); return ()=>clearInterval(t); },[sponsors.length]);

  const savePengeluaran = async () => {
    if(!newPengeluaran.nama||!newPengeluaran.jumlah){ alert('Lengkapi nama & jumlah'); return; }
    const ne:any = { id:`OUT-${Date.now()}`, nama:newPengeluaran.nama, kategori:newPengeluaran.kategori, jumlah:Number(newPengeluaran.jumlah), metode:newPengeluaran.metode, penerima:newPengeluaran.penerima||'-', catatan:newPengeluaran.catatan||'', waktu:new Date().toLocaleString('id-ID') };
    setPengeluaran(prev=>[ne, ...prev]);
    // juga masuk ke transaksi realtime sebagai pengeluaran
    setTransaksi(prev=>[{ id:`TRX-${Date.now()}`, metode:ne.metode==='cash'?'qris-dana':'transfer-seabank', nama:ne.nama, jumlah:-ne.jumlah, waktu:ne.waktu, status:'pengeluaran', sumber:ne.penerima||ne.kategori }, ...prev]);
    setNewPengeluaran({ nama:'', kategori:'hadiah', jumlah:'', metode:'cash', penerima:'', catatan:'' });
  };
  const saveSponsor = async () => {
    if(!newSponsor.nama){ alert('Lengkapi nama sponsor'); return; }
    const ns:any = { id:`SP-${Date.now()}`, nama:newSponsor.nama, deskripsi:newSponsor.deskripsi, logo:newSponsor.logo||'🏪', website:newSponsor.website };
    setSponsors(prev=>[ns, ...prev]);
    setNewSponsor({ nama:'', deskripsi:'', logo:'🏪', website:'' });
  };
  useEffect(()=>{ try{ localStorage.setItem('isPanitia', String(isPanitia)); }catch{} },[isPanitia]);
  useEffect(()=>{ try{ localStorage.setItem('isOwner', String(isOwner)); }catch{} },[isOwner]);
  useEffect(()=>{ if(currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser)); },[currentUser]);
  useEffect(()=>{ editParticipantRef.current = editParticipant; },[editParticipant]);
  useEffect(()=>{ if(qrisCustom) try{ localStorage.setItem('qris-custom-image', qrisCustom); }catch{} },[qrisCustom]);

  useEffect(()=>{
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('hutri-sync');
      bc.onmessage = (ev)=>{
        const msg = ev.data;
        if (msg?.type==='new-peserta' && msg.data) {
          const np = msg.data as Participant;
          setParticipants(prev=>{ if(prev.some(p=>p.id===np.id)) return prev; setHighlightId(np.id); setTimeout(()=>setHighlightId(null),4000); return [np, ...prev]; });
        }
        if (msg?.type==='new-komentar' && msg.data) {
          setComments(prev=> prev.some(c=>c.id===msg.data.id) ? prev : [msg.data, ...prev]);
        }
      };
    } catch {}
    return ()=>{ try{ bc?.close(); }catch{} };
  },[]);

  // Supabase sync utama: gunakan tabel Supabase sebagai sumber data utama
  useEffect(()=>{
    let channels: any[] = [];
    const admin = getSupabaseAdmin();

    const fetchTable = async (table: string) => {
      try {
        let res = await admin.from(table).select('*').order('created_at', { ascending: false }).limit(500);
        if (res.error) {
          // beberapa tabel user tidak punya created_at -> coba tanpa order
          res = await admin.from(table).select('*').limit(500);
        }
        if (res.error) throw res.error;
        return res.data || [];
      } catch (e) {
        console.warn('table skip', table, e);
        return [];
      }
    };

    const loadAllFromSupabase = async () => {
      try {
        const pesertaRows = await fetchTable('pendaftar');
        const mappedPeserta: Participant[] = pesertaRows.map((d:any, i:number)=>({
          id: d.id?.toString().startsWith('MWR') ? d.id : `MWR81-${String(i+1).padStart(4,'0')}`,
          name: d.nama || d.name || 'Tanpa Nama',
          rt: d.rt || '',
          hp: d.telepon || d.hp || '-',
          lomba: typeof d.lomba==='string' ? d.lomba.split(',').map((x:string)=>x.trim()).filter(Boolean) : Array.isArray(d.lomba) ? d.lomba : [],
          catatan: d.catatan || 'Live join',
          waktu: d.created_at ? new Date(d.created_at).toLocaleString('id-ID') : new Date().toLocaleString('id-ID'),
          createdAt: d.created_at ? new Date(d.created_at).getTime() : Date.now(),
        }));
        setParticipants(mappedPeserta);

        const [donasiRows, donasiCashRowsData, donasiOnlineRowsData, iuranRowsData, sponsorRowsData, keuanganRows, inventoryRows, commentRows] = await Promise.all([
          fetchTable('donasi'),
          fetchTable('donasi cash'),
          fetchTable('donasi online'),
          fetchTable('iuran warga'),
          fetchTable('sponsor'),
          fetchTable('keuangan'),
          fetchTable('inventory'),
          fetchTable('komentar galeri'),
        ]);

        // raw states per tabel supabase agar blok transaksi realtime sinkron persis dengan tabel database
        setIuranRows(iuranRowsData);
        setDonasiRowsRaw(donasiRows);
        setDonasiCashRows(donasiCashRowsData);
        setDonasiOnlineRows(donasiOnlineRowsData);
        setSponsorRows(sponsorRowsData);
        setKeuanganRowsRaw(keuanganRows);

        const mappedDonors: Donor[] = [
          ...donasiRows.map((d:any)=>({ id:`don-${d.id}`, name:d.nama||'Donatur', alamat:d.alamat||'-', jumlah:Number(d.jumlah)||0, pesan:d.pesan||'', waktu:d.created_at?new Date(d.created_at).toLocaleString('id-ID'):new Date().toLocaleString('id-ID'), isAnon:!!d.is_anon, metode:'donasi', jenis:'donasi' })),
          ...donasiCashRows.map((d:any)=>({ id:`dc-${d.id}`, name:d.nama||'Donatur Cash', alamat:d.alamat||'Cash', jumlah:Number(d.jumlah)||0, pesan:d.keterangan||d.pesan||'Donasi Cash', waktu:d.created_at?new Date(d.created_at).toLocaleString('id-ID'):new Date().toLocaleString('id-ID'), isAnon:!!d.is_anon, metode:'cash', jenis:'donasi cash' })),
          ...donasiOnlineRows.map((d:any)=>({ id:`do-${d.id}`, name:d.nama||'Donatur Online', alamat:d.alamat||'Transfer/QRIS', jumlah:Number(d.jumlah)||0, pesan:d.keterangan||d.pesan||'Donasi Online', waktu:d.created_at?new Date(d.created_at).toLocaleString('id-ID'):new Date().toLocaleString('id-ID'), isAnon:!!d.is_anon, metode:'online', jenis:'donasi online' })),
        ];
        setDonors(mappedDonors);

        const mappedFunding: Funding[] = [
          ...iuranRows.map((f:any)=>({ id:`iuran-${f.id}`, sumber:f.nama||f.sumber||'Iuran Warga', jumlah:Number(f.jumlah)||0, kategori:'iuran' as const, status:'confirmed' as const, metode:'cash' as const, jenis:'iuran warga' })),
          ...sponsorRows.map((f:any)=>({ id:`sponsor-${f.id}`, sumber:f.nama||f.sumber||'Sponsor', jumlah:Number(f.jumlah)||0, kategori:'sponsor' as const, status:'confirmed' as const, metode:'transfer' as const, jenis:'sponsor' })),
          ...keuanganRows.map((f:any)=>({
            id:`keu-${f.id}`,
            sumber:f.nama||f.sumber||'Keuangan',
            jumlah:Number(f.jumlah)||0,
            kategori:(String(f.jenis||'').toLowerCase().includes('iuran')?'iuran':String(f.jenis||'').toLowerCase().includes('sponsor')?'sponsor':String(f.jenis||'').toLowerCase().includes('donatur')?'donatur':String(f.jenis||'').toLowerCase().includes('online')?'donasi_online':String(f.jenis||'').toLowerCase().includes('cash')?'donasi_cash':String(f.jenis||'').toLowerCase().includes('donasi')?'donasi':'kas') as any,
            status:'confirmed' as const,
            metode:(String(f.keterangan||'').toLowerCase().includes('qris')?'qris':String(f.keterangan||'').toLowerCase().includes('transfer')?'transfer':'cash') as any,
            jenis:f.jenis||'keuangan',
          })),
        ];
        setFunding(mappedFunding);

        const mappedTransaksi = [
          ...mappedFunding.map((f:any)=>({ id:`trx-f-${f.id}`, metode:f.metode==='qris'?'qris-dana':f.metode==='transfer'?'transfer-seabank':'transfer-dana', nama:f.sumber, jumlah:f.jumlah, waktu:new Date().toLocaleString('id-ID'), status:'success', sumber:f.jenis||f.sumber })),
          ...mappedDonors.map((d:any)=>({ id:`trx-d-${d.id}`, metode:d.metode==='cash'?'qris-dana':d.metode==='online'?'transfer-seabank':'qris-dana', nama:d.name, jumlah:d.jumlah, waktu:d.waktu, status:'success', sumber:d.jenis||d.alamat })),
          ...pengeluaran.map((p:any)=>({ id:`trx-o-${p.id}`, metode:p.metode==='qris'?'qris-dana':p.metode==='transfer'?'transfer-seabank':'transfer-dana', nama:p.nama, jumlah:-Math.abs(Number(p.jumlah)||0), waktu:p.waktu, status:'pengeluaran', sumber:p.kategori||p.penerima })),
        ];
        setTransaksi(mappedTransaksi);

        if (inventoryRows.length) {
          setInventory(inventoryRows.map((i:any)=>({ id:i.id, nama:i.nama, kategori:i.kategori||'peralatan', jumlah:Number(i.jumlah)||0, kondisi:i.kondisi||'baik', lokasi:i.lokasi||'-', penanggungJawab:i.penanggung_jawab||i.penanggungJawab||'-' })));
        }
        if (commentRows.length) {
          setComments(commentRows.map((c:any)=>({ id:c.id, galleryId:c.gallery_id||'umum', nama:c.nama||'Warga', pesan:c.pesan||'', waktu:c.created_at?new Date(c.created_at).toLocaleString('id-ID'):new Date().toLocaleString('id-ID') })));
        }
      } catch (e) {
        console.warn('Supabase sync gagal, cek URL/API/table', e);
      }
    };

    loadAllFromSupabase();

    const subscribe = (table:string) => {
      try {
        const ch = supabase.channel(`rt-${table}-${Math.random()}`)
          .on('postgres_changes',{event:'*', schema:'public', table},()=>{
            loadAllFromSupabase();
            setLastUpdate(new Date().toLocaleTimeString('id-ID'));
          })
          .subscribe();
        channels.push(ch);
      } catch (e) {
        console.warn('channel fail', table, e);
      }
    };

    ['pendaftar','donasi','donasi cash','donasi online','iuran warga','sponsor','keuangan','inventory','komentar galeri'].forEach(subscribe);

    return ()=>{
      channels.forEach(ch=>{ try{ supabase.removeChannel(ch); }catch{} });
    };
  },[pengeluaran]);

  useEffect(()=>{ if(!live) return; const iv=setInterval(()=>setLastUpdate(new Date().toLocaleTimeString('id-ID')),4000); return()=>clearInterval(iv); },[live]);

  const totalDana = useMemo(()=>{
    return funding.reduce((sum,f)=>sum+Number(f.jumlah||0),0) + donors.reduce((sum,d)=>sum+Number(d.jumlah||0),0);
  },[funding,donors]);

  // Sumber data utama untuk blok Transaksi Realtime: RAW Supabase, dipisah CASH vs TRANSFER
  const methodOf = (row:any) => {
    const txt = `${row.metode||''} ${row.keterangan||''} ${row.sumber||''} ${row.alamat||''}`.toLowerCase();
    if (txt.includes('transfer') || txt.includes('seabank') || txt.includes('bank') || txt.includes('qris') || txt.includes('online') || txt.includes('dana')) return 'transfer';
    return 'cash';
  };

  const cashEntries = useMemo(()=>{
    const fromKeuanganCash = keuanganRowsRaw
      .filter((k:any)=>methodOf(k)==='cash' && !String(k.jenis||'').toLowerCase().includes('pengeluaran'))
      .map((k:any)=>({ id:`kw-c-${k.id}`, nama:k.nama||'Cash', jumlah:Number(k.jumlah||0), sumber:k.keterangan||'cash', waktu:k.created_at||'', jenis:k.jenis||'cash' }));
    if (fromKeuanganCash.length > 0) return fromKeuanganCash;
    return [
      ...iuranRows.map((r:any)=>({ id:`iw-${r.id}`, nama:r.nama||r.sumber||'Cash', jumlah:Number(r.jumlah||0), sumber:r.keterangan||'cash', waktu:r.created_at||'', jenis:'iuran' })),
      ...donasiCashRows.map((r:any)=>({ id:`dc-${r.id}`, nama:r.nama||'Donatur Cash', jumlah:Number(r.jumlah||0), sumber:r.keterangan||'cash', waktu:r.created_at||'', jenis:'donasi cash' })),
    ];
  },[iuranRows, donasiCashRows, keuanganRowsRaw]);

  const transferEntries = useMemo(()=>{
    const fromKeuanganTransfer = keuanganRowsRaw
      .filter((k:any)=>methodOf(k)==='transfer' && !String(k.jenis||'').toLowerCase().includes('pengeluaran'))
      .map((k:any)=>({ id:`kw-t-${k.id}`, nama:k.nama||'Transfer', jumlah:Number(k.jumlah||0), sumber:k.keterangan||'transfer', waktu:k.created_at||'', jenis:k.jenis||'transfer' }));
    if (fromKeuanganTransfer.length > 0) return fromKeuanganTransfer;
    return [
      ...donasiOnlineRows.map((r:any)=>({ id:`do-${r.id}`, nama:r.nama||'Transfer', jumlah:Number(r.jumlah||0), sumber:r.keterangan||'transfer', waktu:r.created_at||'', jenis:'donasi online' })),
      ...sponsorRows.map((r:any)=>({ id:`sp-t-${r.id}`, nama:r.nama||'Sponsor', jumlah:Number(r.jumlah||0), sumber:r.keterangan||'transfer', waktu:r.created_at||'', jenis:'sponsor' })),
    ];
  },[donasiOnlineRows, sponsorRows, keuanganRowsRaw]);

  const iuranEntries = useMemo(()=>{
    if (iuranRows.length > 0) return iuranRows.map((r:any)=>({ id:`iw-${r.id}`, nama:r.nama||r.sumber||'Iuran Warga', jumlah:Number(r.jumlah||0), sumber:r.keterangan||'iuran warga', waktu:r.created_at||'' }));
    return keuanganRowsRaw.filter((k:any)=>String(k.jenis||'').toLowerCase().includes('iuran')).map((k:any)=>({ id:`kw-i-${k.id}`, nama:k.nama||'Iuran Warga', jumlah:Number(k.jumlah)||0, sumber:k.keterangan||'iuran warga', waktu:k.created_at||'' }));
  },[iuranRows, keuanganRowsRaw]);

  const donaturEntries = useMemo(()=>{
    if (donasiCashRows.length > 0) return donasiCashRows.map((r:any)=>({ id:`dc-${r.id}`, nama:r.nama||'Donatur Cash', jumlah:Number(r.jumlah||0), sumber:r.keterangan||'donatur', waktu:r.created_at||'' }));
    return keuanganRowsRaw.filter((k:any)=>String(k.jenis||'').toLowerCase().includes('donatur')).map((k:any)=>({ id:`kw-dt-${k.id}`, nama:k.nama||'Donatur', jumlah:Number(k.jumlah)||0, sumber:k.keterangan||'donatur', waktu:k.created_at||'' }));
  },[donasiCashRows, keuanganRowsRaw]);

  const sponsorEntries = useMemo(()=>{
    if (sponsorRows.length > 0) return sponsorRows.map((r:any)=>({ id:`sp-${r.id}`, nama:r.nama||r.sumber||'Sponsor', jumlah:Number(r.jumlah||0), sumber:r.keterangan||r.website||'sponsor', waktu:r.created_at||'', deskripsi:r.keterangan||r.deskripsi||'Sponsor', logo:r.logo||'' }));
    const fromKeuangan = keuanganRowsRaw.filter((k:any)=>String(k.jenis||'').toLowerCase().includes('sponsor')).map((k:any)=>({ id:`kw-sp-${k.id}`, nama:k.nama||'Sponsor', jumlah:Number(k.jumlah)||0, sumber:k.keterangan||'sponsor', waktu:k.created_at||'', deskripsi:k.keterangan||'Sponsor', logo:'' }));
    if (fromKeuangan.length > 0) return fromKeuangan;
    // fallback ke sponsor state admin agar slide tetap tampil jika tabel sponsor supabase kosong
    return sponsors.map((s:any)=>({ id:s.id, nama:s.nama, jumlah:0, sumber:s.website||'sponsor', waktu:'', deskripsi:s.deskripsi||'Sponsor', logo:s.logo||'' }));
  },[sponsorRows, keuanganRowsRaw, sponsors]);

  const donasiEntries = useMemo(()=>{
    const direct = [...donasiRowsRaw, ...donasiCashRows, ...donasiOnlineRows];
    if (direct.length > 0) return direct.map((r:any)=>({ id:`d-${r.id}`, nama:r.nama||'Donasi', jumlah:Number(r.jumlah||0), sumber:r.alamat||r.keterangan||r.pesan||'donasi', waktu:r.created_at||'' }));
    return keuanganRowsRaw.filter((k:any)=>String(k.jenis||'').toLowerCase().includes('donasi')).map((k:any)=>({ id:`kw-d-${k.id}`, nama:k.nama||'Donasi', jumlah:Number(k.jumlah)||0, sumber:k.keterangan||'donasi', waktu:k.created_at||'' }));
  },[donasiRowsRaw, donasiCashRows, donasiOnlineRows, keuanganRowsRaw]);

  const pengeluaranEntries = useMemo(()=>{
    const fromKeuangan = keuanganRowsRaw.filter((k:any)=>String(k.jenis||'').toLowerCase().includes('pengeluaran')).map((k:any)=>({ id:`kw-out-${k.id}`, nama:k.nama||'Pengeluaran', jumlah:Number(k.jumlah)||0, sumber:k.keterangan||'pengeluaran', waktu:k.created_at||'' }));
    return fromKeuangan.length > 0 ? fromKeuangan : pengeluaran.map((p:any)=>({ id:p.id, nama:p.nama, jumlah:Number(p.jumlah||0), sumber:p.penerima||p.catatan||p.kategori, waktu:p.waktu||'' }));
  },[keuanganRowsRaw, pengeluaran]);

  const pemasukanRealtime = useMemo(()=> cashEntries.reduce((s:any,x:any)=>s+Number(x.jumlah||0),0) + transferEntries.reduce((s:any,x:any)=>s+Number(x.jumlah||0),0), [cashEntries, transferEntries]);
  const pengeluaranRealtime = useMemo(()=> pengeluaranEntries.reduce((s:any,x:any)=>s+Number(x.jumlah||0),0), [pengeluaranEntries]);

  const filtered = useMemo(()=> participants.filter(p=>{
    const ms=!search||p.name.toLowerCase().includes(search.toLowerCase())||p.id.toLowerCase().includes(search.toLowerCase())||p.rt.toLowerCase().includes(search.toLowerCase());
    const ml=filterLomba==='Semua'||p.lomba.some(l=>l.includes(filterLomba));
    const mr=filterRT==='Semua'||p.rt.includes(filterRT);
    return ms&&ml&&mr;
  }),[participants,search,filterLomba,filterRT]);
  const filteredLomba = useMemo(()=> LOMBA_DATA.filter(l=> filterKategori==='Semua'||l.kategori===filterKategori), [filterKategori]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if(!formData.name.trim()||!formData.hp.trim()||!formData.rt.trim()){ alert('Lengkapi!'); return; }
    if(formData.lomba.length===0){ alert('Pilih lomba!'); return; }
    setIsSubmitting(true);
    const newP: Participant = { id:`MWR81-${String(Date.now()).slice(-4)}`, name:formData.name.trim(), rt:formData.rt.trim(), hp:formData.hp.trim(), lomba:formData.lomba, catatan:formData.catatan||'Terdaftar via Web', waktu:new Date().toLocaleString('id-ID'), createdAt:Date.now() };
    setParticipants(prev=>{ const updated=[newP, ...prev]; try{ localStorage.setItem('hutri-participants-mawar', JSON.stringify(updated)); localStorage.setItem('hutri-last-peserta', JSON.stringify(newP)); }catch{} return updated; });
    setHighlightId(newP.id); setTimeout(()=>setHighlightId(null),4000);
    setFormData({ name:'', rt:'', hp:'', lomba:[], catatan:'' }); setShowRegister(false);
    try{ const bc=new BroadcastChannel('hutri-sync'); bc.postMessage({ type:'new-peserta', data:newP }); setTimeout(()=>bc.close(),100); }catch{}
    (async()=>{ try{ const admin=getSupabaseAdmin(); await admin.from('pendaftar').insert([{ nama:newP.name, telepon:newP.hp, rt:newP.rt, lomba:newP.lomba.join(', '), catatan:newP.catatan }]); }catch{} finally { setLastUpdate(new Date().toLocaleTimeString('id-ID')); } })();
    setTimeout(()=>setIsSubmitting(false),300);
  };

  const handleDonasi = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt=Number(donasiForm.jumlah); if(!amt||amt<1000){ alert('Minimal 1.000'); return; }
    const newD: Donor = { id:`DON-${Date.now()}`, name:donasiForm.isAnon?'Hamba Allah':donasiForm.name||'Hamba Allah', alamat:donasiForm.alamat, jumlah:amt, pesan:donasiForm.pesan, waktu:new Date().toLocaleString('id-ID'), isAnon:donasiForm.isAnon, metode:'online', jenis:'donasi online' };
    setDonors(prev=>[newD, ...prev]);
    setDonasiForm({ name:'', alamat:'', jumlah:'', pesan:'', isAnon:false });
    (async()=>{
      try{
        const admin=getSupabaseAdmin();
        await admin.from('donasi').insert([{ nama:newD.name, alamat:newD.alamat, jumlah:newD.jumlah, pesan:newD.pesan, is_anon:newD.isAnon }]);
        await admin.from('donasi online').insert([{ nama:newD.name, alamat:newD.alamat, jumlah:newD.jumlah, keterangan:newD.pesan||'Donasi Online', is_anon:newD.isAnon }]);
        await admin.from('keuangan').insert([{ nama:newD.name, jenis:'donasi online', jumlah:newD.jumlah, keterangan:`${newD.alamat} / ${newD.pesan||'-'}`, is_anon:newD.isAnon }]);
      }catch(e){ console.warn('donasi sync error', e); }
      finally { setLastUpdate(new Date().toLocaleTimeString('id-ID')); }
    })();
    alert('Terima kasih! Donasi masuk realtime ke Supabase.');
  };

  const loginPanitia = () => {
    const u = loginUsername.trim().toLowerCase();
    const p = loginPassword.trim().toLowerCase();
    if (!u || !p) { alert('Isi username & password!'); return; }
    const allUsers = [...PANITIA_USERS, ...OWNER_USERS];
    const found = allUsers.find(us=> us.username.toLowerCase()===u && us.password.toLowerCase()===p);
    if (found) {
      const isOwn = OWNER_USERS.some(o=> o.username.toLowerCase()===u);
      setIsPanitia(true); setIsOwner(isOwn); setCurrentUser(found); setShowPanitiaLogin(false); setLoginUsername(''); setLoginPassword('');
      try{ localStorage.setItem('isPanitia','true'); localStorage.setItem('isOwner',String(isOwn)); localStorage.setItem('currentUser', JSON.stringify(found)); }catch{}
      setAdminTab(isOwn ? 'supabase' : 'overview');
      setTimeout(()=>document.getElementById('admin')?.scrollIntoView({behavior:'smooth'}),200);
    } else {
      alert('Username / Password salah!\nPanitia: admin/mawar81, eka/pj2026!, bayu/ketua2026!, aulia/bendahara2026!, sugiono/wakil2026!, lani/sekretaris2026!, puput/bendahara2!\nOwner: owner/owner81');
    }
  };

  const exportCSV = () => { let csv='No,ID,Nama,RT,HP,Lomba,Waktu\n'; filtered.forEach((p,i)=>{ csv+=`${i+1},${p.id},"${p.name}","${p.rt}",${p.hp},"${p.lomba.join('; ')}",${p.waktu}\n`; }); const b=new Blob([csv],{type:'text/csv'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=`peserta-mawar-${new Date().toISOString().slice(0,10)}.csv`; a.click(); };
  const downloadTXT = () => { const txt=RUNDOWN.map(r=>`${r.jam} - ${r.kegiatan}`).join('\n'); const b=new Blob([`RUNDOWN HUT RI 81 RT 002 RW 014\n\n${txt}`],{type:'text/plain'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='rundown-hut81.txt'; a.click(); };
  const downloadKeuangan = () => {
    let csv='Jenis,Nama/Penerima,Jumlah,Metode,Waktu,Keterangan\n';
    funding.forEach(f=>{ csv+=`Pemasukan,"${f.sumber}",${f.jumlah},${f.metode},${new Date().toLocaleString('id-ID')},${f.kategori}\n`; });
    pengeluaran.forEach(p=>{ csv+=`PENGELUARAN,"${p.nama}",-${p.jumlah},${p.metode},${p.waktu},${p.catatan||p.penerima}\n`; });
    const b=new Blob([csv],{type:'text/csv'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=`keuangan-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };
  const downloadDonasi = () => {
    let csv='Nama,Alamat,Jumlah,Pesan,Waktu,Anonim\n';
    donors.forEach(d=>{ csv+=`"${d.name}","${d.alamat}",${d.jumlah},"${d.pesan||''}",${d.waktu},${d.isAnon}\n`; });
    const b=new Blob([csv],{type:'text/csv'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=`donasi-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };
  const downloadInventory = () => {
    let csv='Nama,Kategori,Jumlah,Kondisi,Lokasi,Penanggung Jawab\n';
    inventory.forEach(i=>{ csv+=`"${i.nama}",${i.kategori},${i.jumlah},${i.kondisi},"${i.lokasi}","${i.penanggungJawab}"\n`; });
    const b=new Blob([csv],{type:'text/csv'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=`inventory-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };
  const downloadPengeluaran = () => {
    let csv='Nama,Kategori,Jumlah,Metode,Penerima,Waktu,Catatan\n';
    pengeluaran.forEach(p=>{ csv+=`"${p.nama}",${p.kategori},${p.jumlah},${p.metode},"${p.penerima||'-'}",${p.waktu},"${p.catatan||''}"\n`; });
    const b=new Blob([csv],{type:'text/csv'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=`pengeluaran-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };
  const testSupabase = async () => { setSupabaseStatus('testing'); try { const { error } = await supabase.from('pendaftar').select('id').limit(1); if(error) throw error; setSupabaseStatus('ok'); } catch { setSupabaseStatus('fail'); } };
  const saveFunding = async () => {
    if(!newFunding.sumber||!newFunding.jumlah){ alert('Lengkapi'); return; }
    const nf:any = { id:`f-${Date.now()}`, sumber:newFunding.sumber, jumlah:Number(newFunding.jumlah), kategori:newFunding.kategori, status:'confirmed', metode:newFunding.metode };
    setFunding(prev=>[...prev, nf]);
    try { const bc=new BroadcastChannel('hutri-sync'); bc.postMessage({ type:'new-funding', data:nf }); bc.close(); } catch {}
    (async()=>{
      try{
        const admin=getSupabaseAdmin();
        await admin.from('keuangan').insert([{ nama:nf.sumber, jenis:nf.kategori, jumlah:nf.jumlah, keterangan:nf.metode, is_anon:false }]);
        if (nf.kategori==='iuran') await admin.from('iuran warga').insert([{ nama:nf.sumber, jumlah:nf.jumlah, keterangan:nf.metode }]);
        if (nf.kategori==='sponsor') await admin.from('sponsor').insert([{ nama:nf.sumber, jumlah:nf.jumlah, keterangan:nf.metode }]);
        if (nf.kategori==='donatur') await admin.from('donasi cash').insert([{ nama:nf.sumber, jumlah:nf.jumlah, keterangan:'Donatur / '+nf.metode }]);
        if (nf.kategori==='donasi' || nf.kategori==='donasi_online') await admin.from('donasi online').insert([{ nama:nf.sumber, jumlah:nf.jumlah, keterangan:nf.metode }]);
        if (nf.kategori==='donasi_cash') await admin.from('donasi cash').insert([{ nama:nf.sumber, jumlah:nf.jumlah, keterangan:nf.metode }]);
      }catch(e:any){ alert('Gagal sync Supabase keuangan: '+(e.message||e)); }
      finally { setLastUpdate(new Date().toLocaleTimeString('id-ID')); }
    })();
    setNewFunding({ sumber:'', jumlah:'', kategori:'iuran', metode:'cash' });
  };
  const saveCashDonasi = async () => {
    if(!cashDonasi.nama||!cashDonasi.jumlah){ alert('Lengkapi'); return; }
    const nd:any = { id:`DON-CASH-${Date.now()}`, name:cashDonasi.nama, alamat:'Cash via Panitia', jumlah:Number(cashDonasi.jumlah), pesan:`Cash ${cashDonasi.metode}`, waktu:new Date().toLocaleString('id-ID'), isAnon:false };
    setDonors(prev=>[nd, ...prev]);
    (async()=>{
      try{
        const admin=getSupabaseAdmin();
        await admin.from('donasi').insert([{ nama:nd.name, alamat:'Cash', jumlah:nd.jumlah, pesan:nd.pesan, is_anon:false }]);
        await admin.from('donasi cash').insert([{ nama:nd.name, jumlah:nd.jumlah, keterangan:nd.pesan, is_anon:false }]);
        await admin.from('keuangan').insert([{ nama:nd.name, jenis:'donasi cash', jumlah:nd.jumlah, keterangan:nd.pesan, is_anon:false }]);
      }catch(e){ console.warn('donasi cash sync error', e); }
    })();
    setCashDonasi({ nama:'', jumlah:'', metode:'cash' });
  };

  if (showGalleryPage) {
    return <GalleryPage onBack={()=>setShowGalleryPage(false)} />;
  }

  if (showInventoryPage) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] text-zinc-900">
        <header className="sticky top-0 z-40 bg-[#B71C1C] border-b shadow"><div className="max-w-7xl mx-auto px-4 h-[48px] flex items-center gap-3 text-white"><button onClick={()=>setShowInventoryPage(false)} className="flex items-center gap-1.5 text-[12px] font-bold">‹ Kembali</button><div className="h-5 w-[1px] bg-white/20" /><div className="font-bold text-[13px]">📦 Inventory Peralatan Panitia</div></div></header>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-end"><div><h1 className="text-[28px] font-black">INVENTORY PERALATAN</h1><p className="text-[12px] text-zinc-500">Kelola peralatan & aksesoris panitia — bisa input/edit via Admin Panitia</p></div><button onClick={()=>{ if(!isPanitia){ setShowPanitiaLogin(true); return; } setAdminTab('inventory'); setShowInventoryPage(false); setTimeout(()=>document.getElementById('admin')?.scrollIntoView({behavior:'smooth'}),200); }} className="h-9 px-4 rounded-full bg-[#C1272D] text-white text-[12px] font-bold">🔧 Kelola di Admin</button></div>
          <div className="mt-6 grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {inventory.map(it=>(
              <div key={it.id} className="bg-white rounded-2xl border p-4 shadow-sm"><div className="flex justify-between"><span className={`text-[10px] px-2 py-1 rounded-full font-bold ${it.kategori==='peralatan'?'bg-blue-50 text-blue-600':it.kategori==='aksesoris'?'bg-pink-50 text-pink-600':it.kategori==='sound'?'bg-purple-50 text-purple-600':'bg-zinc-100'}`}>{it.kategori}</span><span className={`text-[10px] px-2 py-1 rounded-full font-bold ${it.kondisi==='baik'?'bg-emerald-50 text-emerald-600':'bg-red-50 text-red-600'}`}>{it.kondisi}</span></div><h4 className="mt-3 font-bold text-[14px]">{it.nama}</h4><div className="mt-2 text-[11px] space-y-1"><div>Jumlah: <b>{it.jumlah}</b></div><div>Lokasi: {it.lokasi}</div><div>PJ: {it.penanggungJawab}</div></div></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showArchivePage) {
    return (
      <div className="min-h-screen bg-[#FFFBF5]">
        <header className="sticky top-0 z-40 bg-[#B71C1C] border-b shadow"><div className="max-w-7xl mx-auto px-4 h-[48px] flex items-center gap-3 text-white"><button onClick={()=>setShowArchivePage(false)} className="text-[12px] font-bold">‹ Kembali</button><div className="font-bold text-[13px]">📚 Arsip Perayaan HUT RI</div></div></header>
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-[28px] font-black text-center">ARSIP PERAYAAN HUT RI</h1><p className="text-center text-[12px] text-zinc-500 mt-1">Website reusable tiap tahun — data otomatis masuk ke kolom terpisah per tahun</p>
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {archive.map(a=>(
              <div key={a.tahun} className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition">
                <div className="h-10 w-10 rounded-xl bg-[#C1272D] text-white grid place-items-center font-black">{a.tahun}</div>
                <h3 className="mt-3 font-black text-[15px]">{a.tema}</h3>
                <p className="text-[11px] text-zinc-500 mt-1">{a.deskripsi}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]"><div className="bg-zinc-50 rounded-xl p-2 text-center"><div className="font-black text-[14px]">{a.peserta}</div><div>Peserta</div></div><div className="bg-zinc-50 rounded-xl p-2 text-center"><div className="font-black text-[14px]">{a.lomba}</div><div>Lomba</div></div><div className="bg-zinc-50 rounded-xl p-2 text-center"><div className="font-black text-[14px]">{(a.dana/1000000).toFixed(0)}jt</div><div>Dana</div></div></div>
              </div>
            ))}
          </div>
          {isOwner && (
            <div className="mt-8 bg-white rounded-2xl border p-5">
              <h4 className="font-black text-[13px]">Tambah Tahun Baru (Owner)</h4>
              <div className="mt-3 grid md:grid-cols-5 gap-2">
                <input id="arch-tahun" type="number" placeholder="Tahun" className="h-10 px-3 rounded-xl border text-[12px]" />
                <input id="arch-tema" placeholder="Tema" className="h-10 px-3 rounded-xl border text-[12px]" />
                <input id="arch-peserta" type="number" placeholder="Peserta" className="h-10 px-3 rounded-xl border text-[12px]" />
                <input id="arch-dana" type="number" placeholder="Dana" className="h-10 px-3 rounded-xl border text-[12px]" />
                <button onClick={()=>{
                  const tahun = Number((document.getElementById('arch-tahun') as HTMLInputElement).value);
                  const tema = (document.getElementById('arch-tema') as HTMLInputElement).value;
                  const peserta = Number((document.getElementById('arch-peserta') as HTMLInputElement).value);
                  const dana = Number((document.getElementById('arch-dana') as HTMLInputElement).value);
                  if(!tahun||!tema) return alert('Lengkapi');
                  setArchive([{ tahun, tema, peserta: peserta||0, dana: dana||0, lomba: LOMBA_DATA.length, deskripsi: `Perayaan HUT RI ke-${tahun-1945}` }, ...archive]);
                }} className="h-10 rounded-xl bg-[#C1272D] text-white font-bold text-[12px]">Tambah Tahun</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-zinc-900 overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-[#C1272D] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-[56px] flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-full bg-white text-[#C1272D] grid place-items-center font-black text-[12px]">81</div><div className="leading-none"><div className="font-black text-[11px]">HUT RI Ke-81</div><div className="text-[9px] opacity-80">Ciptaland Blok Mawar</div></div></div>
          <nav className="hidden lg:flex items-center gap-4 text-[11px] font-bold">
            <a href="#hero">Beranda</a><a href="#panitia">Ringkasan</a><a href="#lomba">Lomba</a>
            <button onClick={()=>setShowGalleryPage(true)} className="hover:text-yellow-200">Galeri</button>
            <button onClick={()=>setShowInventoryPage(true)} className="hover:text-yellow-200">Inventory</button>
            <button onClick={()=>setShowArchivePage(true)} className="hover:text-yellow-200">Arsip HUT</button>
            <a href="#rundown">Jadwal</a><a href="#admin">Admin</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={()=>{ if(isPanitia) document.getElementById('admin')?.scrollIntoView({behavior:'smooth'}); else setShowPanitiaLogin(true); }} className={`h-8 px-3 rounded-full text-[11px] font-bold border ${isPanitia?'bg-emerald-500 text-white border-emerald-400':'bg-black/20 border-white/20'}`}>
              {isPanitia ? `✅ ${currentUser?.nama||'Panitia'}` : '🔒 Panitia'}
            </button>
            <button onClick={()=>setShowRegister(true)} className="h-8 px-4 rounded-full bg-[#FFD23F] text-[#C1272D] text-[11px] font-black">Daftar Sekarang</button>
          </div>
        </div>
      </header>

      <section id="hero" className="relative bg-[#C1272D] overflow-hidden">
        <div className="absolute inset-0"><div className="absolute inset-0 bg-gradient-to-br from-[#E12A2F] via-[#C1272D] to-[#A01E22]" /></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold">Dirgahayu Republik Indonesia</div>
          <h1 className="mt-6 text-[40px] md:text-[54px] font-black leading-[0.85] tracking-tight">HUT KEMERDEKAAN<br/><span className="text-[#FFD23F]">RI KE-81</span></h1>
          <p className="mt-4 text-[13px] font-medium">Perumahan <b>Ciptaland Blok Mawar</b><br/>RT 002 / RW 014</p>
          <div className="mt-5 flex justify-center gap-2">{[{v:countdown.hari,l:'HARI'},{v:countdown.jam,l:'JAM'},{v:countdown.menit,l:'MENIT'},{v:countdown.detik,l:'DETIK'}].map(c=>(<div key={c.l} className="bg-white/15 border border-white/15 rounded-xl w-[62px] py-2.5"><div className="text-[22px] font-black leading-none">{String(c.v).padStart(2,'0')}</div><div className="text-[8px] font-bold opacity-70 mt-1">{c.l}</div></div>))}</div>
          <div className="mt-6 flex justify-center gap-3"><button onClick={()=>setShowRegister(true)} className="h-10 px-6 rounded-full bg-white text-[#C1272D] font-black text-[13px]">Daftar Lomba →</button><button onClick={()=>setShowGalleryPage(true)} className="h-10 px-6 rounded-full border-2 border-white/40 text-white font-bold text-[13px]">Lihat Galeri</button></div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="bg-white/10 border border-white/15 rounded-xl p-3"><div className="font-black text-[16px]">50K/KK</div><div className="text-[9px] opacity-80">Partisipasi Warga /KK</div></div>
            <div className="bg-white/10 border border-white/15 rounded-xl p-3"><div className="font-black text-[16px]">{LOMBA_DATA.length}+</div><div className="text-[9px] opacity-80">Kategori Lomba</div></div>
            <div className="bg-white/10 border border-white/15 rounded-xl p-3"><div className="font-black text-[16px]">{(totalDana/1000000).toFixed(0)}jt</div><div className="text-[9px] opacity-80">Terkumpul • {formatRupiah(totalDana).slice(0,10)}</div></div>
            <div className="bg-white/10 border border-white/15 rounded-xl p-3"><div className="font-black text-[16px]">17 Agu</div><div className="text-[9px] opacity-80">2026 • 06-22 WIB</div></div>
          </div>
        </div>
      </section>

      <section id="transaksi-realtime" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-zinc-900 rounded-[20px] border border-zinc-800 shadow-xl overflow-hidden">
          <div className="p-4 md:p-5 flex flex-wrap justify-between gap-3 items-center border-b border-white/10">
            <div><h3 className="font-black text-[14px] text-white flex items-center gap-2"><span className="h-7 w-7 rounded-full bg-emerald-500 grid place-items-center">💳</span> Transaksi Keuangan Realtime — QRIS Dana & Transfer Bank <span className="ml-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /></h3><p className="text-[11px] text-white/60 mt-1">Iuran / Donatur / Sponsor / Donasi / Pengeluaran — Setiap transaksi langsung terkoneksi & sinkron ke Total Dana, Ringkasan Anggaran, dan Panel Panitia.</p></div>
            <div className="flex items-center gap-2"><span className="text-[10px] px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">LIVE • {cashEntries.length + transferEntries.length + pengeluaranEntries.length} transaksi</span><span className="text-[10px] px-3 py-1 bg-white/10 text-white/70 border border-white/10 rounded-full">Pemasukan: {formatRupiah(pemasukanRealtime)} | Pengeluaran: {formatRupiah(pengeluaranRealtime)}</span></div>
          </div>
          <div className="p-4 bg-[#0F0F0F] grid md:grid-cols-5 gap-3 border-b border-white/10">
            <div className="bg-white rounded-xl p-3 shadow-sm"><div className="text-[10px] font-bold text-zinc-500">Cash</div><div className="text-[18px] font-black text-blue-600">{formatRupiah(cashEntries.reduce((s:any,f:any)=>s+Number(f.jumlah||0),0))}</div><div className="text-[9px] text-zinc-500">{cashEntries.length} transaksi cash</div></div>
            <div className="bg-white rounded-xl p-3 shadow-sm"><div className="text-[10px] font-bold text-zinc-500">Donatur</div><div className="text-[18px] font-black text-[#C1272D]">{donaturEntries.length}</div><div className="text-[9px] text-zinc-500">Total donatur</div></div>
            <div className="bg-white rounded-xl p-3 shadow-sm relative overflow-hidden min-h-[78px]">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] font-bold text-zinc-500">Sponsor</div>
                <div className="text-[10px] text-zinc-400">{sponsorSlideIdx+1}/{Math.max(1,sponsorEntries.length)}</div>
              </div>
              {sponsorEntries.length>0 ? sponsorEntries.map((s:any,idx:number)=>(
                <div key={s.id} className={`absolute inset-x-3 top-7 transition-opacity duration-500 ${idx===sponsorSlideIdx?'opacity-100':'opacity-0 pointer-events-none'}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-100 overflow-hidden grid place-items-center text-[18px] shrink-0">{typeof s.logo === 'string' && (s.logo.startsWith('/') || s.logo.startsWith('http')) ? <img src={s.logo} alt={s.nama} className="w-full h-full object-cover" /> : <span>{s.logo||''}</span>}</div>
                    <div className="min-w-0 flex-1"><div className="font-black text-[12px] text-purple-700 truncate">{s.nama||s.sumber}</div><div className="text-[10px] text-zinc-500 truncate">{s.deskripsi||s.sumber||'Sponsor'}</div></div>
                  </div>
                </div>
              )) : <div className="text-[11px] text-zinc-400">Belum ada sponsor</div>}
              <div className="absolute bottom-2 right-3 flex gap-1">{sponsorEntries.map((_:any,idx:number)=><button key={idx} onClick={()=>setSponsorSlideIdx(idx)} className={`h-1.5 rounded-full transition-all ${idx===sponsorSlideIdx?'w-4 bg-purple-500':'w-1.5 bg-zinc-300'}`}></button>)}</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm"><div className="text-[10px] font-bold text-zinc-500">Donasi</div><div className="text-[16px] font-black text-emerald-600">{formatRupiah(donasiEntries.reduce((s:any,d:any)=>s+Number(d.jumlah||0),0))}</div><div className="text-[9px] text-zinc-500">{donasiEntries.length} transaksi donasi</div></div>
            <div className="bg-white rounded-xl p-3 shadow-sm"><div className="text-[10px] font-bold text-zinc-500">Pengeluaran</div><div className="text-[16px] font-black text-orange-600">{formatRupiah(pengeluaranEntries.reduce((s:any,p:any)=>s+Number(p.jumlah||0),0))}</div><div className="text-[9px] text-zinc-500">{pengeluaranEntries.length} transaksi</div></div>
          </div>
          <div className="grid md:grid-cols-6 gap-px bg-white/10">
            <div className="bg-[#121212] p-3"><div className="text-[9px] font-bold tracking-widest uppercase text-blue-400">CASH</div><div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto">{cashEntries.slice(0,40).map((f:any)=>(<div key={f.id} className="bg-white/5 border border-white/10 rounded-lg p-2"><div className="font-bold text-[10px] text-white">{f.nama||f.sumber||'Cash'}</div><div className="text-[9px] text-white/50">{f.jenis||f.sumber}</div><div className="font-mono font-black text-[10px] text-blue-400">{formatRupiah(Number(f.jumlah||0))}</div></div>))}{cashEntries.length===0 && <div className="text-[10px] text-white/40 py-4 text-center">Belum ada transaksi cash</div>}</div></div>
            <div className="bg-[#121212] p-3"><div className="text-[9px] font-bold tracking-widest uppercase text-[#C1272D]">DONATUR</div><div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto">{donaturEntries.slice(0,40).map((d:any)=>(<div key={d.id} className="bg-white/5 border border-white/10 rounded-lg p-2"><div className="font-bold text-[10px] text-white">{d.nama||d.sumber}</div><div className="font-mono font-black text-[10px] text-emerald-400">{formatRupiah(Number(d.jumlah||0))}</div></div>))}{donaturEntries.length===0 && <div className="text-[10px] text-white/40 py-4 text-center">Belum ada</div>}</div></div>
            <div className="bg-[#121212] p-3">
              <div className="text-[9px] font-bold tracking-widest uppercase text-purple-400">SPONSOR</div>
              <div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto">
                {sponsorEntries.slice(0,40).map((f:any)=>(
                  <div key={f.id} className="bg-white/5 border border-white/10 rounded-lg p-2">
                    <div className="font-bold text-[10px] text-white">{f.nama||f.sumber}</div>
                    <div className="font-mono font-black text-[10px] text-purple-400">{formatRupiah(Number(f.jumlah||0))}</div>
                  </div>
                ))}
                {sponsorEntries.length===0 && <div className="text-[10px] text-white/40 py-4 text-center">Belum ada</div>}
              </div>
              <p className="text-[9px] text-white/50 mt-2 text-center">Slideshow sponsor dipindah ke kartu putih Sponsor di atas.</p>
            </div>
            <div className="bg-[#121212] p-3"><div className="text-[9px] font-bold tracking-widest uppercase text-emerald-400">DONASI</div><div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto">{donasiEntries.slice(0,40).map((d:any)=>(<div key={d.id} className="bg-white/5 border border-white/10 rounded-lg p-2"><div className="font-bold text-[10px] text-white">{d.nama||d.sumber}</div><div className="font-mono font-black text-[10px] text-emerald-400">{formatRupiah(Number(d.jumlah||0))}</div></div>))}{donasiEntries.length===0 && <div className="text-[10px] text-white/40 py-4 text-center">Belum ada</div>}</div></div>
            <div className="bg-[#121212] p-3"><div className="text-[9px] font-bold tracking-widest uppercase text-orange-400">PENGELUARAN</div><div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto">{pengeluaranEntries.slice(0,40).map((p:any)=>(<div key={p.id} className="bg-white/5 border border-orange-500/30 rounded-lg p-2"><div className="font-bold text-[10px] text-white">{p.nama}</div><div className="text-[9px] text-white/50">{p.sumber||p.kategori}</div><div className="font-mono font-black text-[10px] text-orange-400">-{formatRupiah(Number(p.jumlah||0))}</div></div>))}{pengeluaranEntries.length===0 && <div className="text-[10px] text-white/40 py-4 text-center">Belum ada</div>}</div></div>
            <div className="bg-[#121212] p-3"><div className="text-[9px] font-bold tracking-widest uppercase text-yellow-400">TRANSFER</div><div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto">{transferEntries.slice(0,40).map((t:any)=>(<div key={t.id} className="bg-white/5 border border-white/10 rounded-lg p-2"><div className="font-bold text-[10px] text-white">{t.nama}</div><div className="text-[9px] text-white/50">{t.sumber||t.jenis}</div><div className="font-mono font-black text-[10px] text-yellow-400">{formatRupiah(Number(t.jumlah||0))}</div></div>))}{transferEntries.length===0 && <div className="text-[10px] text-white/40 py-4 text-center">Belum ada transaksi transfer</div>}</div></div>
          </div>
          <div className="p-3 bg-black/40 border-t border-white/10 flex flex-wrap justify-between gap-2 text-[10px] text-white/50">
            <span>📊 Sinkron langsung: Iuran + Donatur + Sponsor + Donasi + Pengeluaran → Total Dana Hero & Admin Panitia</span>
            <button onClick={downloadPengeluaran} className="h-6 px-3 rounded-full bg-orange-600 text-white text-[9px] font-bold">📥 Unduh Rincian Pengeluaran CSV</button>
          </div>
        </div>
      </section>

      <section id="panitia" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid gap-4">
        <div className="bg-white rounded-2xl shadow border overflow-hidden"><div className="p-5 pb-3 flex justify-between"><h3 className="font-black text-[15px]">👥 Susunan Panitia</h3><span className="text-[10px] px-2 py-1 bg-zinc-100 border rounded-full font-bold">RT 002/RW 014</span></div><div className="overflow-x-auto"><table className="w-full text-[13px]"><thead><tr className="bg-[#C1272D] text-white text-[11px] uppercase"><th className="text-left px-4 py-2.5">Jabatan</th><th className="text-left px-4 py-2.5">Nama</th></tr></thead><tbody>{PANITIA_DATA.map((r,i)=>(<tr key={r.jabatan} className={i%2?'bg-white':'bg-[#FFF7ED]'}><td className="px-4 py-2.5 font-semibold">{r.jabatan}</td><td className="px-4 py-2.5">{r.nama}</td></tr>))}</tbody></table></div></div>
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden"><div className="p-5 pb-3 flex justify-between"><h3 className="font-black text-[15px]">🧮 Ringkasan Anggaran</h3><span className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">Transparan</span></div><div className="overflow-x-auto"><table className="w-full text-[13px]"><thead><tr className="bg-[#C1272D] text-white text-[11px] uppercase"><th className="text-left px-4 py-2.5">Komponen</th><th className="text-right px-4 py-2.5">Jumlah</th><th className="text-left px-4 py-2.5">Detail</th></tr></thead><tbody>{ANGGARAN_DATA.map((row,i)=>(<tr key={row.komponen} className={`${(row as any).total?'bg-[#F9E2E2] font-black text-[#C1272D]':(row as any).masuk?'bg-emerald-50 font-bold text-emerald-700':(row as any).selisih?'bg-blue-50 font-black text-blue-700':i%2?'bg-white':'bg-[#FFF7ED]'} border-b`}><td className="px-4 py-3">{row.komponen}</td><td className="px-4 py-3 text-right font-mono font-bold">{formatRupiah(row.jumlah)}</td><td className="px-4 py-3">{(row as any).detail?<button onClick={()=>setShowDetail((row as any).detail)} className="text-[11px] px-3 py-1 rounded-full border border-[#C1272D] text-[#C1272D] font-bold">Lihat Detail</button>:<span className="text-zinc-400 text-[11px]">-</span>}</td></tr>))}</tbody></table></div></div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="bg-white rounded-2xl border p-6 shadow-sm"><div className="px-3 py-1 bg-[#C1272D]/10 text-[#C1272D] rounded-full text-[10px] font-black inline-block uppercase">TENTANG ACARA</div><h3 className="mt-3 text-[20px] font-black">Merayakan Kemerdekaan Bersama</h3><p className="mt-3 text-[13px] leading-6 text-zinc-600">Dalam rangka memeriahkan HUT RI ke-81, warga Ciptaland Blok Mawar RT 002 RW 014 akan mengadakan berbagai kegiatan seru penuh kebersamaan.</p><div className="mt-5 grid grid-cols-2 gap-3">{[{e:'🤝',t:'Kebersamaan',d:'Mempererat silaturahmi'},{e:'🎉',t:'Kemeriahan',d:'Berbagai lomba seru'},{e:'🏆',t:'Hadiah',d:'Total jutaan rupiah'},{e:'🇮🇩',t:'Nasionalisme',d:'Semangat kemerdekaan'}].map(it=>(<div key={it.t} className="bg-[#FFF7ED] border rounded-xl p-3"><div className="text-[18px]">{it.e}</div><div className="font-bold text-[12px] mt-1">{it.t}</div><div className="text-[11px] text-zinc-500">{it.d}</div></div>))}</div></div>
        <div className="bg-[#C1272D] rounded-2xl p-6 text-white shadow-lg sticky top-[72px] self-start">
          <h4 className="font-black flex items-center gap-2">🎊 Informasi Acara</h4>
          <p className="text-[11px] opacity-70 mt-1">Static & Interaktif — klik untuk aksi + slideshow sponsor</p>
          <div className="mt-5 space-y-3 text-[13px]">
            <button onClick={()=>{ alert('Tanggal: Minggu, 17 Agustus 2026'); }} className="w-full flex gap-3 items-center bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-3 text-left transition"><div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center">📅</div><div><div className="font-bold">Tanggal</div><div className="opacity-90">Minggu, 17 Agustus 2026</div><div className="text-[10px] opacity-60">Klik untuk info</div></div></button>
            <button onClick={()=>{ alert(`Waktu: 06:00 - 22:00 WIB`); }} className="w-full flex gap-3 items-center bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-3 text-left transition"><div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center">⏰</div><div><div className="font-bold">Waktu</div><div className="opacity-90">06:00 - 22:00 WIB</div><div className="text-[10px] opacity-60">Klik untuk info</div></div></button>
            <button onClick={()=>{ window.open('https://maps.google.com/?q=Perumahan+Ciptaland+Blok+Mawar','_blank'); }} className="w-full flex gap-3 items-center bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-3 text-left transition"><div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center">📍</div><div><div className="font-bold">Lokasi</div><div className="opacity-90">Perumahan Ciptaland Blok Mawar<br/>RT 002 / RW 014</div><div className="text-[10px] opacity-60">Klik untuk buka Maps</div></div></button>
            <div className="w-full flex gap-3 items-center bg-white/10 border border-white/10 rounded-xl p-3"><div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center"></div><div><div className="font-bold">Peserta</div><div className="opacity-90">Seluruh Warga & Keluarga ({participants.length} terdaftar)</div></div></div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="bg-white/10 border border-white/10 rounded-xl p-3 text-[11px] text-white/80 leading-5">
              <div className="font-bold text-yellow-300">ℹ Sponsor Mitra</div>
              <div className="mt-1">Slideshow sponsor telah dipindahkan ke <b>kolom Sponsor</b> pada blok <b>Transaksi Keuangan Realtime</b> agar lebih fokus dan rapi.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="lomba" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-[20px] font-black">ANEKA LOMBA</h2><p className="text-[12px] text-zinc-500">Pilih Lomba Favoritmu — Klik kartu untuk detail</p></div><div className="text-[10px] font-black px-3 py-1 bg-[#C1272D] text-white rounded-full">{LOMBA_DATA.length} Lomba</div></div>
        <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1">{[{id:'Semua',label:'📋 Semua'},{id:'anak',label:'👶 Anak'},{id:'ibu',label:'👩 Ibu'},{id:'bapak',label:'👨 Bapak'},{id:'remaja',label:'🧑 Remaja'},{id:'keluarga',label:'👨‍👩‍👧 Keluarga'}].map(f=>(<button key={f.id} onClick={()=>setFilterKategori(f.id)} className={`whitespace-nowrap px-4 py-2 rounded-full text-[12px] font-bold border ${filterKategori===f.id?'bg-[#C1272D] text-white border-[#C1272D]':'bg-white text-zinc-600 border-zinc-200'}`}>{f.label}</button>))}</div>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{filteredLomba.map(l=>(<div key={l.id} className="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition"><div className="flex justify-between"><span className="text-[11px] px-2.5 py-1 bg-zinc-100 border rounded-full font-bold">{l.kategori} • Klik Detail</span><span className="text-[18px]">{l.emoji}</span></div><h4 className="mt-3 font-black text-[14px]">{l.title}</h4><p className="text-[12px] text-zinc-500 mt-1 line-clamp-2">{l.deskripsi}</p><div className="mt-3 grid grid-cols-3 gap-2 text-[10px]"><div className="bg-[#FFF7ED] rounded-lg p-2 text-center"><div>⏰</div><div className="font-bold">{l.waktu}</div></div><div className="bg-[#FFF7ED] rounded-lg p-2 text-center"><div>🏆</div><div className="font-bold">{l.hadiah}</div></div><div className="bg-[#FFF7ED] rounded-lg p-2 text-center"><div>👥</div><div className="font-bold">{l.peserta}</div></div></div><div className="mt-3 flex gap-2"><button onClick={()=>setShowLomba(l)} className="flex-1 h-8 rounded-full bg-zinc-100 border text-[11px] font-bold">🔍 Detail</button><button onClick={()=>{ setFormData(f=>({ ...f, lomba:f.lomba.includes(l.title)?f.lomba:[...f.lomba,l.title] })); setShowRegister(true); }} className="flex-1 h-8 rounded-full bg-[#C1272D] text-white text-[11px] font-bold">📝 Daftar</button></div></div>))}</div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border shadow-sm p-5"><h3 className="font-black text-[14px]">❤️ Konfirmasi Donasi</h3><form onSubmit={handleDonasi} className="mt-4 space-y-3"><label className="flex items-center gap-2 text-[12px] font-bold"><input type="checkbox" checked={donasiForm.isAnon} onChange={e=>setDonasiForm({...donasiForm, isAnon:e.target.checked})} /> Hamba Allah (Anonim)</label>{!donasiForm.isAnon && <input value={donasiForm.name} onChange={e=>setDonasiForm({...donasiForm, name:e.target.value})} placeholder="Nama Donatur" className="w-full h-10 px-4 rounded-xl border text-[13px]" required /> }<input value={donasiForm.alamat} onChange={e=>setDonasiForm({...donasiForm, alamat:e.target.value})} placeholder="Alamat / Blok Rumah" className="w-full h-10 px-4 rounded-xl border text-[13px]" required /><input type="number" value={donasiForm.jumlah} onChange={e=>setDonasiForm({...donasiForm, jumlah:e.target.value})} placeholder="Jumlah Donasi (Rp)" className="w-full h-10 px-4 rounded-xl border text-[13px]" required /><button type="submit" className="w-full h-11 rounded-xl bg-[#C1272D] text-white font-black text-[13px]">Kirim Konfirmasi</button></form></div>
        <div className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col"><h3 className="font-black text-[14px]">📱 QRIS Donasi Resmi - AULIA KOMARI</h3>
          <div className="mt-4 bg-[#FFF7ED] border-2 border-dashed border-[#C1272D]/30 rounded-2xl p-4 flex flex-col items-center text-center">
            <img src={qrisCustom || "/images/qris-aulia-komari.png"} alt="QRIS AULIA KOMARI ASLI" className="h-64 w-64 object-contain rounded-xl bg-white p-2 border shadow-sm" />
            <div className="mt-4 font-black text-[#C1272D]">Aulia Komari - Bendahara HUT RI 81</div>
            <div className="mt-3 bg-white border rounded-xl p-3 text-left text-[11px] font-mono leading-5 w-full"><div>• 901592977740 SeaBank</div><div>• 081364755007 DANA</div><div className="mt-2 text-[10px] text-zinc-500">QR asli — transaksi QRIS & Transfer terdeteksi realtime</div></div>
          </div>
        </div>
      </section>

      <section id="peserta" ref={tableRef} className="mt-4">
        <div className="bg-[#C1272D] relative overflow-hidden">
          <div className="absolute inset-0"><div className="absolute -top-24 -left-24 h-[420px] w-[420px] bg-white/10 rounded-full blur-[60px]" /><div className="absolute -bottom-32 -right-32 h-[520px] w-[520px] bg-black/20 rounded-full blur-[80px]" /></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 text-white">
              <div><div className="inline-flex items-center gap-2 bg-white text-[#C1272D] px-3.5 py-1 rounded-full text-[11px] font-black tracking-widest uppercase shadow-sm"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#C1272D]"></span></span>LIVE • REAL-TIME</div><h2 className="mt-4 text-[28px] md:text-[40px] font-black leading-[0.9] tracking-tighter">TABEL REAL-TIME<br/><span className="font-serif italic font-light opacity-90">DAFTAR PESERTA</span></h2><p className="mt-3 text-[12px] md:text-[13px] leading-6 opacity-85 max-w-[56ch]">Setiap peserta bisa daftar lebih dari 1 lomba menggunakan nama, no telp dan no rumah yang sama — tidak diblok duplikat. Edit di admin langsung replace.</p></div>
              <div className="flex flex-wrap gap-3"><div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 min-w-[130px]"><div className="text-[9px] font-bold tracking-widest uppercase opacity-70">TOTAL PESERTA</div><div className="text-2xl font-black leading-none mt-1">{participants.length}</div></div><div className="bg-white text-[#C1272D] rounded-2xl px-4 py-3 min-w-[160px] shadow-xl"><div className="text-[9px] font-bold tracking-widest uppercase opacity-60">UPDATE TERAKHIR</div><div className="text-[12px] font-black mt-1 font-mono">{lastUpdate} WIB</div></div></div>
            </div>
            <div className="mt-8 bg-white rounded-[20px] shadow-[0_24px_64px_-16px_rgba(0,0,0,.5)] border overflow-hidden">
              <div className="p-4 md:p-5 bg-[#FFFBF2] border-b border-zinc-200 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
                  <div className="relative flex-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[12px]">🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari Nama, ID, atau RT / Blok..." className="w-full h-10 pl-9 pr-4 rounded-full bg-white border border-zinc-200 text-[13px] font-medium" /></div>
                  <select value={filterLomba} onChange={e=>setFilterLomba(e.target.value)} className="h-10 px-4 rounded-full bg-white border border-zinc-200 text-[12px] font-bold"><option value="Semua">Semua Lomba</option>{LOMBA_DATA.map(l=><option key={l.id} value={l.title}>{l.title}</option>)}</select>
                  <select value={filterRT} onChange={e=>setFilterRT(e.target.value)} className="h-10 px-4 rounded-full bg-white border border-zinc-200 text-[12px] font-bold"><option value="Semua">Semua RT</option><option value="RT 002">RT 002</option><option value="Mawar 83">Mawar 83</option></select>
                </div>
                <div className="flex items-center gap-2"><button onClick={()=>setLive(!live)} className={`h-10 px-4 rounded-full text-[11px] font-black border ${live?'bg-emerald-600 text-white border-emerald-600':'bg-white text-zinc-600 border-zinc-200'}`}>{live?'LIVE ON':'OFF'}</button><button onClick={exportCSV} className="h-10 px-4 rounded-full bg-zinc-900 text-white text-[11px] font-black">📥 Export CSV</button></div>
              </div>
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-[12px] min-w-[860px]">
                  <thead className="sticky top-0 z-10"><tr className="bg-[#8B1A1E] text-white text-[10px] tracking-widest uppercase"><th className="text-left px-4 py-3 font-black">NO / ID</th><th className="text-left px-4 py-3 font-black">PESERTA & KONTAK</th><th className="text-left px-4 py-3 font-black">LOKASI RT</th><th className="text-left px-4 py-3 font-black">LOMBA DIIKUTI</th><th className="text-left px-4 py-3 font-black">WAKTU DAFTAR</th><th className="text-center px-4 py-3 font-black">STATUS</th></tr></thead>
                  <tbody>{filtered.map((p, idx)=>(
                      <tr key={p.id} className={`${highlightId===p.id?'bg-amber-50 border-l-4 border-l-amber-400':idx%2===0?'bg-white':'bg-[#FFFBF2]'} border-b`}>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-[10px] font-bold text-zinc-400">{String(idx+1).padStart(2,'0')}</span><span className="font-mono font-black text-[#C1272D] text-[11px] bg-[#F9E2E2] px-2 py-0.5 rounded-full border border-red-200">{p.id}</span></div></td>
                        <td className="px-4 py-3"><div className="font-bold text-[13px]">{p.name}</div><div className="text-[10px] text-zinc-500">📱 {maskHp(p.hp)} • {p.catatan||'Live join'}</div></td>
                        <td className="px-4 py-3"><span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-zinc-100 border">{p.rt}</span></td>
                        <td className="px-4 py-3"><div className="flex flex-wrap gap-1 max-w-[220px]">{p.lomba.slice(0,3).map(l=><span key={l} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border shadow-sm">{l}</span>)}</div></td>
                        <td className="px-4 py-3"><div className="text-[11px]">{p.waktu}</div></td>
                        <td className="px-4 py-3 text-center"><span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">✅ TERDAFTAR</span></td>
                      </tr>
                    ))}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rundown" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-[#FFFBF2] rounded-2xl border-2 border-amber-100 shadow-sm p-5 md:p-6"><div className="text-center"><h3 className="font-black text-[18px]">RUNDOWN ACARA</h3><p className="text-[11px] text-zinc-500">Jadwal Kegiatan — Minggu, 17 Agustus 2026 dan Malam Puncak 22 Agustus 2026</p><div className="mt-3 flex justify-center gap-2"><button onClick={downloadTXT} className="h-8 px-4 rounded-full bg-blue-600 text-white text-[11px] font-bold">Download (TXT)</button><button onClick={()=>window.print()} className="h-8 px-4 rounded-full bg-zinc-800 text-white text-[11px] font-bold">Cetak / Save PDF</button></div></div>
          <div className="mt-6 space-y-6">
            {['PAGI & PERLOMBAAN','MALAM PUNCAK (22 AGUSTUS 2026)'].map(group=>(
              <div key={group}><div className="text-[11px] font-black tracking-widest text-amber-700 mb-2">☀️ {group}</div><div className="space-y-2">{RUNDOWN.filter(r=>(r as any).group===group).map((r,i)=>(<div key={i} className="flex gap-3 p-3 rounded-xl border bg-white shadow-sm"><div className="h-7 min-w-[56px] rounded-full bg-[#C1272D] text-white grid place-items-center text-[11px] font-black">{r.jam}</div><div className="text-[12px]"><span className="font-bold">{r.kegiatan.split('(')[0]}</span><span className="text-zinc-500 text-[11px]"> ({r.kegiatan.match(/\(.*\)/)?.[0]||''})</span></div></div>))}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section id="panitia-pelaksana" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center"><h2 className="text-[24px] font-black">PANITIA PELAKSANA</h2><p className="text-[13px] text-zinc-500">Struktur Panitia</p></div>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            { jabatan:'⭐ Penanggung Jawab', nama:'Eka Rista Y', hp:'0821-7129-9984' },
            { jabatan:'⭐ Ketua Panitia', nama:'Bayu S.Permana', hp:'0812-8839-5550' },
            { jabatan:'⭐ Wakil Ketua', nama:'Sugiono', hp:'0831-8395-0205' },
          ].map(p=>(
            <div key={p.nama} className="bg-white rounded-2xl border shadow-sm p-5 text-center"><div className="h-12 w-12 mx-auto rounded-full bg-zinc-100 grid place-items-center">👤</div><div className="mt-3 text-[11px] font-bold text-amber-600">{p.jabatan}</div><div className="font-black text-[14px]">{p.nama}</div><div className="text-[11px] mt-1 flex items-center justify-center gap-1">📱 {p.hp}</div></div>
          ))}
        </div>
        <div className="mt-8"><h3 className="font-bold text-[14px]">Anggota Panitia Lainnya</h3><div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { nama:'Lani', jabatan:'Sekretaris', hp:'0813-7116-2792' },
            { nama:'Aulia Komari', jabatan:'Bendahara 1', hp:'0812-3456-7892' },
            { nama:'Puput', jabatan:'Bendahara 2', hp:'0831-8330-3884' },
            { nama:'Aryo', jabatan:'Runner', hp:'0856-0134-31284' },
            { nama:'M.Dzaki', jabatan:'MC', hp:'0858-3660-5110' },
            { nama:'Lukman', jabatan:'MC', hp:'0853-xxx-xxx' },
            { nama:'Agha', jabatan:'Koordinator Lomba', hp:'0851-9433-4760' },
            { nama:'Adib', jabatan:'Koordinator Lomba', hp:'0813-6365-2626' },
            { nama:'Hanif', jabatan:'Koordinator Lomba', hp:'0881-3712-0796' },
            { nama:'Satria', jabatan:'Koordinator Lomba', hp:'0819-9201-0197' },
            { nama:'Ridho Ananda', jabatan:'Koordinator Lomba', hp:'0823-8718-8929' },
            { nama:'Andre', jabatan:'Koordinator Lomba', hp:'08xx-xxx-xxx' },
            { nama:'Dio', jabatan:'Koordinator Lomba', hp:'0813-7112-100' },
            { nama:'Reza', jabatan:'Koordinator Lomba', hp:'08xx-xxx-xxx' },
          ].map(m=>(
            <div key={m.nama} className="bg-white rounded-xl border p-3 text-center shadow-sm"><div className="h-10 w-10 mx-auto rounded-full bg-zinc-100 grid place-items-center">👤</div><div className="font-bold text-[12px] mt-2">{m.nama}</div><div className="text-[10px] text-zinc-500">{m.jabatan}</div><div className="text-[10px] mt-1">📞 {m.hp}</div><a href={`https://wa.me/${m.hp.replace(/\D/g,'')}`} target="_blank" className="mt-2 inline-flex h-5 w-5 rounded-full bg-green-100 text-green-600 grid place-items-center text-[10px]">💬</a></div>
          ))}
        </div></div>
      </section>

      <section id="galeri" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-end"><div><h2 className="text-[22px] font-black">📸 Gallery & Video</h2><p className="text-[12px] text-zinc-500">Klik gambar untuk zoom & download HD</p></div><div className="flex gap-2"><button onClick={()=>setShowGalleryPage(true)} className="text-[11px] px-3 py-1.5 bg-[#C1272D] text-white rounded-full font-bold shadow">📸 Buka Halaman Galeri Lengkap</button><span className="hidden md:flex text-[10px] px-3 py-1.5 bg-[#C1272D]/10 text-[#C1272D] rounded-full font-bold border">{gallery.length} item</span></div></div>
        <div className="mt-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
          <div>
            <div className="aspect-video bg-zinc-900 rounded-[20px] overflow-hidden shadow-xl relative group border border-zinc-800">
              {selectedVideo && (selectedVideo.src.includes('.mp4') ? <video src={selectedVideo.src} controls className="w-full h-full object-cover" /> : <iframe src={selectedVideo.src} className="w-full h-full" allowFullScreen />)}
              <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[11px] px-3 py-1.5 rounded-full backdrop-blur">{selectedVideo?.title}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">{gallery.filter(g=>g.type==='image').slice(0,4).map(g=>(<button key={g.id} onClick={()=>setGalleryZoom(g)} className="group relative rounded-[16px] overflow-hidden border shadow-sm aspect-[4/3] bg-zinc-100 text-left"><img src={g.src} alt={g.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" /><div className="absolute bottom-2 left-2 text-white text-[11px] font-bold drop-shadow">{g.title}</div></button>))}</div>
        </div>
      </section>

      <section id="admin" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-zinc-900 rounded-[24px] text-white overflow-hidden shadow-2xl border border-zinc-800">
          <div className="p-6 md:p-7 flex flex-wrap justify-between gap-4 items-center border-b border-white/10"><div><h2 className="text-[20px] font-black flex items-center gap-2"><span className="h-8 w-8 rounded-full bg-[#C1272D] grid place-items-center">🔒</span> Kolom Khusus Admin Panitia</h2><p className="text-[12px] opacity-60 mt-1">Login terpisah — Panitia & Owner {currentUser && <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-black rounded-full text-[10px] font-black">{currentUser.nama} ({currentUser.username})</span>}</p></div><div className="flex items-center gap-2">{isPanitia?<><span className="text-[11px] px-3 py-1 bg-emerald-500 rounded-full font-bold">✅ {currentUser?.nama||'Panitia'}</span><button onClick={()=>{ setIsPanitia(false); setIsOwner(false); setCurrentUser(null); localStorage.removeItem('isPanitia'); localStorage.removeItem('isOwner'); localStorage.removeItem('currentUser'); }} className="h-8 px-4 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold">Logout</button></>:<button onClick={()=>setShowPanitiaLogin(true)} className="h-10 px-5 rounded-full bg-[#C1272D] font-black text-[13px]">Login Panitia</button>}</div></div>

          {!isPanitia ? (
            <div className="p-10 text-center"><div className="h-16 w-16 mx-auto rounded-full bg-white/10 grid place-items-center text-2xl">🔒</div><p className="mt-4 font-bold">Akses terbatas Panitia</p><p className="text-[12px] opacity-60 mt-1 max-w-md mx-auto">Login dengan username & password terpisah. Owner bisa kontrol semua tanpa kecuali.</p><button onClick={()=>setShowPanitiaLogin(true)} className="mt-5 h-10 px-6 rounded-full bg-white text-zinc-900 font-black text-[13px]">Masuk</button></div>
          ) : (
            <>
              <div className="flex gap-1 p-2 bg-black/40 overflow-x-auto scrollbar-hide">
                {[
                  {id:'overview',label:'📊 Overview'},
                  {id:'peserta',label:'👥 Peserta'},
                  {id:'keuangan',label:'💰 Keuangan'},
                  {id:'pengeluaran',label:' Pengeluaran'},
                  {id:'donasi',label:'❤️ Donasi'},
                  {id:'gallery',label:'🖼️ Gallery'},
                  {id:'inventory',label:'📦 Inventory'},
                  {id:'supabase',label: isOwner ? '🗄️ Supabase (Owner)' : '🗄️ Supabase'},
                ].map(t=>(
                  <button key={t.id} onClick={()=>setAdminTab(t.id as any)} className={`whitespace-nowrap px-4 py-2 rounded-full text-[12px] font-bold transition ${adminTab===t.id?'bg-white text-zinc-900':'bg-white/10 text-white/70 hover:bg-white/15'}`}>{t.label}</button>
                ))}
              </div>
              <div className="p-4 bg-black/20 border-t border-white/10 flex flex-wrap gap-2">
                <button onClick={downloadKeuangan} className="h-8 px-3 rounded-full bg-emerald-600 text-white text-[10px] font-bold">📥 Unduh Keuangan CSV</button>
                <button onClick={exportCSV} className="h-8 px-3 rounded-full bg-blue-600 text-white text-[10px] font-bold">📥 Unduh Peserta CSV</button>
                <button onClick={downloadDonasi} className="h-8 px-3 rounded-full bg-pink-600 text-white text-[10px] font-bold">📥 Unduh Donasi CSV</button>
                <button onClick={downloadInventory} className="h-8 px-3 rounded-full bg-purple-600 text-white text-[10px] font-bold">📥 Unduh Inventory CSV</button>
                <button onClick={downloadPengeluaran} className="h-8 px-3 rounded-full bg-orange-600 text-white text-[10px] font-bold">📥 Unduh Pengeluaran CSV</button>
              </div>
              <div className="p-5 md:p-6 bg-[#121212]">
                {adminTab==='overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><div className="text-[22px] font-black text-[#C1272D]">{participants.length}</div><div className="text-[11px] font-bold">Total Peserta</div><div className="text-[10px] text-zinc-500">13 data contoh request</div></div>
                      <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><div className="text-[16px] font-black text-emerald-700">{formatRupiah(totalDana)}</div><div className="text-[11px] font-bold">Total Dana</div></div>
                      <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><div className="text-[16px] font-black text-blue-600">{formatRupiah(funding.filter(f=>f.kategori==='iuran').reduce((s,f)=>s+f.jumlah,0))}</div><div className="text-[11px] font-bold">Iuran Warga</div></div>
                      <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><div className="text-[16px] font-black text-pink-600">{formatRupiah(donors.reduce((s,d)=>s+d.jumlah,0))}</div><div className="text-[11px] font-bold">Donasi</div></div>
                      <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><div className="text-[16px] font-black text-purple-600">{formatRupiah(funding.filter(f=>f.kategori==='sponsor').reduce((s,f)=>s+f.jumlah,0))}</div><div className="text-[11px] font-bold">Sponsor</div></div>
                    </div>
                  </div>
                )}
                {adminTab==='peserta' && (
                  <div>
                    <div className="flex justify-between items-center"><h3 className="font-black">Data Peserta ({participants.length}) — Bisa daftar lebih dari 1 lomba per nama/telp/rumah</h3><button onClick={exportCSV} className="h-8 px-3 rounded-full bg-white text-zinc-900 text-[11px] font-bold">Export CSV</button></div>
                    <div className="mt-4 overflow-x-auto rounded-xl border border-white/10"><table className="w-full text-[12px] min-w-[720px]"><thead><tr className="bg-white/10 text-[10px] uppercase"><th className="text-left px-3 py-2">ID</th><th className="text-left px-3 py-2">Nama</th><th className="text-left px-3 py-2">RT</th><th className="text-left px-3 py-2">HP</th><th className="text-left px-3 py-2">Lomba</th><th className="text-right px-3 py-2">Aksi</th></tr></thead><tbody>{participants.map(p=>(<tr key={p.id} className="border-b border-white/5 hover:bg-white/5"><td className="px-3 py-2 font-mono text-[11px]">{p.id}</td><td className="px-3 py-2 font-bold">{p.name}</td><td className="px-3 py-2">{p.rt}</td><td className="px-3 py-2">{maskHp(p.hp)}</td><td className="px-3 py-2 max-w-[200px] truncate">{p.lomba.join(', ')}</td><td className="px-3 py-2 text-right flex gap-1 justify-end"><button onClick={()=>setEditParticipant(p)} className="h-7 px-2 rounded-full bg-white/10 border text-[11px]">Edit (Replace)</button><button onClick={()=>{ setParticipants(participants.filter(x=>x.id!==p.id)); }} className="h-7 px-2 rounded-full bg-red-500 text-white text-[11px]">Hapus</button></td></tr>))}</tbody></table></div>
                    {editParticipant && (<div className="mt-4 bg-white text-zinc-900 rounded-2xl p-4"><h4 className="font-black text-[13px]">Edit Peserta {editParticipant.id} — Replace langsung, tidak duplikat</h4><div className="mt-3 grid sm:grid-cols-2 gap-3"><input value={editParticipant.name} onChange={e=>setEditParticipant({...editParticipant, name:e.target.value})} className="h-10 px-3 rounded-xl border text-[13px]" placeholder="Nama"/><input value={editParticipant.rt} onChange={e=>setEditParticipant({...editParticipant, rt:e.target.value})} className="h-10 px-3 rounded-xl border text-[13px]" placeholder="RT / No Rumah"/><input value={editParticipant.hp} onChange={e=>setEditParticipant({...editParticipant, hp:e.target.value})} className="h-10 px-3 rounded-xl border text-[13px]" placeholder="No Telp"/><input value={editParticipant.lomba.join(', ')} onChange={e=>setEditParticipant({...editParticipant, lomba:e.target.value.split(',').map(x=>x.trim())})} className="h-10 px-3 rounded-xl border text-[13px]" placeholder="Lomba pisah koma"/></div><div className="mt-3 flex gap-2"><button onClick={()=>{ setParticipants(participants.map(x=>x.id===editParticipant.id?editParticipant:x)); setEditParticipant(null); }} className="h-9 px-4 rounded-full bg-[#C1272D] text-white font-bold text-[12px]">Simpan Replace</button><button onClick={()=>setEditParticipant(null)} className="h-9 px-4 rounded-full bg-zinc-100 border font-bold text-[12px]">Batal</button></div></div>)}
                  </div>
                )}
                {adminTab==='keuangan' && (
                  <div className="space-y-4">
                    <div className="grid lg:grid-cols-2 gap-4">
                      <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Tambah Keuangan</h4><div className="mt-3 space-y-2"><input value={newFunding.sumber} onChange={e=>setNewFunding({...newFunding, sumber:e.target.value})} placeholder="Sumber dana" className="w-full h-10 px-3 rounded-xl border text-[12px]" /><div className="grid grid-cols-3 gap-2"><input type="number" value={newFunding.jumlah} onChange={e=>setNewFunding({...newFunding, jumlah:e.target.value})} placeholder="Jumlah Rp" className="h-10 px-3 rounded-xl border text-[12px]" /><select value={newFunding.kategori} onChange={e=>setNewFunding({...newFunding, kategori:e.target.value as any})} className="h-10 px-2 rounded-xl border text-[11px] font-bold"><option value="iuran">Iuran</option><option value="donasi">Donasi</option><option value="sponsor">Sponsor</option><option value="donatur">Donatur</option><option value="kas">Kas</option></select><select value={newFunding.metode} onChange={e=>setNewFunding({...newFunding, metode:e.target.value as any})} className="h-10 px-2 rounded-xl border text-[11px] font-bold"><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="qris">QRIS</option></select></div><button onClick={saveFunding} className="w-full h-10 rounded-xl bg-[#C1272D] text-white font-black text-[12px]">Tambah</button></div></div>
                      <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Tambah Donasi</h4><div className="mt-3 space-y-2"><input value={cashDonasi.nama} onChange={e=>setCashDonasi({...cashDonasi, nama:e.target.value})} placeholder="Nama donatur" className="w-full h-10 px-3 rounded-xl border text-[12px]" /><div className="grid grid-cols-2 gap-2"><input type="number" value={cashDonasi.jumlah} onChange={e=>setCashDonasi({...cashDonasi, jumlah:e.target.value})} placeholder="Jumlah Rp" className="h-10 px-3 rounded-xl border text-[12px]" /><select value={cashDonasi.metode} onChange={e=>setCashDonasi({...cashDonasi, metode:e.target.value as any})} className="h-10 px-3 rounded-xl border text-[11px] font-bold"><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="qris">QRIS</option></select></div><button onClick={saveCashDonasi} className="w-full h-10 rounded-xl bg-emerald-600 text-white font-black text-[12px]">Tambah</button></div></div>
                    </div>
                    <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Daftar Keuangan — {funding.length} data — Total {formatRupiah(totalDana)}</h4><div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">{funding.map(f=>(<div key={f.id} className="flex justify-between items-center p-3 rounded-xl border bg-zinc-50"><div><div className="font-bold text-[12px]">{f.sumber}</div><div className="text-[11px] text-zinc-500">{formatRupiah(f.jumlah)} • {f.kategori} • {f.metode}</div></div><button onClick={()=>setFunding(funding.filter(x=>x.id!==f.id))} className="h-7 px-3 rounded-full bg-red-500 text-white text-[11px]">Hapus</button></div>))}</div></div>
                  </div>
                )}
                {adminTab==='donasi' && (
                  <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Donasi Masuk ({donors.length})</h4><div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto">{donors.map(d=>(<div key={d.id} className="flex justify-between p-3 rounded-xl border bg-zinc-50"><div><div className="font-bold text-[12px]">{d.name}</div><div className="text-[11px] text-zinc-500">{d.alamat} • {d.waktu}</div></div><div className="font-mono font-black text-emerald-700">{formatRupiah(d.jumlah)}</div></div>))}</div></div>
                )}
                {adminTab==='inventory' && (
                  <div className="space-y-4">
                    <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">📦 Tambah Inventory Peralatan & Aksesoris Panitia</h4><p className="text-[11px] text-zinc-500 mt-1">Kelola peralatan, aksesoris, dekorasi, sound — bisa diinput/edit via Admin Panitia, tampil di halaman Inventory (header menu)</p><div className="mt-3 grid md:grid-cols-6 gap-2"><input value={newInventory.nama} onChange={e=>setNewInventory({...newInventory, nama:e.target.value})} placeholder="Nama peralatan" className="h-10 px-3 rounded-xl border text-[12px] col-span-2" /><select value={newInventory.kategori} onChange={e=>setNewInventory({...newInventory, kategori:e.target.value as any})} className="h-10 px-2 rounded-xl border text-[11px] font-bold"><option value="peralatan">Peralatan</option><option value="aksesoris">Aksesoris</option><option value="dekorasi">Dekorasi</option><option value="sound">Sound</option><option value="lainnya">Lainnya</option></select><input type="number" value={newInventory.jumlah} onChange={e=>setNewInventory({...newInventory, jumlah:e.target.value})} placeholder="Jumlah" className="h-10 px-3 rounded-xl border text-[12px]" /><select value={newInventory.kondisi} onChange={e=>setNewInventory({...newInventory, kondisi:e.target.value as any})} className="h-10 px-2 rounded-xl border text-[11px] font-bold"><option value="baik">Baik</option><option value="rusak">Rusak</option><option value="hilang">Hilang</option></select><input value={newInventory.lokasi} onChange={e=>setNewInventory({...newInventory, lokasi:e.target.value})} placeholder="Lokasi" className="h-10 px-3 rounded-xl border text-[12px]" /></div><div className="mt-2 grid md:grid-cols-[1fr_200px] gap-2"><input value={newInventory.penanggungJawab} onChange={e=>setNewInventory({...newInventory, penanggungJawab:e.target.value})} placeholder="Penanggung Jawab" className="h-10 px-3 rounded-xl border text-[12px]" /><button onClick={()=>{
                      if(!newInventory.nama||!newInventory.jumlah) return alert('Lengkapi nama & jumlah');
                      const ni:any = { id:`inv-${Date.now()}`, nama:newInventory.nama, kategori:newInventory.kategori, jumlah:Number(newInventory.jumlah), kondisi:newInventory.kondisi, lokasi:newInventory.lokasi||'Gudang RT', penanggungJawab:newInventory.penanggungJawab||currentUser?.nama||'Panitia' };
                      setInventory(prev=>[ni, ...prev]);
                      setNewInventory({ nama:'', kategori:'peralatan', jumlah:'', kondisi:'baik', lokasi:'', penanggungJawab:'' });
                      (async()=>{ try{ const admin=getSupabaseAdmin(); await admin.from('inventory').insert([{ nama:ni.nama, kategori:ni.kategori, jumlah:ni.jumlah, kondisi:ni.kondisi, lokasi:ni.lokasi, penanggung_jawab:ni.penanggungJawab }]); }catch{} })();
                    }} className="h-10 rounded-xl bg-[#C1272D] text-white font-black text-[12px]">+ Tambah Inventory</button></div></div>
                    <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Daftar Inventory — {inventory.length} item — bisa edit via Admin Panitia</h4><div className="mt-3 grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">{inventory.map(it=>(
                      <div key={it.id} className="border rounded-xl p-3 bg-zinc-50"><div className="flex justify-between items-start"><span className={`text-[10px] px-2 py-1 rounded-full font-bold ${it.kategori==='peralatan'?'bg-blue-50 text-blue-600':it.kategori==='aksesoris'?'bg-pink-50 text-pink-600':'bg-zinc-100'}`}>{it.kategori}</span><span className={`text-[10px] px-2 py-1 rounded-full font-bold ${it.kondisi==='baik'?'bg-emerald-50 text-emerald-600':'bg-red-50 text-red-600'}`}>{it.kondisi}</span></div><div className="font-bold text-[13px] mt-2">{it.nama}</div><div className="text-[11px] text-zinc-500 mt-1">Jumlah: {it.jumlah} • Lokasi: {it.lokasi} • PJ: {it.penanggungJawab}</div><div className="mt-2 flex gap-2"><button onClick={()=>{
                        const nama = prompt('Edit nama', it.nama); if(!nama) return; setInventory(prev=>prev.map(x=>x.id===it.id?{...x, nama}:x));
                      }} className="flex-1 h-7 rounded-full bg-white border text-[11px] font-bold">Edit</button><button onClick={()=>setInventory(prev=>prev.filter(x=>x.id!==it.id))} className="flex-1 h-7 rounded-full bg-red-500 text-white text-[11px] font-bold">Hapus</button></div></div>
                    ))}</div></div>
                  </div>
                )}
                {adminTab==='pengeluaran' && (
                  <div className="space-y-4">
                    <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">💰 Tambah Pengeluaran (Pembelian/Pembayaran)</h4><div className="mt-3 grid md:grid-cols-6 gap-2"><input value={newPengeluaran.nama} onChange={e=>setNewPengeluaran({...newPengeluaran, nama:e.target.value})} placeholder="Nama pengeluaran" className="h-10 px-3 rounded-xl border text-[12px] col-span-2" /><select value={newPengeluaran.kategori} onChange={e=>setNewPengeluaran({...newPengeluaran, kategori:e.target.value as any})} className="h-10 px-2 rounded-xl border text-[11px] font-bold"><option value="hadiah">Hadiah Lomba</option><option value="konsumsi">Konsumsi</option><option value="dekorasi">Dekorasi</option><option value="jasa">Jasa (Sound/MC)</option><option value="logistik">Logistik</option><option value="lainnya">Lainnya</option></select><input type="number" value={newPengeluaran.jumlah} onChange={e=>setNewPengeluaran({...newPengeluaran, jumlah:e.target.value})} placeholder="Jumlah Rp" className="h-10 px-3 rounded-xl border text-[12px]" /><select value={newPengeluaran.metode} onChange={e=>setNewPengeluaran({...newPengeluaran, metode:e.target.value as any})} className="h-10 px-2 rounded-xl border text-[11px] font-bold"><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="qris">QRIS</option></select><input value={newPengeluaran.penerima} onChange={e=>setNewPengeluaran({...newPengeluaran, penerima:e.target.value})} placeholder="Penerima" className="h-10 px-3 rounded-xl border text-[12px]" /></div><div className="mt-2 grid md:grid-cols-[1fr_200px] gap-2"><input value={newPengeluaran.catatan} onChange={e=>setNewPengeluaran({...newPengeluaran, catatan:e.target.value})} placeholder="Catatan (opsional)" className="h-10 px-3 rounded-xl border text-[12px]" /><button onClick={savePengeluaran} className="h-10 rounded-xl bg-orange-600 text-white font-black text-[12px]">+ Tambah Pengeluaran</button></div></div>
                    <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Daftar Pengeluaran — {pengeluaran.length} transaksi — Total: {formatRupiah(pengeluaran.reduce((s,p)=>s+p.jumlah,0))}</h4><div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto">{pengeluaran.map(p=>(<div key={p.id} className="flex justify-between items-center p-3 rounded-xl border bg-zinc-50"><div><div className="font-bold text-[12px]">{p.nama}</div><div className="text-[11px] text-zinc-500">{formatRupiah(p.jumlah)} • {p.kategori} • {p.metode} • {p.penerima||'-'}</div><div className="text-[10px] text-zinc-400">{p.catatan||''}</div></div><button onClick={()=>setPengeluaran(pengeluaran.filter(x=>x.id!==p.id))} className="h-7 px-3 rounded-full bg-red-500 text-white text-[11px]">Hapus</button></div>))}</div><div className="mt-3 flex gap-2"><button onClick={downloadPengeluaran} className="h-8 px-4 rounded-full bg-orange-600 text-white text-[11px] font-bold">📥 Unduh Rincian Pengeluaran CSV</button></div></div>
                  </div>
                )}
                {adminTab==='gallery' && (
                  <div className="space-y-4">
                    <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Tambah Gallery — Warga bisa upload foto</h4><div className="mt-3 space-y-2">
                      <input id="gal-title" placeholder="Judul foto/video" className="w-full h-10 px-3 rounded-xl border text-[12px]" />
                      <input type="file" accept="image/*,video/*" id="gal-file" className="w-full text-[11px] border rounded-xl p-2" onChange={(e)=>{
                        const file = (e.target as HTMLInputElement).files?.[0]; if(!file) return;
                        const reader = new FileReader(); reader.onload = (ev)=>{
                          const dataUrl = ev.target?.result as string;
                          const isVideo = file.type.startsWith('video');
                          const titleInput = document.getElementById('gal-title') as HTMLInputElement;
                          const title = titleInput.value || file.name;
                          setGallery([{ id:`g-${Date.now()}`, title, src:dataUrl, type: isVideo ? 'video' : 'image', credit: 'Upload Warga — Dokumentasi Acara' } as any, ...gallery]);
                          alert('Foto/video warga berhasil ditambah! Realtime di galeri.');
                        }; reader.readAsDataURL(file);
                      }} />
                      <div className="text-[10px] text-zinc-500">Atau pakai URL:</div>
                      <input id="gal-src" placeholder="URL Gambar atau YouTube" className="w-full h-10 px-3 rounded-xl border text-[12px]" />
                      <select id="gal-type" className="w-full h-10 px-3 rounded-xl border text-[12px]"><option value="image">Image</option><option value="video">Video</option></select>
                      <button onClick={()=>{ const t=(document.getElementById('gal-title') as HTMLInputElement).value; const s=(document.getElementById('gal-src') as HTMLInputElement).value; const ty=(document.getElementById('gal-type') as HTMLSelectElement).value as any; if(!t||!s){ alert('Lengkapi'); return; } setGallery([{ id:`g-${Date.now()}`, title:t, src:s, type:ty, credit:'Admin' } as any, ...gallery]); }} className="w-full h-10 rounded-xl bg-[#C1272D] text-white font-black text-[12px]">Tambah via URL</button>
                    </div></div>
                    <div className="bg-white text-zinc-900 rounded-2xl p-4 border">
                      <h4 className="font-black text-[13px]">🏪 Kelola Sponsor (Slideshow Gambar & Teks)</h4>
                      <div className="mt-3 grid md:grid-cols-4 gap-2">
                        <input value={newSponsor.nama} onChange={e=>setNewSponsor({...newSponsor, nama:e.target.value})} placeholder="Nama sponsor" className="h-10 px-3 rounded-xl border text-[12px] col-span-2" />
                        <input value={newSponsor.deskripsi} onChange={e=>setNewSponsor({...newSponsor, deskripsi:e.target.value})} placeholder="Deskripsi singkat" className="h-10 px-3 rounded-xl border text-[12px] col-span-2" />
                        <input value={newSponsor.logo} onChange={e=>setNewSponsor({...newSponsor, logo:e.target.value})} placeholder="Logo emoji/URL" className="h-10 px-3 rounded-xl border text-[12px]" />
                        <input value={newSponsor.website} onChange={e=>setNewSponsor({...newSponsor, website:e.target.value})} placeholder="Website" className="h-10 px-3 rounded-xl border text-[12px]" />
                        <button onClick={saveSponsor} className="h-10 rounded-xl bg-purple-600 text-white font-black text-[12px] col-span-2">+ Tambah Sponsor</button>
                      </div>
                      <div className="mt-3 grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto">{sponsors.map(s=>(<div key={s.id} className="border rounded-xl p-2 flex items-center gap-2 bg-zinc-50"><div className="h-10 w-10 rounded-lg bg-white overflow-hidden grid place-items-center text-[20px]">{typeof s.logo === 'string' && (s.logo.startsWith('/') || s.logo.startsWith('http')) ? <img src={s.logo} alt={s.nama} className="w-full h-full object-cover" /> : (s.logo||'🏪')}</div><div className="flex-1 min-w-0"><div className="font-bold text-[11px] truncate">{s.nama}</div><div className="text-[10px] text-zinc-500 truncate">{s.deskripsi}</div></div><button onClick={()=>setSponsors(sponsors.filter(x=>x.id!==s.id))} className="h-6 px-2 rounded-full bg-red-500 text-white text-[10px]">Hapus</button></div>))}</div>
                    </div>
                  </div>
                )}
                {adminTab==='supabase' && (
                  <div className="bg-white text-zinc-900 rounded-2xl p-5 border">
                    <h4 className="font-black">Supabase Config {isOwner ? '(Owner — kontrol semua)' : '(Panitia — tanpa fitur Supabase sensitif)'}</h4>
                    {!isOwner ? (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-[12px]"><div className="font-bold">Kolom Panitia tanpa fitur Supabase</div><div className="mt-1">Fitur Supabase (URL, Secret Key, SQL Editor, RLS) hanya untuk Owner. Panitia tetap bisa kelola Peserta, Keuangan, Donasi, Gallery secara lokal & realtime antar tab.</div></div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <div><label className="text-[11px] font-bold">URL</label><input value={supabaseUrlInput} onChange={e=>setSupabaseUrlInput(e.target.value)} className="mt-1 w-full h-11 px-4 rounded-xl border text-[12px] font-mono" /></div>
                        <div className="flex gap-2"><button onClick={()=>{ setSupabaseConfig(supabaseUrlInput); location.reload(); }} className="h-10 px-5 rounded-full bg-[#C1272D] text-white font-black text-[12px]">Simpan & Reload</button><button onClick={testSupabase} className="h-10 px-5 rounded-full bg-zinc-900 text-white font-black text-[12px]">Test Koneksi</button>{supabaseStatus==='ok'&&<span className="h-10 px-4 rounded-full bg-emerald-500 text-white grid place-items-center text-[11px] font-bold">✅ OK</span>}</div>
                        <div className="bg-zinc-50 border rounded-xl p-3 text-[11px] font-mono"><div className="font-black">SQL buat tabel:</div><pre className="mt-2 text-[10px] overflow-x-auto whitespace-pre-wrap">{`create table pendaftar (id uuid default gen_random_uuid() primary key, nama text, telepon text, rt text, lomba text, catatan text, created_at timestamp default now());
create table donasi (id uuid default gen_random_uuid() primary key, nama text, alamat text, jumlah int, pesan text, is_anon bool default false, created_at timestamp default now());
create table keuangan (id BIGSERIAL primary key, nama text, jenis text, jumlah bigint, keterangan text, is_anon bool default false, created_at timestamptz default now());
alter table keuangan enable row level security; create policy "public_all" on keuangan for all using (true) with check (true);`}</pre></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <footer className="bg-zinc-900 text-zinc-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-3 gap-8">
          <div><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-[#C1272D] text-white grid place-items-center font-black">81</div><div><div className="font-black text-white">HUT RI Ke-81</div><div className="text-[11px]">Perumahan Ciptaland Blok Mawar<br/>RT 002 / RW 014</div></div></div><div className="mt-4 text-[12px]">📧 panitiahutri81.mawar002@gmail.com</div></div>
          <div><div className="font-bold text-white">📸 Galeri • 🔒 Panel Panitia</div><div className="mt-3 flex gap-2"><button onClick={()=>setShowGalleryPage(true)} className="text-[12px] underline">Galeri</button><span>•</span><button onClick={()=>setShowPanitiaLogin(true)} className="text-[12px] underline">Panel Panitia</button></div></div>
          <div><div className="text-[11px]">© 2026 Panitia HUT RI ke-81 — Perumahan Ciptaland Blok Mawar 🇮🇩</div><div className="mt-3 flex gap-2 text-[10px] opacity-60"><span>Donatur</span><span>•</span><span>Sponsor</span><span>•</span><span>Donasi</span></div></div>
        </div>
      </footer>

      <div className="fixed bottom-4 right-4 z-40">
        <div className="flex flex-col items-end gap-2">
          {showWA && (<div className="mb-2 bg-white rounded-2xl shadow-xl border p-3 w-[260px] space-y-2"><div className="text-[11px] font-black uppercase">Hubungi Panitia</div>{[{label:'Penanggung Jawab',hp:'0821-7129-9984'},{label:'Ketua Panitia',hp:'0812-8839-5550'},{label:'Wakil Ketua',hp:'0831-8395-0205'}].map(c=>(<a key={c.hp} href={`https://wa.me/${c.hp.replace(/\D/g,'')}`} target="_blank" className="flex justify-between items-center bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl p-2.5"><span className="text-[11px] font-bold text-zinc-700">{c.label}<br/><span className="font-mono">{c.hp}</span></span><span className="h-8 w-8 rounded-full bg-[#25D366] text-white grid place-items-center"><svg viewBox="0 0 24 24" className="h-5 w-5 fill-white"><path d="M19.11 4.93C16.66 2.48 13.44 1.04 10.05 1c-6.87 0-12.47 5.6-12.47 12.47 0 2.19.57 4.33 1.66 6.22L0 24l4.49-1.18a12.38 12.38 0 005.56 1.33h.01c6.87 0 12.47-5.6 12.47-12.47 0-3.33-1.3-6.46-3.65-8.81l-.77-.14zM10.05 21.3a10.3 10.3 0 01-5.25-1.44l-.38-.22-2.67.7.7-2.6-.24-.4a10.24 10.24 0 01-1.58-5.57c0-5.66 4.61-10.27 10.28-10.27 2.75 0 5.33 1.07 7.27 3.02a10.2 10.2 0 013.02 7.27c0 5.66-4.61 10.27-10.27 10.27l-.88-.04zm5.64-7.62c-.31-.15-1.83-.9-2.11-1-.28-.1-.48-.16-.68.15-.2.31-.78 1-.96 1.2-.18.2-.36.23-.67.08-.31-.15-1.3-.48-2.47-1.53-.91-.81-1.53-1.81-1.71-2.12-.18-.31-.02-.48.13-.63.14-.14.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.54-.08-.15-.68-1.64-.93-2.24-.25-.59-.5-.51-.68-.52h-.58c-.2 0-.54.08-.82.38-.28.31-1.07 1.04-1.07 2.54s1.1 2.94 1.25 3.15c.15.2 2.16 3.3 5.23 4.63.73.31 1.3.5 1.75.64.73.23 1.4.2 1.93.12.59-.09 1.83-.75 2.09-1.47.26-.72.26-1.34.18-1.47-.08-.13-.28-.2-.59-.36z"/></svg></span></a>))}</div>)}
          <button onClick={()=>setShowWA(!showWA)} className="h-14 w-14 rounded-full bg-[#25D366] shadow-[0_8px_24px_rgba(37,211,102,0.4)] grid place-items-center hover:scale-105 transition">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white"><path d="M19.11 4.93C16.66 2.48 13.44 1.04 10.05 1c-6.87 0-12.47 5.6-12.47 12.47 0 2.19.57 4.33 1.66 6.22L0 24l4.49-1.18a12.38 12.38 0 005.56 1.33h.01c6.87 0 12.47-5.6 12.47-12.47 0-3.33-1.3-6.46-3.65-8.81l-.77-.14zM10.05 21.3a10.3 10.3 0 01-5.25-1.44l-.38-.22-2.67.7.7-2.6-.24-.4a10.24 10.24 0 01-1.58-5.57c0-5.66 4.61-10.27 10.28-10.27 2.75 0 5.33 1.07 7.27 3.02a10.2 10.2 0 013.02 7.27c0 5.66-4.61 10.27-10.27 10.27l-.88-.04zm5.64-7.62c-.31-.15-1.83-.9-2.11-1-.28-.1-.48-.16-.68.15-.2.31-.78 1-.96 1.2-.18.2-.36.23-.67.08-.31-.15-1.3-.48-2.47-1.53-.91-.81-1.53-1.81-1.71-2.12-.18-.31-.02-.48.13-.63.14-.14.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.02-.54-.08-.15-.68-1.64-.93-2.24-.25-.59-.5-.51-.68-.52h-.58c-.2 0-.54.08-.82.38-.28.31-1.07 1.04-1.07 2.54s1.1 2.94 1.25 3.15c.15.2 2.16 3.3 5.23 4.63.73.31 1.3.5 1.75.64.73.23 1.4.2 1.93.12.59-.09 1.83-.75 2.09-1.47.26-.72.26-1.34.18-1.47-.08-.13-.28-.2-.59-.36z"/></svg>
          </button>
        </div>
      </div>

      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur" onClick={()=>setShowRegister(false)} />
          <div className="relative w-full max-w-[520px] bg-white rounded-t-[24px] sm:rounded-[24px] max-h-[92vh] overflow-y-auto p-5">
            <div className="flex justify-between"><div><h3 className="font-black">Daftar Lomba HUT RI 81</h3><p className="text-[11px] text-emerald-600 font-bold">Bisa daftar lebih dari 1 lomba — pakai nama, no telp dan no rumah yang sama</p></div><button onClick={()=>setShowRegister(false)} className="h-8 w-8 rounded-full bg-zinc-100 grid place-items-center">✕</button></div>
            <form onSubmit={handleRegister} className="mt-4 space-y-3">
              <input required value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="Nama Lengkap *" className="w-full h-11 px-4 rounded-xl border text-[13px]" />
              <div className="grid grid-cols-2 gap-2"><input required value={formData.hp} onChange={e=>setFormData({...formData, hp:e.target.value})} placeholder="No Telp / WA *" className="h-11 px-4 rounded-xl border text-[13px]" /><input required value={formData.rt} onChange={e=>setFormData({...formData, rt:e.target.value})} placeholder="No Rumah / RT 002 / Blok *" className="h-11 px-4 rounded-xl border text-[13px]" /></div>
              <div className="text-[11px] font-bold uppercase">Pilih Lomba — bisa lebih dari 1 ({formData.lomba.length})</div>
              <div className="grid gap-1.5 max-h-[180px] overflow-y-auto p-1">{LOMBA_DATA.map(l=>(<label key={l.id} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-[12px] ${formData.lomba.includes(l.title)?'bg-[#F9E2E2] border-[#C1272D] font-bold text-[#C1272D]':'bg-zinc-50 border-zinc-200'}`}><input type="checkbox" checked={formData.lomba.includes(l.title)} onChange={e=>{ if(e.target.checked) setFormData({...formData, lomba:[...formData.lomba,l.title]}); else setFormData({...formData, lomba:formData.lomba.filter(x=>x!==l.title)}); }} />{l.title}</label>))}</div>
              <button type="submit" disabled={isSubmitting} className={`w-full h-11 rounded-full font-black text-[13px] flex items-center justify-center gap-2 ${isSubmitting?'bg-zinc-300 text-zinc-600':'bg-[#C1272D] text-white'}`}>{isSubmitting?'⏳ Mendaftarkan...':'✅ Daftar Lomba (Bisa Lebih dari 1)'}</button>
            </form>
          </div>
        </div>
      )}

      {showLomba && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur" onClick={()=>setShowLomba(null)} />
          <div className="relative w-full max-w-[560px] bg-white rounded-[20px] p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between"><div className="h-12 w-12 rounded-2xl bg-[#F9E2E2] text-[#C1272D] grid place-items-center text-xl">{showLomba.emoji}</div><button onClick={()=>setShowLomba(null)} className="h-8 w-8 rounded-full bg-zinc-100 grid place-items-center">✕</button></div>
            <h3 className="mt-4 font-black text-[18px]">{showLomba.title}</h3>
            <div className="text-[11px] text-zinc-500 mt-1">{showLomba.kategori} • {showLomba.waktu} • {showLomba.hadiah}</div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
              <div className="bg-zinc-50 border rounded-xl p-3"><div className="text-zinc-400 text-[10px] uppercase font-bold">Peserta</div><div className="font-bold mt-1">{showLomba.peserta}</div></div>
              <div className="bg-zinc-50 border rounded-xl p-3"><div className="text-zinc-400 text-[10px] uppercase font-bold">Waktu</div><div className="font-bold mt-1">{showLomba.waktu}</div></div>
              <div className="bg-zinc-50 border rounded-xl p-3"><div className="text-zinc-400 text-[10px] uppercase font-bold">Hadiah</div><div className="font-bold mt-1">{showLomba.hadiah}</div></div>
            </div>
            <div className="mt-4 bg-[#FFF7ED] border rounded-xl p-4">
              <div className="font-bold text-[12px] mb-2">Deskripsi & Tata Cara</div>
              <div className="text-[12px] text-zinc-700 leading-6 whitespace-pre-line">{showLomba.deskripsi.replace(/\. /g, '.\n')}</div>
            </div>
            <div className="mt-5 flex gap-2"><button onClick={()=>setShowLomba(null)} className="flex-1 h-10 rounded-full bg-zinc-100 border font-bold text-[12px]">Tutup</button><button onClick={()=>{ setFormData(f=>({ ...f, lomba:[...f.lomba,showLomba.title] })); setShowLomba(null); setShowRegister(true); }} className="flex-1 h-10 rounded-full bg-[#C1272D] text-white font-bold text-[12px]">📝 Daftar</button></div>
          </div>
        </div>
      )}
      {showDetail && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-zinc-900/60 backdrop-blur" onClick={()=>setShowDetail(null)} /><div className="relative w-full max-w-[480px] bg-white rounded-[20px] p-5"><div className="flex justify-between"><h3 className="font-black text-[14px]">{(ANGGARAN_DETAIL as any)[showDetail]?.title}</h3><button onClick={()=>setShowDetail(null)} className="h-8 w-8 rounded-full bg-zinc-100 grid place-items-center">✕</button></div><div className="mt-4 space-y-2">{(ANGGARAN_DETAIL as any)[showDetail]?.items.map((it:any,i:number)=>(<div key={i} className="flex justify-between text-[12px] p-2.5 rounded-xl bg-zinc-50 border"><span>{it.nama} ({it.qty})</span><span className="font-mono font-bold">{formatRupiah(it.harga)}</span></div>))}</div></div></div>)}
      {showPanitiaLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur" onClick={()=>setShowPanitiaLogin(false)} />
          <div className="relative w-full max-w-[380px] bg-white rounded-[20px] p-6 shadow-2xl">
            <h3 className="font-black">🔒 Login Panel Panitia</h3>
            <p className="text-[11px] text-zinc-500 mt-1">Pisah Password — Panitia & Owner kontrol penuh</p>
            <div className="mt-3 bg-zinc-50 border rounded-xl p-3 text-[10px] leading-4">
              <div className="font-bold">Panitia:</div>
              <div>admin / mawar81 (Administrator)</div>
              <div>eka / pj2026! , bayu / ketua2026! , aulia / bendahara2026!</div>
              <div>sugiono / wakil2026! , lani / sekretaris2026! , puput / bendahara2!</div>
              <div className="mt-2 font-bold">Owner:</div>
              <div>owner / owner81 , superadmin / super2026!</div>
            </div>
            <form onSubmit={(e)=>{ e.preventDefault(); loginPanitia(); }}>
              <input value={loginUsername} onChange={e=>setLoginUsername(e.target.value)} placeholder="Username (admin/eka/bayu/aulia...)" className="mt-4 w-full h-11 px-4 rounded-xl border text-[13px]" />
              <input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="Password" className="mt-3 w-full h-11 px-4 rounded-xl border text-[13px]" autoFocus />
              <button type="submit" className="mt-3 w-full h-11 rounded-xl bg-[#C1272D] text-white font-black text-[13px]">Masuk</button>
            </form>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={()=>{ setLoginUsername('admin'); setLoginPassword('mawar81'); }} className="h-8 rounded-full bg-zinc-100 border text-[11px] font-bold">admin/mawar81</button>
              <button onClick={()=>{ setLoginUsername('owner'); setLoginPassword('owner81'); }} className="h-8 rounded-full bg-zinc-900 text-white text-[11px] font-bold">owner/owner81</button>
            </div>
          </div>
        </div>
      )}

      {galleryZoom && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-6">
          <div className="absolute inset-0 bg-zinc-900/90 backdrop-blur-md" onClick={()=>setGalleryZoom(null)} />
          <div className="relative w-full max-w-[92vw] lg:max-w-[920px] max-h-[92vh] bg-white rounded-[20px] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-3 border-b bg-zinc-50"><div className="font-black text-[13px]">{(galleryZoom as any).title}</div><button onClick={()=>setGalleryZoom(null)} className="h-8 w-8 rounded-full bg-zinc-100 grid place-items-center">✕</button></div>
            <div className="flex-1 bg-zinc-950 flex items-center justify-center min-h-[320px]">
              {galleryZoom.type==='image' ? <img src={galleryZoom.src} alt={galleryZoom.title} className="max-w-full max-h-[78vh] object-contain" /> : <div className="w-full aspect-video bg-black">{galleryZoom.src.includes('.mp4') ? <video src={galleryZoom.src} controls autoPlay className="w-full h-full object-contain" /> : <iframe src={galleryZoom.src} className="w-full h-full" allowFullScreen />}</div>}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes float-slow{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}} .scrollbar-hide::-webkit-scrollbar{display:none} .custom-scrollbar::-webkit-scrollbar{width:6px;height:6px} .custom-scrollbar::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:999px}`}</style>
    </div>
  );
}
