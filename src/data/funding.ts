export interface FundingSource {
  id: string;
  sumber: string;
  jumlah: number;
  status: 'confirmed' | 'pending';
}

export const fundingSources: FundingSource[] = [
  { id: 'f1', sumber: 'Iuran Warga RT 001–004', jumlah: 6000000, status: 'confirmed' },
  { id: 'f2', sumber: 'Sponsor Toko Material Bapak Haji', jumlah: 2000000, status: 'confirmed' },
  { id: 'f3', sumber: 'Donasi Online (QRIS)', jumlah: 1500000, status: 'pending' },
  { id: 'f4', sumber: 'Kas RT Blok Mawar', jumlah: 2000000, status: 'confirmed' },
  { id: 'f5', sumber: 'Sponsor Warung Bu Siti', jumlah: 1000000, status: 'pending' },
];

export const fundingTotal = fundingSources.reduce((sum, f) => sum + f.jumlah, 0);
