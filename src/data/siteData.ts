// ============================================
// LOMBA DATA
// ============================================
export interface LombaItem {
  id: string;
  nama: string;
  icon: string;
  kategori: 'anak' | 'remaja' | 'bapak' | 'ibu' | 'keluarga' | 'umum';
  kategoriLabel: string;
  waktu: string;
  hadiah: string;
  peserta: string;
  deskripsi: string;
  peraturan: string[];
}

export const lombaList: LombaItem[] = [
  {
    id: 'makan-kerupuk', nama: 'Lomba Makan Kerupuk', icon: '🎈', kategori: 'anak', kategoriLabel: 'anak',
    waktu: '08:30 WIB', hadiah: 'Menarik', peserta: 'Usia 5-12 tahun',
    deskripsi: 'Lomba makan kerupuk tanpa tangan untuk anak-anak',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'futsal-mini', nama: 'Futsal Mini', icon: '⚽', kategori: 'remaja', kategoriLabel: 'remaja',
    waktu: '09:30 WIB', hadiah: 'Menarik', peserta: 'Tim 5 orang',
    deskripsi: 'Futsal Mini beregu dengan hadiah menarik di puncak',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'balap-kelereng', nama: 'Lomba Balap Kelereng', icon: '🏃', kategori: 'anak', kategoriLabel: 'anak',
    waktu: '08:30 WIB', hadiah: 'Menarik', peserta: 'Usia 7-15 tahun',
    deskripsi: 'Balap kelereng klasik untuk anak-anak, melatih fokus dan keseimbangan',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'tarik-tambang', nama: 'Lomba Tarik Tambang', icon: '💪', kategori: 'bapak', kategoriLabel: 'bapak',
    waktu: '11:00 WIB', hadiah: 'Menarik', peserta: 'Tim 8 orang',
    deskripsi: 'Kompetisi tarik tambang antar RT - adu kekuatan dan kekompakan',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'hias-tumpeng', nama: 'Lomba Hias Tumpeng', icon: '🍛', kategori: 'ibu', kategoriLabel: 'ibu',
    waktu: '13:00 WIB', hadiah: 'Menarik', peserta: 'Ibu rumah tangga',
    deskripsi: 'Lomba Hias Tumpeng Kreasi Para Ibu dengan Cita Rasa dan Tampilan Menarik dan Terbaik',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'fashion-daster', nama: 'Lomba Fashion Week Daster', icon: '👗', kategori: 'ibu', kategoriLabel: 'ibu',
    waktu: '13:00 WIB', hadiah: 'Menarik', peserta: 'Ibu-ibu',
    deskripsi: 'Kreasikan Gaya dan Penampilan Terbaik dan Terlucu',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'salah-sambung', nama: 'Salah Sambung', icon: '🗣️', kategori: 'remaja', kategoriLabel: 'remaja',
    waktu: '09:30 WIB', hadiah: 'Menarik', peserta: 'Usia 13-17 tahun',
    deskripsi: 'Lomba Salah Sambung Melatih Fokus, Kekompakan, Kecepatan dan Berfikir',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'joget-kursi-bapak', nama: 'Lomba Joget Kursi Bapak', icon: '💃', kategori: 'bapak', kategoriLabel: 'bapak',
    waktu: '11:00 WIB', hadiah: 'Menarik', peserta: 'Individu',
    deskripsi: 'Lomba joget kursi dengan keseruan untuk bapak-bapak',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'estafet-penguin-anak', nama: 'Lomba Estafet Penguin Anak', icon: '🐧', kategori: 'anak', kategoriLabel: 'anak',
    waktu: '08:30 WIB', hadiah: 'Menarik', peserta: 'Tim 3 anak SD',
    deskripsi: 'Lomba Model Baru dengan Keseruan dan Kekompakan',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'estafet-penguin-remaja', nama: 'Lomba Estafet Penguin Remaja', icon: '🐧', kategori: 'remaja', kategoriLabel: 'remaja',
    waktu: '09:30 WIB', hadiah: 'Menarik', peserta: 'Usia 13-17 tahun',
    deskripsi: 'Lomba Model Baru dengan Keseruan dan Kekompakan',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'estafet-tepung', nama: 'Lomba Estafet Tepung', icon: '🌾', kategori: 'bapak', kategoriLabel: 'bapak',
    waktu: '11:00 WIB', hadiah: 'Menarik', peserta: 'Tim 3 Orang',
    deskripsi: 'Lomba Estafet Tepung dengan Keseruan dan Kekompakan',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'joget-kursi-ibu', nama: 'Lomba Joget Kursi Ibu', icon: '🪑', kategori: 'ibu', kategoriLabel: 'ibu',
    waktu: '13:00 WIB', hadiah: 'Menarik', peserta: 'Tim 3 Orang',
    deskripsi: 'Lomba joget kursi dengan keseruan untuk ibu-ibu',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
  {
    id: 'make-up-buta', nama: 'Lomba Make Up Buta', icon: '💄', kategori: 'keluarga', kategoriLabel: 'keluarga',
    waktu: '15:00 WIB', hadiah: 'Menarik', peserta: 'Tim 2 Pasang',
    deskripsi: 'Lomba Make Up Buta dengan Keseruan dan kekompakan Pasangan',
    peraturan: ['Peserta wajib mendaftar ulang 30 menit sebelum lomba dimulai','Peserta wajib warga Ciptaland Blok Mawar RT 002/RW 014 (dibuktikan KK)','Keputusan juri tidak dapat diganggu gugat','Peserta yang curang akan didiskualifikasi','Hadiah diserahkan pada Malam Puncak 22 Agustus 2026'],
  },
];

export const lombaCategories = [
  { id: 'semua', label: '📋 Semua', icon: '📋' },
  { id: 'anak', label: '👶 Anak-anak', icon: '👶' },
  { id: 'ibu', label: '👩 Ibu-ibu', icon: '👩' },
  { id: 'bapak', label: '👨 Bapak-bapak', icon: '👨' },
  { id: 'remaja', label: '🧑 Remaja', icon: '🧑' },
  { id: 'keluarga', label: '👨‍👩‍👧 Keluarga', icon: '👨‍👩‍👧' },
];

// ============================================
// PANITIA DATA
// ============================================
export interface PanitiaItem {
  nama: string;
  jabatan: string;
  hp: string;
  isCore?: boolean;
}

export const panitiaList: PanitiaItem[] = [
  { nama: 'IPTU Saharudin', jabatan: 'Ketua Pembina', hp: '', isCore: true },
  { nama: 'Syamsul Piliano', jabatan: 'Ketua Penasehat', hp: '', isCore: true },
  { nama: 'Eka Rista Y', jabatan: 'Penanggung Jawab', hp: '0821-7129-9984', isCore: true },
  { nama: 'Bayu S.Permana', jabatan: 'Ketua Panitia', hp: '0812-8839-5550', isCore: true },
  { nama: 'Sugiono', jabatan: 'Wakil Ketua', hp: '0831-8395-0205', isCore: true },
  { nama: 'Lani', jabatan: 'Sekretaris', hp: '0813-7116-2792', isCore: true },
  { nama: 'Aulia Komari', jabatan: 'Bendahara 1', hp: '0812-3456-7892', isCore: true },
  { nama: 'Puput', jabatan: 'Bendahara 2', hp: '0831-8330-3884', isCore: true },
  { nama: 'Aryo', jabatan: 'Runner', hp: '0856-0134-31284', isCore: true },
  { nama: 'M.Dzaki', jabatan: 'MC', hp: '0858-3660-5110' },
  { nama: 'Lukman', jabatan: 'MC', hp: '0853-xxx-xxx' },
  { nama: 'Agha', jabatan: 'Koordinator Lomba', hp: '0851-9433-4760' },
  { nama: 'Adib', jabatan: 'Koordinator Lomba', hp: '0813-6365-2626' },
  { nama: 'Hanif', jabatan: 'Koordinator Lomba', hp: '0881-3712-0796' },
  { nama: 'Satria', jabatan: 'Koordinator Lomba', hp: '0819-9201-0197' },
  { nama: 'Ridho Ananda', jabatan: 'Koordinator Lomba', hp: '0823-8718-8929' },
  { nama: 'Andre', jabatan: 'Koordinator Lomba', hp: '08xx-xxx-xxx' },
  { nama: 'Dio', jabatan: 'Koordinator Lomba', hp: '0813-7112-100' },
  { nama: 'Reza', jabatan: 'Koordinator Lomba', hp: '08xx-xxx-xxx' },
];

// ============================================
// BUDGET DATA
// ============================================
export interface BudgetRow {
  komponen: string;
  jumlah: number;
  detailKey?: string;
  isTotal?: boolean;
  isSurplus?: boolean;
}

export const budgetRows: BudgetRow[] = [
  { komponen: 'Total Anggaran — Pesta Rakyat (17 Agt)', jumlah: 10000000, detailKey: 'pestaRakyat' },
  { komponen: 'Total Anggaran — Malam Puncak (22 Agt Malam)', jumlah: 7000000, detailKey: 'malamPuncak' },
  { komponen: 'TOTAL KEBUTUHAN ANGGARAN', jumlah: 17000000, isTotal: true },
  { komponen: 'Total Dana Masuk (Pendanaan)', jumlah: 17 000000, detailKey: 'danaMasuk' },
  { komponen: 'SELISIH (Dana Masuk - Kebutuhan)', jumlah: 0, isSurplus: true },
];

export interface BudgetDetail { item: string; qty: string; harga: number; subtotal: number; }
export const budgetDetails: Record<string, BudgetDetail[]> = {
  pestaRakyat: [
    { item: 'Hadiah & Piala Lomba', qty: '13 lomba', harga: 500000, subtotal: 4000000 },
    { item: 'Peralatan Lomba', qty: '1 paket', harga: 1500000, subtotal: 1500000 },
    { item: 'Konsumsi & Snack Siang', qty: '1 paket', harga: 2500000, subtotal: 2500000 },
    { item: 'Dekorasi & Sound System', qty: '1 paket', harga: 2000000, subtotal: 2000000 },
  ],
  malamPuncak: [
    { item: 'Panggung & Backdrop', qty: '1 set', harga: 2000000, subtotal: 2000000 },
    { item: 'Hiburan', qty: '1 paket', harga: 1500000, subtotal: 1500000 },
    { item: 'Konsumsi Malam', qty: '1 paket', harga: 2000000, subtotal: 2000000 },
    { item: 'Dokumentasi & Lain-lain', qty: '1 paket', harga: 1500000, subtotal: 1500000 },
  ],
  danaMasuk: [
    { item: 'Iuran Warga (Rp50.000 x KK)', qty: '±200 KK', harga: 50000, subtotal: 10000000 },
    { item: 'Sponsor & Donatur', qty: 'Beberapa', harga: 0, subtotal: 5000000 },
    { item: 'Donasi Online (QRIS/Transfer)', qty: 'Terbuka', harga: 0, subtotal: 4000000 },
  ],
};

export function formatRupiah(val: number): string {
  return 'Rp ' + Math.abs(val).toLocaleString('id-ID');
}

// ============================================
// RUNDOWN DATA
// ============================================
export interface RundownItem {
  waktu: string;
  kegiatan: string;
  icon: string;
  keterangan?: string;
}

export const rundownPagi: RundownItem[] = [
  { waktu: '06:00', kegiatan: 'Persiapan Lokasi & Registrasi Peserta', icon: '📋', keterangan: 'Panitia & Peserta' },
  { waktu: '07:00', kegiatan: 'Upacara Bendera & Pembukaan Resmi', icon: '🇮🇩', keterangan: 'Seluruh Warga' },
  { waktu: '07:30', kegiatan: 'Sambutan Ketua RT & Ketua Panitia', icon: '🎤', keterangan: 'Undangan' },
  { waktu: '08:00', kegiatan: 'Senam Pagi Bersama', icon: '🏋️', keterangan: 'Umum' },
  { waktu: '08:30', kegiatan: 'Lomba Anak-anak (Makan Kerupuk, Balap Kelereng, Estafet Penguin)', icon: '👶', keterangan: 'Usia 5-15 tahun' },
  { waktu: '09:30', kegiatan: 'Lomba Remaja (Futsal Mini, Salah Sambung, Estafet Penguin)', icon: '🧑', keterangan: 'Usia 13-17 tahun' },
  { waktu: '11:00', kegiatan: 'Lomba Bapak-bapak (Tarik Tambang, Joget Kursi, Estafet Tepung)', icon: '👨', keterangan: 'Bapak-bapak' },
  { waktu: '12:00', kegiatan: 'Istirahat, Sholat & Makan Siang', icon: '🍛', keterangan: 'Seluruh Warga' },
  { waktu: '13:00', kegiatan: 'Lomba Ibu-ibu (Hias Tumpeng, Fashion Daster, Joget Kursi)', icon: '👩', keterangan: 'Ibu-ibu' },
  { waktu: '15:00', kegiatan: 'Lomba Keluarga (Make Up Buta)', icon: '👨‍👩‍👧', keterangan: 'Pasangan' },
  { waktu: '16:00', kegiatan: 'Istirahat & Persiapan Malam Puncak', icon: '⏸️' },
];

export const rundownMalam: RundownItem[] = [
  { waktu: '19:00', kegiatan: 'Pembukaan Malam Puncak', icon: '🎊', keterangan: 'MC & Panitia' },
  { waktu: '19:30', kegiatan: 'Hiburan Rakyat & Pentas Seni', icon: '🎶', keterangan: 'Warga' },
  { waktu: '20:30', kegiatan: 'Pengumuman Pemenang & Penyerahan Hadiah', icon: '🏆', keterangan: 'Seluruh Warga' },
  { waktu: '21:00', kegiatan: 'Doorprize & Hiburan Penutup', icon: '🎁', keterangan: 'Undian Warga' },
  { waktu: '21:30', kegiatan: 'Sambutan Penutup & Doa Bersama', icon: '🤲', keterangan: 'Ketua RT' },
  { waktu: '22:00', kegiatan: 'Acara Selesai — Bersih-bersih Bersama', icon: '🧹', keterangan: 'Panitia' },
];
