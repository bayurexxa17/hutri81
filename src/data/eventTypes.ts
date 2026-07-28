export interface EventType {
  id: string;
  name: string;
  category: string;
  icon: string;
}

export const eventTypes: EventType[] = [
  { id: 'makan-kerupuk', name: 'Makan Kerupuk', category: 'Anak-anak', icon: '🍘' },
  { id: 'futsal-mini', name: 'Futsal Mini', category: 'Remaja & Dewasa', icon: '⚽' },
  { id: 'balap-kelereng', name: 'Balap Kelereng', category: 'Anak-anak', icon: '🥄' },
  { id: 'tarik-tambang', name: 'Tarik Tambang', category: 'Dewasa', icon: '🪢' },
  { id: 'hias-tumpeng', name: 'Hias Tumpeng', category: 'Ibu-ibu', icon: '🍚' },
  { id: 'fashion-daster', name: 'Fashion Week Daster', category: 'Ibu-ibu', icon: '👗' },
  { id: 'estafet-tepung', name: 'Estafet Tepung', category: 'Anak-anak', icon: '🏃' },
];

export interface PanduanLomba {
  id: string;
  title: string;
  icon: string;
  kategori: string;
  peserta: string;
  waktu: string;
  tempat: string;
  aturan: string[];
  hadiah: string[];
}

export const panduanLomba: PanduanLomba[] = [
  {
    id: 'makan-kerupuk',
    title: 'Makan Kerupuk',
    icon: '🍘',
    kategori: 'Anak-anak (5–12 tahun)',
    peserta: 'Max 20 anak',
    waktu: '08:00 – 09:00 WIB',
    tempat: 'Lapangan Blok Mawar',
    aturan: [
      'Kerupuk digantung setinggi kepala peserta',
      'Tangan harus di belakang (tidak boleh memegang kerupuk)',
      'Peserta tercepat menghabiskan kerupuk menang',
      'Juri: 2 orang panitia resmi',
    ],
    hadiah: ['Juara 1: Piala + Voucher Rp100.000', 'Juara 2: Piala + Voucher Rp75.000', 'Juara 3: Piala + Voucher Rp50.000'],
  },
  {
    id: 'futsal-mini',
    title: 'Futsal Mini',
    icon: '⚽',
    kategori: 'Remaja & Dewasa',
    peserta: '8 Tim (5 per tim)',
    waktu: '09:00 – 12:00 WIB',
    tempat: 'Lapangan Serbaguna',
    aturan: [
      'Format: Knock-out (gugur)',
      'Durasi: 2x10 menit per match',
      'Wajib pakai sepatu futsal',
      'Wasit resmi panitia',
    ],
    hadiah: ['Juara 1: Piala + Rp500.000', 'Juara 2: Piala + Rp300.000'],
  },
  {
    id: 'balap-kelereng',
    title: 'Balap Kelereng',
    icon: '🥄',
    kategori: 'Anak-anak (5–10 tahun)',
    peserta: 'Max 20 anak',
    waktu: '09:00 – 10:00 WIB',
    tempat: 'Jalan Blok Mawar',
    aturan: [
      'Kelereng diletakkan di atas sendok yang digigit',
      'Jarak: 15 meter',
      'Jika kelereng jatuh, ulangi dari start',
      'Paling cepat sampai finish menang',
    ],
    hadiah: ['Juara 1: Piala + Voucher Rp100.000', 'Juara 2: Piala + Voucher Rp75.000', 'Juara 3: Piala + Voucher Rp50.000'],
  },
  {
    id: 'tarik-tambang',
    title: 'Tarik Tambang',
    icon: '🪢',
    kategori: 'Dewasa (Bapak-bapak)',
    peserta: '4 Tim (10 per tim)',
    waktu: '10:00 – 11:00 WIB',
    tempat: 'Lapangan Blok Mawar',
    aturan: [
      'Setiap tim terdiri dari 10 orang',
      'Best of 3 (menang 2 dari 3 ronde)',
      'Wajib lepas sandal/alas kaki',
      'Dilarang mengikat tali ke badan',
    ],
    hadiah: ['Juara 1: Piala Tim + Rp300.000', 'Juara 2: Piala Tim + Rp200.000'],
  },
  {
    id: 'hias-tumpeng',
    title: 'Hias Tumpeng',
    icon: '🍚',
    kategori: 'Ibu-ibu',
    peserta: 'Max 10 Tim (3 per tim)',
    waktu: '08:00 – 10:00 WIB',
    tempat: 'Tenda Utama',
    aturan: [
      'Bahan dasar nasi kuning disediakan panitia',
      'Lauk & hiasan bawa sendiri',
      'Waktu menghias: 90 menit',
      'Dinilai: Kreativitas, Kerapian, Rasa',
    ],
    hadiah: ['Juara 1: Piala + Voucher Rp150.000', 'Juara 2: Piala + Voucher Rp100.000', 'Juara 3: Piala + Voucher Rp75.000'],
  },
  {
    id: 'fashion-daster',
    title: 'Fashion Week Daster',
    icon: '👗',
    kategori: 'Ibu-ibu',
    peserta: 'Max 15 orang',
    waktu: '13:00 – 14:00 WIB',
    tempat: 'Panggung Utama',
    aturan: [
      'Wajib menggunakan daster',
      'Gaya jalan bebas & kreatif',
      'Dinilai: Penampilan, PD, Gaya',
      'Boleh pakai aksesoris tambahan',
    ],
    hadiah: ['Juara 1: Piala + Voucher Rp150.000', 'Juara 2: Piala + Voucher Rp100.000', 'Juara 3: Piala + Voucher Rp75.000'],
  },
  {
    id: 'estafet-tepung',
    title: 'Estafet Tepung',
    icon: '🏃',
    kategori: 'Anak-anak (7–12 tahun)',
    peserta: '6 Tim (4 per tim)',
    waktu: '14:00 – 15:00 WIB',
    tempat: 'Lapangan Blok Mawar',
    aturan: [
      'Tepung dipindahkan dengan piring dari ember A ke ember B',
      'Jarak: 10 meter per orang',
      'Estafet bergantian antar anggota',
      'Tim dengan tepung terbanyak di ember tujuan menang',
    ],
    hadiah: ['Juara 1: Piala Tim + Rp200.000', 'Juara 2: Piala Tim + Rp150.000'],
  },
];
