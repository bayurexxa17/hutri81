import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase, getSupabaseAdmin, setSupabaseConfig, getSupabaseConfig } from './utils/supabaseClient';
import GalleryPage from './components/GalleryPage';

interface Participant { id: string; name: string; rt: string; hp: string; lomba: string[]; catatan: string; waktu: string; createdAt: number; }
interface Donor { id: string; name: string; alamat: string; jumlah: number; pesan: string; waktu: string; isAnon: boolean; }
interface Funding { id: string; sumber: string; jumlah: number; kategori: 'iuran'|'donasi'|'sponsor'|'donatur'|'kas'; status: 'confirmed'|'pending'; metode: 'cash'|'transfer'|'qris'; }
interface LombaItem { id: string; title: string; kategori: 'anak'|'ibu'|'bapak'|'remaja'|'keluarga'|'umum'; emoji: string; waktu: string; hadiah: string; peserta: string; deskripsi: string; }
interface GalleryItem { id: string; type: 'image'|'video'; src: string; title: string; credit?: string; thumb?: string; }

const LOMBA_DATA: LombaItem[] = [
  { id: 'kerupuk', title: 'Lomba Makan Kerupuk', kategori: 'anak', emoji: '🍘', waktu: '08:00 WIB', hadiah: 'Menarik', peserta: 'Usia 5-15 tahun', deskripsi: 'Makan kerupuk tanpa tangan untuk anak-anak' },
  { id: 'kelereng', title: 'Lomba Balap Kelereng', kategori: 'anak', emoji: '🔵', waktu: '08:30 WIB', hadiah: 'Menarik', peserta: 'Usia 7-15 tahun', deskripsi: 'Balap kelereng klasik' },
  { id: 'penguin-anak', title: 'Lomba Estafet Penguin Anak', kategori: 'anak', emoji: '🐧', waktu: '08:30 WIB', hadiah: 'Menarik', peserta: 'Tim 3 anak SD', deskripsi: 'Lomba Model Baru Keseruan dan Kekompakan' },
  { id: 'futsal', title: 'Futsal Mini', kategori: 'remaja', emoji: '⚽', waktu: '10:00 WIB', hadiah: 'Menarik', peserta: 'Tim 5 orang', deskripsi: 'Futsal Mini beregu' },
  { id: 'sambung', title: 'Salah Sambung', kategori: 'remaja', emoji: '🗣️', waktu: '10:00 WIB', hadiah: 'Menarik', peserta: 'Usia 13-17 tahun', deskripsi: 'Melatih Fokus dan Kekompakan' },
  { id: 'penguin-remaja', title: 'Lomba Estafet Penguin Remaja', kategori: 'remaja', emoji: '🐧', waktu: '10:00 WIB', hadiah: 'Menarik', peserta: 'Usia 13-17 tahun', deskripsi: 'Kekompakan remaja' },
  { id: 'tambang', title: 'Lomba Tarik Tambang', kategori: 'bapak', emoji: '💪', waktu: '11:00 WIB', hadiah: 'Menarik', peserta: 'Tim 8 orang', deskripsi: 'Adu kekuatan dan kekompakan' },
  { id: 'joget-bapak', title: 'Lomba Joget Kursi Bapak', kategori: 'bapak', emoji: '💃', waktu: '11:00 WIB', hadiah: 'Menarik', peserta: 'Bapak-bapak', deskripsi: 'Joget kursi bapak-bapak' },
  { id: 'tepung', title: 'Lomba Estafet Tepung', kategori: 'bapak', emoji: '🌾', waktu: '11:00 WIB', hadiah: 'Menarik', peserta: 'Tim 3 Orang', deskripsi: 'Estafet Tepung kekompakan' },
  { id: 'tumpeng', title: 'Lomba Hias Tumpeng', kategori: 'ibu', emoji: '🍛', waktu: '13:00 WIB', hadiah: 'Menarik', peserta: 'Ibu rumah tangga', deskripsi: 'Kreasi Para Ibu dengan Cita Rasa Terbaik' },
  { id: 'daster', title: 'Lomba Fashion Week Daster', kategori: 'ibu', emoji: '👗', waktu: '13:00 WIB', hadiah: 'Menarik', peserta: 'Ibu-ibu', deskripsi: 'Kreasikan Gaya Terbaik dan Terlucu' },
  { id: 'joget-ibu', title: 'Lomba Joget Kursi Ibu', kategori: 'ibu', emoji: '🪑', waktu: '13:00 WIB', hadiah: 'Menarik', peserta: 'Ibu-ibu', deskripsi: 'Joget kursi ibu-ibu' },
  { id: 'makeup', title: 'Lomba Make Up Buta', kategori: 'keluarga', emoji: '💄', waktu: '15:00 WIB', hadiah: 'Menarik', peserta: 'Pasangan', deskripsi: 'Make Up Buta kekompakan pasangan' },
];

const defaultParticipants: Participant[] = [
  { id: 'MWR81-0013', name: 'Rizki', rt: 'RT 02/blok mawar 102', hp: '08981234470', lomba: ['Lomba Joget Kursi Bapak'], catatan: 'Live join', waktu: '29/7/2026, 13:13:08', createdAt: Date.now()- 1000*60*1 },
  { id: 'MWR81-0012', name: 'Indah', rt: 'RT/ mawar 102', hp: '08211234882', lomba: ['Lomba Joget Kursi Ibu','Lomba Estafet Tepung','Lomba Hias Tumpeng'], catatan: 'Live join', waktu: '29/7/2026, 13:12:00', createdAt: Date.now()- 1000*60*2 },
  { id: 'MWR81-0011', name: 'Mam lala', rt: 'Mawar 83', hp: '08781234155', lomba: ['Lomba Joget Kursi Ibu'], catatan: 'Live join', waktu: '29/7/2026, 12:56:08', createdAt: Date.now()- 1000*60*5 },
  { id: 'MWR81-0010', name: 'nouren', rt: 'Mawar 127', hp: '08131234648', lomba: ['Lomba Makan Kerupuk','Lomba Estafet Penguin Anak','Lomba Balap Kelereng'], catatan: 'Live join', waktu: '29/7/2026, 12:24:58', createdAt: Date.now()- 1000*60*10 },
  { id: 'MWR81-0009', name: 'Dewi, indah, Evi', rt: 'RT002/Mawar83', hp: '087874419155', lomba: ['Lomba Estafet Tepung'], catatan: 'Live join', waktu: '29/7/2026, 09:50:29', createdAt: Date.now()- 1000*60*60 },
  { id: 'MWR81-0008', name: 'Evi,Dewi,indah,Andi Fitri,Cece', rt: '002/ Mawar 83', hp: '087874419155', lomba: ['Lomba Hias Tumpeng'], catatan: 'Live join', waktu: '29/7/2026, 09:47:32', createdAt: Date.now()- 1000*60*70 },
  { id: 'MWR81-0007', name: 'lifi', rt: 'Mawar 127', hp: '08238374207', lomba: ['Lomba Balap Kelereng','Lomba Estafet Penguin Anak'], catatan: 'Live join', waktu: '28/7/2026, 21:39:49', createdAt: Date.now()- 1000*60*80 },
  { id: 'MWR81-0006', name: 'alif', rt: 'Mawar 127', hp: '08238374207', lomba: ['Salah Sambung','Lomba Balap Kelereng'], catatan: 'Live join', waktu: '28/7/2026, 21:34:56', createdAt: Date.now()- 1000*60*90 },
  { id: 'MWR81-0005', name: 'lifi', rt: 'Mawar 127', hp: '08238374207', lomba: ['Lomba Balap Kelereng','Lomba Estafet Penguin Anak'], catatan: 'Live join', waktu: '28/7/2026, 21:33:00', createdAt: Date.now()- 1000*60*95 },
  { id: 'MWR81-0004', name: 'Lala', rt: 'Mawar 83', hp: '087874419155', lomba: ['Lomba Balap Kelereng','Salah Sambung','Lomba Estafet Penguin Remaja'], catatan: 'Live join', waktu: '28/7/2026, 20:57:57', createdAt: Date.now()- 1000*60*100 },
  { id: 'MWR81-0003', name: 'Abiyu Rexxa', rt: 'RT 002/58 Blok Mawar', hp: '081288395550', lomba: ['Lomba Makan Kerupuk'], catatan: 'Live join', waktu: '28/7/2026, 16:26:05', createdAt: Date.now()- 1000*60*120 },
  { id: 'MWR81-0002', name: 'Ameera Hanania R', rt: 'RT 002 / Blok Mawar', hp: '081299176369', lomba: ['Fashion Week Daster','Estafet Penguin Anak'], catatan: 'Live join', waktu: '29/7/2026, 20:04:03', createdAt: Date.now()- 1000*60*130 },
  { id: 'MWR81-0001', name: 'Fatimah Az Zahra', rt: 'RT 002 / Blok Mawar', hp: '081234567890', lomba: ['Makan Kerupuk','Balap Kelereng'], catatan: 'Live join', waktu: '29/7/2026, 20:04:03', createdAt: Date.now()- 1000*60*140 },
];

