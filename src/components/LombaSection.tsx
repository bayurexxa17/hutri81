import { useState } from 'react';
import { lombaList, lombaCategories, type LombaItem } from '../data/siteData';

interface Props {
  onDaftarLomba: (lombaId: string) => void;
}

export default function LombaSection({ onDaftarLomba }: Props) {
  const [activeCategory, setActiveCategory] = useState('semua');
  const [detailLomba, setDetailLomba] = useState<LombaItem | null>(null);

  const filtered = activeCategory === 'semua' ? lombaList : lombaList.filter(l => l.kategori === activeCategory);

  return (
    <section id="lomba" className="py-16 px-4 bg-[#F5F5F0]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">🏆 ANEKA LOMBA</h2>
          <p className="text-gray-500 mt-2">Pilih Lomba Favoritmu</p>
          <p className="text-xs text-gray-400 mt-1">Klik kartu untuk melihat detail panduan lomba</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide justify-center flex-wrap">
          {lombaCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#C1272D] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Lomba Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(lomba => (
            <div key={lomba.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{lomba.icon}</span>
                  <span className="text-[10px] font-bold text-[#C1272D] bg-red-50 px-2 py-1 rounded-full">{lomba.kategoriLabel}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{lomba.nama}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{lomba.deskripsi}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">⏰ {lomba.waktu}</span>
                  <span className="flex items-center gap-1">🏆 Hadiah: {lomba.hadiah}</span>
                </div>
                <div className="text-xs text-gray-400 mb-4">👥 {lomba.peserta}</div>
                <div className="flex gap-2">
                  <button onClick={() => setDetailLomba(lomba)} className="flex-1 text-xs font-bold text-[#C1272D] border border-[#C1272D] py-2.5 rounded-xl hover:bg-[#C1272D] hover:text-white transition-all">
                    🔍 Detail
                  </button>
                  <button onClick={() => onDaftarLomba(lomba.id)} className="flex-1 text-xs font-bold text-white bg-[#C1272D] py-2.5 rounded-xl hover:bg-red-700 transition-all">
                    📝 Daftar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {detailLomba && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetailLomba(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C1272D] to-[#8B1A1A] px-6 py-5 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full">{detailLomba.kategoriLabel} • Klik untuk Detail</span>
                <button onClick={() => setDetailLomba(null)} className="text-white/70 hover:text-white text-xl">✕</button>
              </div>
              <h3 className="text-xl font-black mt-3">{detailLomba.nama}</h3>
              <p className="text-white/70 text-xs mt-1">{detailLomba.kategoriLabel} • {detailLomba.waktu} • {detailLomba.hadiah}</p>
            </div>
            <div className="p-6">
              <div className="text-center mb-5">
                <span className="text-5xl">{detailLomba.icon}</span>
                <p className="text-sm text-gray-600 mt-3">{detailLomba.deskripsi}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-400 font-bold">Waktu</div>
                  <div className="font-bold text-sm mt-1">{detailLomba.waktu}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-400 font-bold">Hadiah</div>
                  <div className="font-bold text-sm mt-1">{detailLomba.hadiah}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-400 font-bold">Peserta</div>
                  <div className="font-bold text-sm mt-1">{detailLomba.peserta}</div>
                </div>
              </div>
              <div className="mb-5">
                <h4 className="font-bold text-sm mb-2">📋 Peraturan Lomba:</h4>
                <ul className="space-y-1.5">
                  {detailLomba.peraturan.map((p, i) => (
                    <li key={i} className="text-xs text-gray-600 flex gap-2 items-start">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDetailLomba(null)} className="flex-1 text-sm font-bold text-gray-600 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition">Tutup</button>
                <button onClick={() => { onDaftarLomba(detailLomba.id); setDetailLomba(null); }} className="flex-1 text-sm font-bold text-white bg-[#C1272D] py-3 rounded-xl hover:bg-red-700 transition">📝 Daftar Lomba Ini</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
