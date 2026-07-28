export function formatRupiah(val: number): string {
  return 'Rp ' + val.toLocaleString('id-ID');
}

export const budgetSummary = {
  totalKebutuhan: 15750000,
  targetDanaMasuk: 12500000,
  selisih: -3250000,
};

export interface BudgetComponent {
  id: string;
  komponen: string;
  jumlah: number;
  detailKey?: string;
  isTotal?: boolean;
  isDeficit?: boolean;
}

export const budgetComponents: BudgetComponent[] = [
  { id: 'b1', komponen: 'Hadiah & Piala Lomba', jumlah: 5500000, detailKey: 'hadiah' },
  { id: 'b2', komponen: 'Dekorasi & Panggung', jumlah: 3200000, detailKey: 'dekorasi' },
  { id: 'b3', komponen: 'Konsumsi & Snack', jumlah: 2800000, detailKey: 'konsumsi' },
  { id: 'b4', komponen: 'Peralatan Lomba', jumlah: 1500000, detailKey: 'peralatan' },
  { id: 'b5', komponen: 'Dokumentasi & Sound', jumlah: 1250000, detailKey: 'dokumentasi' },
  { id: 'b6', komponen: 'Operasional & Lain-lain', jumlah: 1500000, detailKey: 'operasional' },
  { id: 'btotal', komponen: 'TOTAL KEBUTUHAN', jumlah: 15750000, isTotal: true },
  { id: 'bdeficit', komponen: 'SELISIH (DEFISIT)', jumlah: -3250000, isDeficit: true },
];

export interface BudgetDetail {
  item: string;
  qty: string;
  harga: number;
  subtotal: number;
}

export const budgetDetails: Record<string, BudgetDetail[]> = {
  hadiah: [
    { item: 'Piala Juara 1-3', qty: '7 set', harga: 350000, subtotal: 2450000 },
    { item: 'Voucher Belanja', qty: '14 pcs', harga: 100000, subtotal: 1400000 },
    { item: 'Medali Emas/Perak/Perunggu', qty: '21 pcs', harga: 50000, subtotal: 1050000 },
    { item: 'Hadiah Hiburan', qty: '1 paket', harga: 600000, subtotal: 600000 },
  ],
  dekorasi: [
    { item: 'Backdrop Panggung', qty: '1 set', harga: 1200000, subtotal: 1200000 },
    { item: 'Balon & Umbul-umbul', qty: '1 paket', harga: 800000, subtotal: 800000 },
    { item: 'Bendera Merah Putih', qty: '50 pcs', harga: 12000, subtotal: 600000 },
    { item: 'Spanduk & Banner', qty: '3 pcs', harga: 200000, subtotal: 600000 },
  ],
  konsumsi: [
    { item: 'Nasi Box Panitia', qty: '30 box', harga: 25000, subtotal: 750000 },
    { item: 'Snack Box Peserta', qty: '80 box', harga: 15000, subtotal: 1200000 },
    { item: 'Air Mineral & Es', qty: '1 paket', harga: 450000, subtotal: 450000 },
    { item: 'Kopi & Teh', qty: '1 paket', harga: 400000, subtotal: 400000 },
  ],
  peralatan: [
    { item: 'Kerupuk Lomba', qty: '100 pcs', harga: 3000, subtotal: 300000 },
    { item: 'Kelereng & Sendok', qty: '50 set', harga: 5000, subtotal: 250000 },
    { item: 'Tali Tambang', qty: '2 pcs', harga: 150000, subtotal: 300000 },
    { item: 'Perlengkapan Lainnya', qty: '1 paket', harga: 650000, subtotal: 650000 },
  ],
  dokumentasi: [
    { item: 'Sewa Sound System', qty: '1 hari', harga: 750000, subtotal: 750000 },
    { item: 'Fotografer & Videografer', qty: '1 orang', harga: 500000, subtotal: 500000 },
  ],
  operasional: [
    { item: 'Transportasi Panitia', qty: '1 paket', harga: 500000, subtotal: 500000 },
    { item: 'P3K & Obat-obatan', qty: '1 paket', harga: 300000, subtotal: 300000 },
    { item: 'Cetak Undangan & Sertifikat', qty: '1 paket', harga: 400000, subtotal: 400000 },
    { item: 'Dana Cadangan', qty: '1 paket', harga: 300000, subtotal: 300000 },
  ],
};