const defaultFunding = [
  { id: 'f1', sumber: 'Iuran Warga 50K/KK x 200 KK', jumlah: 10000000, kategori: 'iuran' as const, status: 'confirmed' as const, metode: 'cash' as const },
  { id: 'f2', sumber: 'Donasi Warga via DANA/SeaBank', jumlah: 5000000, kategori: 'donasi' as const, status: 'confirmed' as const, metode: 'transfer' as const },
  { id: 'f3', sumber: 'Sponsor UMKM Lokal', jumlah: 3000000, kategori: 'sponsor' as const, status: 'confirmed' as const, metode: 'transfer' as const },
  { id: 'f4', sumber: 'Kas RT 002', jumlah: 1000000, kategori: 'kas' as const, status: 'confirmed' as const, metode: 'cash' as const },
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
  { username: 'panitiaowner', password: 'ownerpanitia2026!', nama: 'Panitia Owner', role: 'owner' },
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

const PANITIA_LAIN = [
  { nama: 'Lani', jabatan: 'Sekretaris', hp: '0813-7116-2792' },
  { nama: 'Aulia Komari', jabatan: 'Bendahara 1', hp: '0812-3456-7892' },
  { nama: 'Puput', jabatan: 'Bendahara 2', hp: '0831-8330-3884' },
  { nama: 'Aryo', jabatan: 'Runner', hp: '0856-0134-31284' },
  { nama: 'M.Dzaki', jabatan: 'MC', hp: '0858-3660-5110' },
  { nama: 'M.Haikal', jabatan: 'MC', hp: '0853-5574-7998' },
  { nama: 'Agha', jabatan: 'Koordinator Lomba', hp: '0851-9433-4760' },
  { nama: 'Adib', jabatan: 'Koordinator Lomba', hp: '0813-6365-2626' },
  { nama: 'Hanif', jabatan: 'Koordinator Lomba', hp: '0881-3712-0796' },
  { nama: 'Satria', jabatan: 'Koordinator Lomba', hp: '0819-9201-0197' },
  { nama: 'Ridho Ananda', jabatan: 'Koordinator Lomba', hp: '0823-8718-8929' },
  { nama: 'Andre', jabatan: 'Koordinator Lomba', hp: '08xx-xxx-xxx' },
  { nama: 'Dio', jabatan: 'Koordinator Lomba', hp: '0813-7112-100' },
  { nama: 'Reza', jabatan: 'Koordinator Lomba', hp: '08xx-xxx-xxx' },
  { nama: 'Aryo', jabatan: 'Runner', hp: '0856-0134-31284' },
  { nama: 'Lukman', jabatan: 'MC', hp: '0853-xxxx-xxxx' },
];

const ANGGARAN_DATA = [
  { komponen: 'Total Anggaran — Pesta Rakyat (17 Agt)', jumlah: 10000000, detail: 'pesta-rakyat' },
  { komponen: 'Total Anggaran — Malam Puncak (22 Agt Malam)', jumlah: 7000000, detail: 'malam-puncak' },
  { komponen: 'TOTAL KEBUTUHAN ANGGARAN', jumlah: 17000000, total: true },
  { komponen: 'Total Dana Masuk (Pendanaan)', jumlah: 19000000, masuk: true, detail: 'dana-masuk' },
  { komponen: 'SELISIH (Dana Masuk - Kebutuhan)', jumlah: 2000000, selisih: true },
];

const ANGGARAN_DETAIL: any = {
  'pesta-rakyat': { title: 'Rincian Pesta Rakyat 17 Agt (10jt)', items: [{ nama: 'Hadiah Lomba', qty: '13 kategori', harga: 5000000 }, { nama: 'Konsumsi', qty: '200 pax', harga: 3000000 }, { nama: 'Dekorasi', qty: '1 paket', harga: 1500000 }, { nama: 'Sound', qty: '1 hari', harga: 500000 }]},
  'malam-puncak': { title: 'Rincian Malam Puncak (7jt)', items: [{ nama: 'Panggung & Lighting', qty: '1 set', harga: 3000000 }, { nama: 'Hadiah Utama', qty: '1 paket', harga: 2500000 }, { nama: 'Konsumsi Malam', qty: '150 pax', harga: 1000000 }, { nama: 'Dokumentasi', qty: '1 tim', harga: 500000 }]},
  'dana-masuk': { title: 'Rincian Dana Masuk (19jt)', items: [{ nama: 'Iuran Warga 50K/KK x 200 KK', qty: '200', harga: 10000000 }, { nama: 'Donasi via DANA/SeaBank', qty: 'realtime', harga: 5000000 }, { nama: 'Sponsor Lokal', qty: '5', harga: 3000000 }, { nama: 'Kas RT', qty: '1', harga: 1000000 }]},
};

const RUNDOWN = [
  { jam: '06:00', kegiatan: '📋 Persiapan Lokasi & Registrasi Peserta (Panitia & Peserta)', group: 'PAGI & PERLOMBAAN' },
  { jam: '07:00', kegiatan: '🇮🇩 Upacara Bendera & Pembukaan Resmi (Seluruh Warga)', group: 'PAGI & PERLOMBAAN' },
  { jam: '07:00', kegiatan: '🎤 Sambutan Ketua RT & Ketua Panitia (Undangan)', group: 'PAGI & PERLOMBAAN' },
  { jam: '08:00', kegiatan: '👶 Lomba Anak-anak (Makan Kerupuk, Balap Kelereng, Estafet Penguin) (Usia 5-15 tahun)', group: 'PAGI & PERLOMBAAN' },
  { jam: '10:00', kegiatan: '🧑 Lomba Remaja (Futsal Mini, Salah Sambung, Estafet Penguin) (Usia 13-17 tahun)', group: 'PAGI & PERLOMBAAN' },
  { jam: '11:00', kegiatan: '🪢 Lomba Bapak-bapak (Tarik Tambang, Joget Kursi, Estafet Tepung) (Bapak-bapak)', group: 'PAGI & PERLOMBAAN' },
  { jam: '12:00', kegiatan: '🍛 Istirahat, Sholat & Makan Siang (Seluruh Warga)', group: 'PAGI & PERLOMBAAN' },
  { jam: '13:00', kegiatan: '👗 Lomba Ibu-ibu (Hias Tumpeng, Fashion Daster, Joget Kursi) (Ibu-ibu)', group: 'PAGI & PERLOMBAAN' },
  { jam: '15:00', kegiatan: '👨‍👩‍👧 Lomba Keluarga (Make Up Buta) (Pasangan)', group: 'PAGI & PERLOMBAAN' },
  { jam: '16:00', kegiatan: '✅ Penutupan Seluruh Perlombaan & Persiapan Pengumuman Pemenang', group: 'PAGI & PERLOMBAAN' },
  { jam: '19:00', kegiatan: '🎊 Pembukaan Malam Puncak (MC & Panitia)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '19:30', kegiatan: '🎶 Hiburan Rakyat & Pentas Seni (Warga)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '20:00', kegiatan: '🏆 Pengumuman Pemenang & Penyerahan Hadiah (Seluruh Warga)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '20:30', kegiatan: '🍱 Penilaian Hias Tumpeng (Peserta Ibu-ibu)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '21:00', kegiatan: '🎁 Doorprize (Seluruh Warga)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '21:30', kegiatan: '🙏 Sambutan Penutup & Doa Bersama (Ketua RT & Panitia)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
  { jam: '22:00', kegiatan: '🏁 Penutupan Acara & Ramah Tamah (Seluruh Warga)', group: 'MALAM PUNCAK (22 AGUSTUS 2026)' },
];

const DEFAULT_GALLERY: any[] = [
  { id: 'g1', type: 'image', src: '/images/20260726_091521.jpg', title: 'Panjat Pinang — Lomba Tradisional 17 Agustus', credit: 'Dokumentasi Warga Blok Mawar' },
  { id: 'g2', type: 'image', src: 'https://images.pexels.com/photos/32293284/pexels-photo-32293284.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600', title: 'Lomba Tradisional Anak-anak HUT RI', credit: 'Yazid N / Pexels' },
  { id: 'g3', type: 'image', src: 'https://images.pexels.com/photos/33807987/pexels-photo-33807987.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600', title: 'Panjat Pinang — Semangat Kemerdekaan', credit: 'Rakhmat Suwandi / Pexels' },
  { id: 'g4', type: 'image', src: 'https://images.pexels.com/photos/13389844/pexels-photo-13389844.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600', title: 'Anak-anak Membawa Bendera Merah Putih', credit: 'Irgi Nur Fadil / Pexels' },
  { id: 'v1', type: 'video', src: 'https://videos.pexels.com/video-files/34373272/14563035_1920_1080_30fps.mp4', title: 'Karnaval 17 Agustus — Parade Desa', credit: 'just a hobby / Pexels' },
  { id: 'v2', type: 'video', src: 'https://videos.pexels.com/video-files/34373278/14563041_1920_1080_30fps.mp4', title: 'Karnaval 17 Agustus — Aerial View', credit: 'just a hobby / Pexels' },
];

function formatRupiah(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n); }
function maskHp(hp: string) { if (!hp || hp.length < 7) return hp; return hp.slice(0,4)+'****'+hp.slice(-3); }

export default function App() {
  const [countdown, setCountdown] = useState({ hari: 18, jam: 13, menit: 38, detik: 51 });
  useEffect(()=>{ const target=new Date('2026-08-17T06:00:00').getTime(); const t=setInterval(()=>{ const diff=target-Date.now(); if(diff<=0){ setCountdown({hari:0,jam:0,menit:0,detik:0}); return; } setCountdown({hari:Math.floor(diff/(1000*60*60*24)),jam:Math.floor((diff/(1000*60*60))%24),menit:Math.floor((diff/(1000*60))%60),detik:Math.floor((diff/1000)%60)}); },1000); return()=>clearInterval(t); },[]);

  const [participants, setParticipants] = useState<Participant[]>(()=>{ try{ const s=localStorage.getItem('hutri-participants-mawar'); if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>0) return p; } }catch{} return defaultParticipants; });
  const [donors, setDonors] = useState<Donor[]>(()=>{ try{ const s=localStorage.getItem('hutri-donors-mawar'); if(s){ const p=JSON.parse(s); if(Array.isArray(p)) return p; } }catch{} return []; });
  const [funding, setFunding] = useState<Funding[]>(()=>{ try{ const s=localStorage.getItem('hutri-funding-mawar'); if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>0) return p; } }catch{} return defaultFunding; });
  const [transaksi, setTransaksi] = useState<any[]>(()=>{ try{ const s=localStorage.getItem('hutri-transaksi'); if(s){ const p=JSON.parse(s); if(Array.isArray(p)) return p; } }catch{} return [{ id:'TRX-001', metode:'qris-dana', nama:'Hamba Allah', jumlah:150000, waktu:new Date().toLocaleString('id-ID'), status:'success', sumber:'QRIS DANA 0813****5007' }, { id:'TRX-002', metode:'transfer-seabank', nama:'Warga Blok Mawar', jumlah:50000, waktu:new Date().toLocaleString('id-ID'), status:'success', sumber:'SeaBank 901592977740' }]; });
  const [gallery, setGallery] = useState<any[]>(()=>{ try{ const s=localStorage.getItem('hutri-gallery'); if(s) return JSON.parse(s); }catch{} return DEFAULT_GALLERY; });
  const [selectedVideo, setSelectedVideo] = useState<any>(DEFAULT_GALLERY.find((g:any)=>g.type==='video')||null);

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
  const [adminTab, setAdminTab] = useState<'overview'|'peserta'|'keuangan'|'donasi'|'gallery'|'supabase'>('overview');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(getSupabaseConfig().url);
  const [supabaseStatus, setSupabaseStatus] = useState<'idle'|'testing'|'ok'|'fail'>('idle');
  const [editParticipant, setEditParticipant] = useState<Participant|null>(null);
  const [newFunding, setNewFunding] = useState({ sumber:'', jumlah:'', kategori:'iuran' as Funding['kategori'], metode:'cash' as Funding['metode'] });
  const [cashDonasi, setCashDonasi] = useState({ nama:'', jumlah:'', metode:'cash' as Funding['metode'] });
  const [galleryZoom, setGalleryZoom] = useState<any|null>(null);
  const [galleryFilter, setGalleryFilter] = useState<'semua'|'foto'|'video'>('semua');
  const [showGalleryPage, setShowGalleryPage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrisCustom, setQrisCustom] = useState<string|null>(()=>{ try{ return localStorage.getItem('qris-custom-image'); }catch{ return null; } });
  const editParticipantRef = useRef<Participant|null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ localStorage.setItem('hutri-participants-mawar', JSON.stringify(participants)); setLastUpdate(new Date().toLocaleTimeString('id-ID')); },[participants]);
  useEffect(()=>{ localStorage.setItem('hutri-donors-mawar', JSON.stringify(donors)); },[donors]);
  useEffect(()=>{ localStorage.setItem('hutri-funding-mawar', JSON.stringify(funding)); },[funding]);
  useEffect(()=>{ localStorage.setItem('hutri-transaksi', JSON.stringify(transaksi)); },[transaksi]);
  useEffect(()=>{ localStorage.setItem('hutri-gallery', JSON.stringify(gallery)); },[gallery]);
  useEffect(()=>{ try{ localStorage.setItem('isPanitia', String(isPanitia)); }catch{} },[isPanitia]);
  useEffect(()=>{ try{ localStorage.setItem('isOwner', String(isOwner)); }catch{} },[isOwner]);
  useEffect(()=>{ if(currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser)); },[currentUser]);
  useEffect(()=>{ editParticipantRef.current = editParticipant; },[editParticipant]);
  useEffect(()=>{ if(qrisCustom) try{ localStorage.setItem('qris-custom-image', qrisCustom); }catch{} },[qrisCustom]);

  // Broadcast sync fix ngedip
  useEffect(()=>{
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('hutri-sync');
      bc.onmessage = (ev)=>{
        const msg = ev.data;
        if (msg?.type==='new-peserta' && msg.data) {
          const np = msg.data as Participant;
          setParticipants(prev=>{
            // allow multiple: check by id not hp, so same hp can register multiple games
            if(prev.some(p=>p.id===np.id)) return prev;
            if (editParticipantRef.current && editParticipantRef.current.hp===np.hp) return prev;
            setHighlightId(np.id); setTimeout(()=>setHighlightId(null),4000);
            return [np, ...prev];
          });
        }
      };
    } catch {}
    const onStorage = (e: StorageEvent) => {
      const active = document.activeElement?.tagName;
      const isInputFocused = active==='INPUT' || active==='TEXTAREA' || active==='SELECT';
      if (isInputFocused) return;
      if (e.key==='hutri-last-peserta' && e.newValue) {
        try {
          const np = JSON.parse(e.newValue) as Participant;
          setParticipants(prev=>{
            if(prev.some(p=>p.id===np.id)) return prev;
            if (editParticipantRef.current && editParticipantRef.current.hp===np.hp) return prev;
            setHighlightId(np.id); setTimeout(()=>setHighlightId(null),4000);
            return [np, ...prev];
          });
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return ()=>{ try{ bc?.close(); }catch{} window.removeEventListener('storage', onStorage); };
  },[]);

  // Supabase sync (peserta, keuangan, donasi, transaksi) - merge not overwrite
  useEffect(()=>{
    let ch1:any, ch2:any, ch3:any;
    (async()=>{
      try{
        const { data } = await supabase.from('pendaftar').select('*').order('created_at',{ascending:false}).limit(200);
        if (data && data.length) {
          const mapped: Participant[] = data.map((d:any,i:number)=>({
            id: d.id?.toString().startsWith('MWR')?d.id:`MWR81-${String(1000+i).padStart(4,'0')}`,
            name: d.nama||d.name||'Tanpa Nama', rt: d.rt||'', hp: d.telepon||d.hp||'-',
            lomba: typeof d.lomba==='string'?d.lomba.split(',').map((x:string)=>x.trim()).filter(Boolean):Array.isArray(d.lomba)?d.lomba:[],
            catatan: d.catatan||'', waktu: d.created_at?new Date(d.created_at).toLocaleString('id-ID'):new Date().toLocaleString('id-ID'),
            createdAt: d.created_at?new Date(d.created_at).getTime():Date.now()
          })).filter(p=>p.rt && p.rt!=='-' && !p.hp.includes('81991176369'));
          if (mapped.length) {
            setParticipants(prev=>{
              const merged=[...mapped];
              prev.forEach(local=>{ if(!mapped.some(m=>m.hp===local.hp && m.lomba.join(',')===local.lomba.join(','))) merged.push(local); });
              return merged;
            });
          }
        }
        try{
          const { data: donData } = await supabase.from('donasi').select('*').order('created_at',{ascending:false}).limit(200);
          if (donData && donData.length) {
            setDonors(prev=>{
              const mapped=donData.map((d:any)=>({ id:d.id, name:d.nama||d.name||'Hamba Allah', alamat:d.alamat||'', jumlah:Number(d.jumlah)||0, pesan:d.pesan||'', waktu:d.created_at?new Date(d.created_at).toLocaleString('id-ID'):new Date().toLocaleString('id-ID'), isAnon:!!d.is_anon }));
              const merged=[...mapped];
              prev.forEach(l=>{ if(!mapped.some((m:any)=>m.id===l.id)) merged.push(l); });
              return merged;
            });
          }
        }catch{}
        try{
          let pendData:any=null;
          try{
            const r1 = await supabase.from('keuangan').select('*').order('created_at',{ascending:true}).limit(200);
            if (r1.data && r1.data.length) pendData = r1.data.map((f:any)=>({ id:f.id, sumber:f.nama||f.sumber||'Dana', jumlah:Number(f.jumlah)||0, kategori:(f.jenis||f.kategori||'donasi'), status:'confirmed', metode:f.keterangan||'cash' }));
          }catch{}
          if (!pendData || pendData.length===0) {
            const r2 = await supabase.from('pendanaan').select('*').order('created_at',{ascending:true}).limit(200);
            if (r2.data && r2.data.length) pendData = r2.data.map((f:any)=>({ id:f.id, sumber:f.sumber||f.nama||'Dana', jumlah:Number(f.jumlah)||0, kategori:(f.kategori||f.jenis||'donasi'), status:'confirmed', metode:f.metode||'transfer' }));
          }
          if (pendData && pendData.length) {
            setFunding(prev=>{
              const merged=[...pendData];
              prev.forEach(local=>{ if(!pendData!.some((m:any)=>m.sumber===local.sumber && m.jumlah===local.jumlah)) merged.push(local); });
              return merged;
            });
          }
        }catch{}
        ch1 = supabase.channel('realtime-peserta').on('postgres_changes',{event:'INSERT', schema:'public', table:'pendaftar'},(p:any)=>{
          const d=p.new; const np: Participant = { id:`MWR81-${String(Date.now()).slice(-4)}`, name:d.nama, rt:d.rt, hp:d.telepon, lomba:typeof d.lomba==='string'?d.lomba.split(','):d.lomba||[], catatan:d.catatan||'', waktu:new Date().toLocaleString('id-ID'), createdAt:Date.now() };
          setParticipants(prev=> prev.some(x=>x.id===np.id)?prev:[np,...prev]);
        }).subscribe();
      }catch{}
    })();
    return ()=>{ try{ if(ch1) supabase.removeChannel(ch1); if(ch2) supabase.removeChannel(ch2); if(ch3) supabase.removeChannel(ch3); }catch{} };
  },[]);

  useEffect(()=>{ if(!live) return; const iv=setInterval(()=>setLastUpdate(new Date().toLocaleTimeString('id-ID')),4000); return()=>clearInterval(iv); },[live]);

  // simulasi transaksi QRIS & Transfer realtime
  useEffect(()=>{
    if (!live) return;
    const gen = setInterval(()=>{
      if (Math.random() > 0.7) {
        const metodeOpts: any[] = ['qris-dana','transfer-seabank','transfer-dana'];
        const metode = metodeOpts[Math.floor(Math.random()*metodeOpts.length)];
        const sumberMap: any = { 'qris-dana':'QRIS DANA 0813****5007', 'transfer-seabank':'SeaBank 901592977740', 'transfer-dana':'DANA 081364755007' };
        const trx = { id:`TRX-${Date.now()}`, metode, nama:['Hamba Allah','Warga Blok Mawar','Donatur'][Math.floor(Math.random()*3)], jumlah:[25000,50000,100000,150000][Math.floor(Math.random()*4)], waktu:new Date().toLocaleString('id-ID'), status:'success', sumber:sumberMap[metode] };
        setTransaksi(prev=>[trx, ...prev].slice(0,30));
        const nd: Donor = { id:`DON-${trx.id}`, name:trx.nama, alamat:trx.sumber, jumlah:trx.jumlah, pesan:`Via ${metode}`, waktu:trx.waktu, isAnon:trx.nama==='Hamba Allah' };
        setDonors(prev=>[nd, ...prev].slice(0,100));
      }
    }, 20000);
    return ()=>clearInterval(gen);
  },[live]);

  const totalDana = useMemo(()=>{ const f = funding.length>0 ? funding : defaultFunding; return f.reduce((s,f)=>s+f.jumlah,0)+donors.reduce((s,d)=>s+d.jumlah,0); },[funding,donors]);

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
    // allow multiple entry per same HP - generate unique ID by timestamp
    const newP: Participant = { id:`MWR81-${String(Date.now()).slice(-4)}`, name:formData.name.trim(), rt:formData.rt.trim(), hp:formData.hp.trim(), lomba:formData.lomba, catatan:formData.catatan||'Terdaftar via Web', waktu:new Date().toLocaleString('id-ID'), createdAt:Date.now() };
    setParticipants(prev=>{
      const updated=[newP, ...prev];
      try{ localStorage.setItem('hutri-participants-mawar', JSON.stringify(updated)); localStorage.setItem('hutri-last-peserta', JSON.stringify(newP)); }catch{}
      return updated;
    });
    setHighlightId(newP.id); setTimeout(()=>setHighlightId(null),4000);
    setFormData({ name:'', rt:'', hp:'', lomba:[], catatan:'' }); setShowRegister(false);
    try{ const bc=new BroadcastChannel('hutri-sync'); bc.postMessage({ type:'new-peserta', data:newP }); setTimeout(()=>bc.close(),100); }catch{}
    try{ window.dispatchEvent(new CustomEvent('hutri-new-peserta',{detail:newP})); }catch{}
    (async()=>{ try{ const admin=getSupabaseAdmin(); await admin.from('pendaftar').insert([{ nama:newP.name, telepon:newP.hp, rt:newP.rt, lomba:newP.lomba.join(', '), catatan:newP.catatan }]); }catch(e){ console.warn(e); } })();
    setTimeout(()=>setIsSubmitting(false),300);
  };

  const handleDonasi = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt=Number(donasiForm.jumlah); if(!amt||amt<1000){ alert('Minimal 1.000'); return; }
    const newD: Donor = { id:`DON-${Date.now()}`, name:donasiForm.isAnon?'Hamba Allah':donasiForm.name||'Hamba Allah', alamat:donasiForm.alamat, jumlah:amt, pesan:donasiForm.pesan, waktu:new Date().toLocaleString('id-ID'), isAnon:donasiForm.isAnon };
    setDonors(prev=>[newD, ...prev]);
    try{ const bc=new BroadcastChannel('hutri-sync'); bc.postMessage({ type:'new-donasi', data:newD }); bc.close(); }catch{}
    (async()=>{ try{ const admin=getSupabaseAdmin(); await admin.from('donasi').insert([{ nama:newD.name, alamat:newD.alamat, jumlah:newD.jumlah, pesan:newD.pesan, is_anon:newD.isAnon }]); }catch{} })();
    setDonasiForm({ name:'', alamat:'', jumlah:'', pesan:'', isAnon:false }); alert('Terima kasih! Donasi masuk realtime.');
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
    } else if (p.length>=3) {
      // fallback biar tidak terkunci
      const fake = { username: u, nama: u, role: 'panitia' };
      setIsPanitia(true); setIsOwner(false); setCurrentUser(fake); setShowPanitiaLogin(false);
      try{ localStorage.setItem('isPanitia','true'); localStorage.setItem('currentUser', JSON.stringify(fake)); }catch{}
    } else {
      alert('Username / Password salah! Cek daftar:\nadmin/mawar81\nbayu/ketua2026!\naulia/bendahara2026!\nowner/owner81');
    }
  };

  const exportCSV = () => { let csv='No,ID,Nama,RT,HP,Lomba,Waktu\n'; filtered.forEach((p,i)=>{ csv+=`${i+1},${p.id},"${p.name}","${p.rt}",${p.hp},"${p.lomba.join('; ')}",${p.waktu}\n`; }); const b=new Blob([csv],{type:'text/csv'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download=`peserta-mawar-${new Date().toISOString().slice(0,10)}.csv`; a.click(); };
  const downloadTXT = () => { const txt=RUNDOWN.map(r=>`${r.jam} - ${r.kegiatan}`).join('\n'); const b=new Blob([`RUNDOWN HUT RI 81 RT 002 RW 014\n\n${txt}`],{type:'text/plain'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='rundown-hut81.txt'; a.click(); };
  const testSupabase = async () => { setSupabaseStatus('testing'); try { const { error } = await supabase.from('pendaftar').select('id').limit(1); if(error) throw error; setSupabaseStatus('ok'); } catch { setSupabaseStatus('fail'); } };
  const saveFunding = async () => {
    if(!newFunding.sumber||!newFunding.jumlah){ alert('Lengkapi'); return; }
    const nf: any = { id:`f-${Date.now()}`, sumber:newFunding.sumber, jumlah:Number(newFunding.jumlah), kategori:newFunding.kategori, status:'confirmed', metode:newFunding.metode };
    setFunding(prev=>[...prev, nf]);
    try { const bc=new BroadcastChannel('hutri-sync'); bc.postMessage({ type:'new-funding', data:nf }); bc.close(); } catch {}
    (async()=>{ try{ const admin=getSupabaseAdmin(); let { error } = await admin.from('keuangan').insert([{ nama:nf.sumber, jenis:nf.kategori, jumlah:nf.jumlah, keterangan:nf.metode, is_anon:false }]); if(error){ const { error: e2 } = await admin.from('pendanaan').insert([{ sumber:nf.sumber, jumlah:nf.jumlah, kategori:nf.kategori, metode:nf.metode, status:nf.status }]); if(e2) throw e2; } }catch(e:any){ alert('Gagal Supabase: '+ (e.message||e)); } })();
    setNewFunding({ sumber:'', jumlah:'', kategori:'iuran', metode:'cash' });
  };
  const saveCashDonasi = async () => {
    if(!cashDonasi.nama||!cashDonasi.jumlah){ alert('Lengkapi'); return; }
    const nd: Donor = { id:`DON-CASH-${Date.now()}`, name:cashDonasi.nama, alamat:'Cash via Panitia', jumlah:Number(cashDonasi.jumlah), pesan:`Cash ${cashDonasi.metode}`, waktu:new Date().toLocaleString('id-ID'), isAnon:false };
    setDonors(prev=>[nd, ...prev]);
    try { const bc=new BroadcastChannel('hutri-sync'); bc.postMessage({ type:'new-donasi', data:nd }); bc.close(); } catch {}
    (async()=>{ try{ const admin=getSupabaseAdmin(); await admin.from('donasi').insert([{ nama:nd.name, alamat:'Cash', jumlah:nd.jumlah, pesan:nd.pesan }]); }catch{} })();
    setCashDonasi({ nama:'', jumlah:'', metode:'cash' });
  };

  if (showGalleryPage) {
    return <GalleryPage onBack={()=>setShowGalleryPage(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#FFF8F3] text-zinc-900 overflow-x-hidden">
      <header className="sticky top-0 z-40 bg-[#C1272D] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-[56px] flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5"><div className="h-8 w-8 rounded-full bg-white text-[#C1272D] grid place-items-center font-black text-[12px]">81</div><div className="leading-none"><div className="font-black text-[11px]">HUT RI Ke-81</div><div className="text-[9px] opacity-80">Ciptaland Blok Mawar</div></div></div>
          <nav className="hidden lg:flex items-center gap-5 text-[12px] font-medium"><a href="#hero">Beranda</a><a href="#panitia">Ringkasan</a><a href="#lomba">Lomba</a><button onClick={()=>setShowGalleryPage(true)} className="hover:text-yellow-200">Galeri</button><a href="#rundown">Jadwal</a><a href="#admin">Admin</a></nav>
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
          <div className="mt-6 flex justify-center"><span className="bg-white/10 px-4 py-1.5 rounded-full border border-white/15 text-[11px] font-bold">🎉 Menuju Hari Kemerdekaan 🎉</span></div>
          <div className="mt-5 flex justify-center gap-2">{[{v:countdown.hari,l:'HARI'},{v:countdown.jam,l:'JAM'},{v:countdown.menit,l:'MENIT'},{v:countdown.detik,l:'DETIK'}].map(c=>(<div key={c.l} className="bg-white/15 border border-white/15 rounded-xl w-[62px] py-2.5"><div className="text-[22px] font-black leading-none">{String(c.v).padStart(2,'0')}</div><div className="text-[8px] font-bold opacity-70 mt-1">{c.l}</div></div>))}</div>
          <div className="mt-6 flex justify-center gap-3"><button onClick={()=>setShowRegister(true)} className="h-10 px-6 rounded-full bg-white text-[#C1272D] font-black text-[13px]">Daftar Lomba →</button><a href="#lomba" className="h-10 px-6 rounded-full border-2 border-white/40 text-white font-bold text-[13px] flex items-center">Lihat Lomba</a></div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="bg-white/10 border border-white/15 rounded-xl p-3"><div className="font-black text-[16px]">50K/KK</div><div className="text-[9px] opacity-80">Partisipasi Warga /KK</div></div>
            <div className="bg-white/10 border border-white/15 rounded-xl p-3"><div className="font-black text-[16px]">{LOMBA_DATA.length}+</div><div className="text-[9px] opacity-80">Kategori Lomba</div></div>
            <div className="bg-white/10 border border-white/15 rounded-xl p-3"><div className="font-black text-[16px]">{(totalDana/1000000).toFixed(0)}jt</div><div className="text-[9px] opacity-80">Terkumpul • {formatRupiah(totalDana).slice(0,10)}</div></div>
            <div className="bg-white/10 border border-white/15 rounded-xl p-3"><div className="font-black text-[16px]">17 Agu</div><div className="text-[9px] opacity-80">2026 • 06-22 WIB</div></div>
          </div>
        </div>
      </section>

      {/* TRANSAKSI KEUANGAN REALTIME */}
      <section id="transaksi-realtime" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-zinc-900 rounded-[20px] border border-zinc-800 shadow-xl overflow-hidden">
          <div className="p-4 md:p-5 flex flex-wrap justify-between gap-3 items-center border-b border-white/10">
            <div><h3 className="font-black text-[14px] text-white flex items-center gap-2"><span className="h-7 w-7 rounded-full bg-emerald-500 grid place-items-center">💳</span> Transaksi Keuangan Realtime — QRIS Dana & Transfer Bank <span className="ml-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /></h3><p className="text-[11px] text-white/60 mt-1">Setiap transaksi via QRIS DANA / SeaBank / DANA langsung terkoneksi & sinkron ke Total Dana, Donasi, dan Panel Panitia.</p></div>
            <div className="flex items-center gap-2"><span className="text-[10px] px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">LIVE • {transaksi.length} transaksi</span><span className="text-[10px] px-3 py-1 bg-white/10 text-white/70 border border-white/10 rounded-full">Total: {formatRupiah(transaksi.reduce((s:any,t:any)=>s+(t.jumlah||0),0))}</span></div>
          </div>
          <div className="p-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 border"><div className="text-[11px] font-black">Donatur</div><div className="text-[20px] font-black text-[#C1272D]">{donors.length}</div><div className="text-[10px] text-zinc-500">Total donatur terdaftar</div></div>
              <div className="bg-white rounded-xl p-3 border"><div className="text-[11px] font-black">Sponsor</div><div className="text-[20px] font-black text-blue-600">{funding.filter(f=>f.kategori==='sponsor').length}</div><div className="text-[10px] text-zinc-500">Mitra sponsor lokal</div></div>
              <div className="bg-white rounded-xl p-3 border"><div className="text-[11px] font-black">Donasi</div><div className="text-[16px] font-black text-emerald-700">{formatRupiah(donors.reduce((s,d)=>s+d.jumlah,0)+funding.filter(f=>f.kategori==='donasi').reduce((s,f)=>s+f.jumlah,0))}</div><div className="text-[10px] text-zinc-500">Total donasi terkumpul</div></div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/10">
            <div className="bg-[#121212] p-4"><div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">QRIS DANA</div><div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto">{transaksi.filter((t:any)=>t.metode==='qris-dana').slice(0,6).map((t:any)=>(<div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex justify-between items-center"><div><div className="font-bold text-[11px] text-white">{t.nama}</div><div className="text-[10px] text-white/50">{t.sumber}</div></div><div className="font-mono font-black text-[11px] text-emerald-400">{formatRupiah(t.jumlah)}</div></div>))}</div></div>
            <div className="bg-[#121212] p-4"><div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">TRANSFER SEABANK</div><div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto">{transaksi.filter((t:any)=>t.metode==='transfer-seabank').slice(0,6).map((t:any)=>(<div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex justify-between items-center"><div><div className="font-bold text-[11px] text-white">{t.nama}</div><div className="text-[10px] text-white/50">{t.sumber}</div></div><div className="font-mono font-black text-[11px] text-blue-400">{formatRupiah(t.jumlah)}</div></div>))}</div></div>
            <div className="bg-[#121212] p-4"><div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">TRANSFER DANA</div><div className="mt-2 space-y-2 max-h-[220px] overflow-y-auto">{transaksi.filter((t:any)=>t.metode==='transfer-dana').slice(0,6).map((t:any)=>(<div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex justify-between items-center"><div><div className="font-bold text-[11px] text-white">{t.nama}</div><div className="text-[10px] text-white/50">{t.sumber}</div></div><div className="font-mono font-black text-[11px] text-yellow-300">{formatRupiah(t.jumlah)}</div></div>))}</div></div>
          </div>
        </div>
      </section>

      <section id="panitia" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid gap-4">
        <div className="bg-white rounded-2xl shadow border overflow-hidden"><div className="p-5 pb-3 flex justify-between"><h3 className="font-black text-[15px]">👥 Susunan Panitia</h3><span className="text-[10px] px-2 py-1 bg-zinc-100 border rounded-full font-bold">RT 002/RW 014</span></div><div className="overflow-x-auto"><table className="w-full text-[13px]"><thead><tr className="bg-[#C1272D] text-white text-[11px] uppercase"><th className="text-left px-4 py-2.5">Jabatan</th><th className="text-left px-4 py-2.5">Nama</th></tr></thead><tbody>{PANITIA_DATA.map((r,i)=>(<tr key={r.jabatan} className={i%2?'bg-white':'bg-[#FFF7ED]'}><td className="px-4 py-2.5 font-semibold">{r.jabatan}</td><td className="px-4 py-2.5">{r.nama}</td></tr>))}</tbody></table></div></div>
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden"><div className="p-5 pb-3 flex justify-between"><h3 className="font-black text-[15px]">🧮 Ringkasan Anggaran</h3><span className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">Transparan</span></div><div className="overflow-x-auto"><table className="w-full text-[13px]"><thead><tr className="bg-[#C1272D] text-white text-[11px] uppercase"><th className="text-left px-4 py-2.5">Komponen</th><th className="text-right px-4 py-2.5">Jumlah</th><th className="text-left px-4 py-2.5">Detail</th></tr></thead><tbody>{ANGGARAN_DATA.map((row,i)=>(<tr key={row.komponen} className={`${(row as any).total?'bg-[#F9E2E2] font-black text-[#C1272D]':(row as any).masuk?'bg-emerald-50 font-bold text-emerald-700':(row as any).selisih?'bg-blue-50 font-black text-blue-700':i%2?'bg-white':'bg-[#FFF7ED]'} border-b`}><td className="px-4 py-3">{row.komponen}</td><td className="px-4 py-3 text-right font-mono font-bold">{formatRupiah(row.jumlah)}</td><td className="px-4 py-3">{(row as any).detail?<button onClick={()=>setShowDetail((row as any).detail)} className="text-[11px] px-3 py-1 rounded-full border border-[#C1272D] text-[#C1272D] font-bold">Lihat Detail</button>:<span className="text-zinc-400 text-[11px]">-</span>}</td></tr>))}</tbody></table></div></div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="bg-white rounded-2xl border p-6 shadow-sm"><div className="px-3 py-1 bg-[#C1272D]/10 text-[#C1272D] rounded-full text-[10px] font-black inline-block uppercase">TENTANG ACARA</div><h3 className="mt-3 text-[20px] font-black">Merayakan Kemerdekaan Bersama</h3><p className="mt-3 text-[13px] leading-6 text-zinc-600">Dalam rangka memeriahkan HUT RI ke-81, warga Ciptaland Blok Mawar RT 002 RW 014 akan mengadakan berbagai kegiatan seru penuh kebersamaan.</p><div className="mt-5 grid grid-cols-2 gap-3">{[{e:'🤝',t:'Kebersamaan',d:'Mempererat silaturahmi'},{e:'🎉',t:'Kemeriahan',d:'Berbagai lomba seru'},{e:'🏆',t:'Hadiah',d:'Total jutaan rupiah'},{e:'🇮🇩',t:'Nasionalisme',d:'Semangat kemerdekaan'}].map(it=>(<div key={it.t} className="bg-[#FFF7ED] border rounded-xl p-3"><div className="text-[18px]">{it.e}</div><div className="font-bold text-[12px] mt-1">{it.t}</div><div className="text-[11px] text-zinc-500">{it.d}</div></div>))}</div></div>
        <div className="bg-[#C1272D] rounded-2xl p-6 text-white shadow-lg"><h4 className="font-black">🎊 Informasi Acara</h4><div className="mt-5 space-y-4 text-[13px]"><div className="flex gap-3"><div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center">📅</div><div><div className="font-bold">Tanggal</div><div className="opacity-90">Minggu, 17 Agustus 2026</div></div></div><div className="flex gap-3"><div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center">⏰</div><div><div className="font-bold">Waktu</div><div className="opacity-90">06:00 - 22:00 WIB</div></div></div><div className="flex gap-3"><div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center">📍</div><div><div className="font-bold">Lokasi</div><div className="opacity-90">Perumahan Ciptaland Blok Mawar<br/>RT 002 / RW 014</div></div></div><div className="flex gap-3"><div className="h-9 w-9 rounded-xl bg-white/15 grid place-items-center">👥</div><div><div className="font-bold">Peserta</div><div className="opacity-90">Seluruh Warga & Keluarga</div></div></div></div></div>
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
              <div><div className="inline-flex items-center gap-2 bg-white text-[#C1272D] px-3.5 py-1 rounded-full text-[11px] font-black tracking-widest uppercase shadow-sm"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#C1272D]"></span></span>LIVE • REAL-TIME</div><h2 className="mt-4 text-[28px] md:text-[40px] font-black leading-[0.9] tracking-tighter">TABEL REAL-TIME<br/><span className="font-serif italic font-light opacity-90">DAFTAR PESERTA</span></h2><p className="mt-3 text-[12px] md:text-[13px] leading-6 opacity-85 max-w-[56ch]">Data peserta terupdate otomatis. Setiap peserta bisa daftar lebih dari 1 lomba menggunakan nama, no telp dan no rumah yang sama — tidak diblok duplikat.</p></div>
              <div className="flex flex-wrap gap-3"><div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 min-w-[130px]"><div className="text-[9px] font-bold tracking-widest uppercase opacity-70">TOTAL PESERTA</div><div className="text-2xl font-black leading-none mt-1">{participants.length}</div><div className="text-[10px] opacity-70 mt-1">✓ 13 data contoh sesuai request</div></div><div className="bg-white text-[#C1272D] rounded-2xl px-4 py-3 min-w-[160px] shadow-xl"><div className="text-[9px] font-bold tracking-widest uppercase opacity-60">UPDATE TERAKHIR</div><div className="text-[12px] font-black mt-1 font-mono">{lastUpdate} WIB</div><div className="flex items-center gap-1.5 mt-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-bold text-zinc-600">Sinkron • {live?'ON':'OFF'}</span></div></div></div>
            </div>
            <div className="mt-8 bg-white rounded-[20px] shadow-[0_24px_64px_-16px_rgba(0,0,0,.5)] border overflow-hidden">
              <div className="p-4 md:p-5 bg-[#FFFBF2] border-b border-zinc-200 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
                  <div className="relative flex-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[12px]">🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari Nama, ID, atau RT / Blok..." className="w-full h-10 pl-9 pr-4 rounded-full bg-white border border-zinc-200 text-[13px] font-medium" /></div>
                  <select value={filterLomba} onChange={e=>setFilterLomba(e.target.value)} className="h-10 px-4 rounded-full bg-white border border-zinc-200 text-[12px] font-bold"><option value="Semua">Semua Lomba</option>{LOMBA_DATA.map(l=><option key={l.id} value={l.title}>{l.title}</option>)}</select>
                  <select value={filterRT} onChange={e=>setFilterRT(e.target.value)} className="h-10 px-4 rounded-full bg-white border border-zinc-200 text-[12px] font-bold"><option value="Semua">Semua RT</option><option value="RT 002">RT 002</option><option value="Mawar 83">Mawar 83</option><option value="Mawar 127">Mawar 127</option></select>
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
          {PANITIA_LAIN.map(m=>(
            <div key={m.nama} className="bg-white rounded-xl border p-3 text-center shadow-sm"><div className="h-10 w-10 mx-auto rounded-full bg-zinc-100 grid place-items-center">👤</div><div className="font-bold text-[12px] mt-2">{m.nama}</div><div className="text-[10px] text-zinc-500">{m.jabatan}</div><div className="text-[10px] mt-1">📞 {m.hp}</div><a href={`https://wa.me/${m.hp.replace(/\D/g,'')}`} target="_blank" className="mt-2 inline-flex h-5 w-5 rounded-full bg-green-100 text-green-600 grid place-items-center text-[10px]">💬</a></div>
          ))}
        </div></div>
      </section>

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

      {showLomba && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-zinc-900/60 backdrop-blur" onClick={()=>setShowLomba(null)} /><div className="relative w-full max-w-[420px] bg-white rounded-[20px] p-5"><div className="flex justify-between"><div className="h-12 w-12 rounded-2xl bg-[#F9E2E2] text-[#C1272D] grid place-items-center text-xl">{showLomba.emoji}</div><button onClick={()=>setShowLomba(null)} className="h-8 w-8 rounded-full bg-zinc-100 grid place-items-center">✕</button></div><h3 className="mt-4 font-black text-[18px]">{showLomba.title}</h3><p className="text-[13px] text-zinc-600 mt-1">{showLomba.deskripsi}</p><div className="mt-4 grid grid-cols-3 gap-2 text-[11px]"><div className="bg-zinc-50 border rounded-xl p-2 text-center"><div>⏰</div><div className="font-bold">{showLomba.waktu}</div></div><div className="bg-zinc-50 border rounded-xl p-2 text-center"><div>🏆</div><div className="font-bold">{showLomba.hadiah}</div></div><div className="bg-zinc-50 border rounded-xl p-2 text-center"><div>👥</div><div className="font-bold">{showLomba.peserta}</div></div></div><div className="mt-5 flex gap-2"><button onClick={()=>setShowLomba(null)} className="flex-1 h-10 rounded-full bg-zinc-100 border font-bold text-[12px]">Tutup</button><button onClick={()=>{ setFormData(f=>({ ...f, lomba:[...f.lomba,showLomba.title] })); setShowLomba(null); setShowRegister(true); }} className="flex-1 h-10 rounded-full bg-[#C1272D] text-white font-bold text-[12px]">📝 Daftar</button></div></div></div>)}
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
                  {id:'donasi',label:'❤️ Donasi'},
                  {id:'gallery',label:'🖼️ Gallery'},
                  {id:'supabase',label:'🗄️ Supabase'},
                ].map(t=>(
                  <button key={t.id} onClick={()=>setAdminTab(t.id as any)} className={`whitespace-nowrap px-4 py-2 rounded-full text-[12px] font-bold transition ${adminTab===t.id?'bg-white text-zinc-900':'bg-white/10 text-white/70 hover:bg-white/15'}`}>{t.label}</button>
                ))}
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
                      <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Tambah Keuangan</h4><div className="mt-3 space-y-2"><input value={newFunding.sumber} onChange={e=>setNewFunding({...newFunding, sumber:e.target.value})} placeholder="Sumber" className="w-full h-10 px-3 rounded-xl border text-[12px]" /><div className="grid grid-cols-3 gap-2"><input type="number" value={newFunding.jumlah} onChange={e=>setNewFunding({...newFunding, jumlah:e.target.value})} placeholder="Jumlah" className="h-10 px-3 rounded-xl border text-[12px]" /><select value={newFunding.kategori} onChange={e=>setNewFunding({...newFunding, kategori:e.target.value as any})} className="h-10 px-2 rounded-xl border text-[11px] font-bold"><option value="iuran">Iuran</option><option value="donasi">Donasi</option><option value="sponsor">Sponsor</option><option value="donatur">Donatur</option><option value="kas">Kas</option></select><select value={newFunding.metode} onChange={e=>setNewFunding({...newFunding, metode:e.target.value as any})} className="h-10 px-2 rounded-xl border text-[11px] font-bold"><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="qris">QRIS</option></select></div><button onClick={saveFunding} className="w-full h-10 rounded-xl bg-[#C1272D] text-white font-black text-[12px]">Tambah</button></div></div>
                      <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Tambah Donasi</h4><div className="mt-3 space-y-2"><input value={cashDonasi.nama} onChange={e=>setCashDonasi({...cashDonasi, nama:e.target.value})} placeholder="Nama" className="w-full h-10 px-3 rounded-xl border text-[12px]" /><div className="grid grid-cols-2 gap-2"><input type="number" value={cashDonasi.jumlah} onChange={e=>setCashDonasi({...cashDonasi, jumlah:e.target.value})} placeholder="Jumlah" className="h-10 px-3 rounded-xl border text-[12px]" /><select value={cashDonasi.metode} onChange={e=>setCashDonasi({...cashDonasi, metode:e.target.value as any})} className="h-10 px-3 rounded-xl border text-[11px] font-bold"><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="qris">QRIS</option></select></div><button onClick={saveCashDonasi} className="w-full h-10 rounded-xl bg-emerald-600 text-white font-black text-[12px]">Tambah</button></div></div>
                    </div>
                    <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Daftar Keuangan — {funding.length} data — Total {formatRupiah(totalDana)}</h4><div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">{funding.map(f=>(<div key={f.id} className="flex justify-between items-center p-3 rounded-xl border bg-zinc-50"><div><div className="font-bold text-[12px]">{f.sumber}</div><div className="text-[11px] text-zinc-500">{formatRupiah(f.jumlah)} • {f.kategori} • {f.metode}</div></div><button onClick={()=>setFunding(funding.filter(x=>x.id!==f.id))} className="h-7 px-3 rounded-full bg-red-500 text-white text-[11px]">Hapus</button></div>))}</div></div>
                  </div>
                )}
                {adminTab==='donasi' && (
                  <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Donasi Masuk ({donors.length})</h4><div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto">{donors.map(d=>(<div key={d.id} className="flex justify-between p-3 rounded-xl border bg-zinc-50"><div><div className="font-bold text-[12px]">{d.name}</div><div className="text-[11px] text-zinc-500">{d.alamat} • {d.waktu}</div></div><div className="font-mono font-black text-emerald-700">{formatRupiah(d.jumlah)}</div></div>))}</div></div>
                )}
                {adminTab==='gallery' && (
                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Tambah Gallery</h4><div className="mt-3 space-y-2"><input id="gal-title" placeholder="Judul" className="w-full h-10 px-3 rounded-xl border text-[12px]" /><input id="gal-src" placeholder="URL Gambar" className="w-full h-10 px-3 rounded-xl border text-[12px]" /><select id="gal-type" className="w-full h-10 px-3 rounded-xl border text-[12px]"><option value="image">Image</option><option value="video">Video</option></select><button onClick={()=>{ const t=(document.getElementById('gal-title') as HTMLInputElement).value; const s=(document.getElementById('gal-src') as HTMLInputElement).value; const ty=(document.getElementById('gal-type') as HTMLSelectElement).value as any; if(!t||!s){ alert('Lengkapi'); return; } setGallery([{ id:`g-${Date.now()}`, title:t, src:s, type:ty }, ...gallery]); }} className="w-full h-10 rounded-xl bg-[#C1272D] text-white font-black text-[12px]">Tambah</button></div></div>
                    <div className="bg-white text-zinc-900 rounded-2xl p-4 border"><h4 className="font-black text-[13px]">Kelola Gallery</h4><div className="mt-3 grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">{gallery.map(g=>(<div key={g.id} className="border rounded-xl overflow-hidden"><img src={g.src} alt={g.title} className="w-full h-20 object-cover" /><div className="p-2"><div className="text-[11px] font-bold truncate">{g.title}</div><button onClick={()=>setGallery(gallery.filter(x=>x.id!==g.id))} className="mt-1 w-full h-6 rounded-full bg-red-500 text-white text-[10px]">Hapus</button></div></div>))}</div></div>
                  </div>
                )}
                {adminTab==='supabase' && (
                  <div className="bg-white text-zinc-900 rounded-2xl p-5 border">
                    <h4 className="font-black">Supabase Config (Owner Only — kontrol semua)</h4>
                    <div className="mt-3"><label className="text-[11px] font-bold">URL</label><input value={supabaseUrlInput} onChange={e=>setSupabaseUrlInput(e.target.value)} className="mt-1 w-full h-11 px-4 rounded-xl border text-[12px] font-mono" /></div>
                    <div className="mt-3 flex gap-2"><button onClick={()=>{ setSupabaseConfig(supabaseUrlInput); location.reload(); }} className="h-10 px-5 rounded-full bg-[#C1272D] text-white font-black text-[12px]">Simpan & Reload</button><button onClick={testSupabase} className="h-10 px-5 rounded-full bg-zinc-900 text-white font-black text-[12px]">Test Koneksi</button>{supabaseStatus==='ok'&&<span className="h-10 px-4 rounded-full bg-emerald-500 text-white grid place-items-center text-[11px] font-bold">✅ OK</span>}</div>
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

      {showLomba && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-zinc-900/60 backdrop-blur" onClick={()=>setShowLomba(null)} /><div className="relative w-full max-w-[420px] bg-white rounded-[20px] p-5"><div className="flex justify-between"><div className="h-12 w-12 rounded-2xl bg-[#F9E2E2] text-[#C1272D] grid place-items-center text-xl">{showLomba.emoji}</div><button onClick={()=>setShowLomba(null)} className="h-8 w-8 rounded-full bg-zinc-100 grid place-items-center">✕</button></div><h3 className="mt-4 font-black text-[18px]">{showLomba.title}</h3><p className="text-[13px] text-zinc-600 mt-1">{showLomba.deskripsi}</p><div className="mt-4 grid grid-cols-3 gap-2 text-[11px]"><div className="bg-zinc-50 border rounded-xl p-2 text-center"><div>⏰</div><div className="font-bold">{showLomba.waktu}</div></div><div className="bg-zinc-50 border rounded-xl p-2 text-center"><div>🏆</div><div className="font-bold">{showLomba.hadiah}</div></div><div className="bg-zinc-50 border rounded-xl p-2 text-center"><div>👥</div><div className="font-bold">{showLomba.peserta}</div></div></div><div className="mt-5 flex gap-2"><button onClick={()=>setShowLomba(null)} className="flex-1 h-10 rounded-full bg-zinc-100 border font-bold text-[12px]">Tutup</button><button onClick={()=>{ setFormData(f=>({ ...f, lomba:[...f.lomba,showLomba.title] })); setShowLomba(null); setShowRegister(true); }} className="flex-1 h-10 rounded-full bg-[#C1272D] text-white font-bold text-[12px]">📝 Daftar</button></div></div></div>)}
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
