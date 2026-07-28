import { useState } from 'react';

interface Props { onBack: () => void; }

interface GalleryItem {
  id: number;
  type: 'photo' | 'video';
  thumb: string;
  full: string;
  title: string;
  credit: string;
}

const items: GalleryItem[] = [
  {
    id: 1, type: 'photo',
    thumb: 'https://images.pexels.com/photos/33807994/pexels-photo-33807994.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    full: 'https://images.pexels.com/photos/33807994/pexels-photo-33807994.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Panjat Pinang — Lomba Tradisional 17 Agustus',
    credit: 'Rakhmat Suwandi / Pexels',
  },
  {
    id: 2, type: 'photo',
    thumb: 'https://images.pexels.com/photos/32293284/pexels-photo-32293284.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    full: 'https://images.pexels.com/photos/32293284/pexels-photo-32293284.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Lomba Tradisional Anak-anak HUT RI',
    credit: 'Yazid N / Pexels',
  },
  {
    id: 3, type: 'photo',
    thumb: 'https://images.pexels.com/photos/33807987/pexels-photo-33807987.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    full: 'https://images.pexels.com/photos/33807987/pexels-photo-33807987.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Panjat Pinang — Semangat Kemerdekaan',
    credit: 'Rakhmat Suwandi / Pexels',
  },
  {
    id: 4, type: 'photo',
    thumb: 'https://images.pexels.com/photos/13389844/pexels-photo-13389844.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    full: 'https://images.pexels.com/photos/13389844/pexels-photo-13389844.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Anak-anak Membawa Bendera Merah Putih',
    credit: 'Irgi Nur Fadil / Pexels',
  },
  {
    id: 5, type: 'photo',
    thumb: 'https://images.pexels.com/photos/33807990/pexels-photo-33807990.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    full: 'https://images.pexels.com/photos/33807990/pexels-photo-33807990.jpeg?auto=compress&cs=tinysrgb&w=1920',
    title: 'Perayaan HUT RI — Panjat Pinang Berhadiah',
    credit: 'Rakhmat Suwandi / Pexels',
  },
  {
    id: 6, type: 'photo',
    thumb: 'https://images.pexels.com/photos/16130194/pexels-photo-16130194.png?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    full: 'https://images.pexels.com/photos/16130194/pexels-photo-16130194.png?auto=compress&cs=tinysrgb&w=1920',
    title: 'Bocah Panjat Pinang — Tradisi 17 Agustus',
    credit: 'Ayyeee Ayyeee / Pexels',
  },
  {
    id: 101, type: 'video',
    thumb: 'https://images.pexels.com/videos/34373272/karrnafal-17-agustus-desa-beruk-jatiyoso-34373272.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    full: 'https://videos.pexels.com/video-files/34373272/14563035_1920_1080_30fps.mp4',
    title: 'Karnaval 17 Agustus — Parade Desa',
    credit: 'just a hobby / Pexels',
  },
  {
    id: 102, type: 'video',
    thumb: 'https://images.pexels.com/videos/34373278/karrnafal-17-agustus-desa-beruk-jatiyoso-34373278.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    full: 'https://videos.pexels.com/video-files/34373278/14563041_1920_1080_30fps.mp4',
    title: 'Karnaval 17 Agustus — Aerial View',
    credit: 'just a hobby / Pexels',
  },
  {
    id: 103, type: 'video',
    thumb: 'https://images.pexels.com/videos/29936584/pexels-photo-29936584.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=600',
    full: 'https://videos.pexels.com/video-files/29936584/12848560_1920_1080_30fps.mp4',
    title: 'Pawai Budaya Kemerdekaan',
    credit: 'Sergei Starostin / Pexels',
  },
];

export default function GalleryPage({ onBack }: Props) {
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [videoPlayer, setVideoPlayer] = useState<GalleryItem | null>(null);

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter);
  const photoCount = items.filter(i => i.type === 'photo').length;
  const videoCount = items.filter(i => i.type === 'video').length;

  const handleCardClick = (item: GalleryItem) => {
    if (item.type === 'video') {
      setVideoPlayer(item);
    } else {
      setLightbox(item);
    }
  };

  const handleDownload = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = name;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* NAVBAR */}
      <nav className="bg-[#B71C22] shadow-lg px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={onBack} className="text-white/80 hover:text-white text-sm font-semibold transition flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          Kembali
        </button>
        <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center font-black text-[#C1272D] text-xs shadow">81</div>
        <span className="font-bold text-white text-sm">📸 Galeri HUT RI ke-81</span>
      </nav>

      {/* HEADER */}
      <div className="text-center pt-12 pb-8 px-4">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center justify-center gap-3">
          <span>📸</span> GALERI DOKUMENTASI
        </h1>
        <p className="text-gray-500 mt-2">HUT RI ke-81 — Perumahan Ciptaland Blok Mawar RT 002/RW 014</p>
        <p className="text-xs text-gray-400 mt-1">Klik gambar untuk memperbesar • Klik video untuk memutar</p>
      </div>

      {/* FILTER */}
      <div className="flex gap-3 justify-center mb-8 px-4">
        {([['all', '📋', 'Semua', items.length], ['photo', '📷', 'Foto', photoCount], ['video', '🎬', 'Video', videoCount]] as const).map(([id, icon, label, count]) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              filter === id ? 'bg-[#C1272D] text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {icon} {label} ({count})
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="max-w-5xl mx-auto px-4 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <div key={item.id}
              onClick={() => handleCardClick(item)}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="relative aspect-[3/2] overflow-hidden bg-gray-200">
                <img
                  src={item.thumb}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Badge */}
                <div className={`absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md ${
                  item.type === 'video' ? 'bg-blue-600 text-white' : 'bg-white/95 text-gray-700 border'
                }`}>
                  {item.type === 'video' ? '🎬 Video' : '📷 Foto'}
                </div>
                {/* Play button for video */}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-black/60 group-hover:scale-110 transition-all shadow-xl">
                      <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-gray-900 leading-snug">{item.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">{item.credit}</p>
                  <span className="text-xs font-bold text-[#C1272D] flex items-center gap-1">
                    {item.type === 'video' ? '▶ Putar' : '🔍 Zoom'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">📷</div>
            <p className="font-semibold">Belum ada konten untuk kategori ini</p>
          </div>
        )}

        {/* UPLOAD HINT */}
        <div className="mt-12 bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
          <div className="text-4xl mb-3">📤</div>
          <h4 className="font-bold text-gray-800 mb-1">Kirim Foto & Video Anda</h4>
          <p className="text-sm text-gray-400 mb-3">Bagikan momen kemerdekaan bersama warga Blok Mawar</p>
          <p className="text-xs text-gray-400">Kirim via WhatsApp ke Panitia atau email ke:</p>
          <p className="text-sm font-bold text-[#C1272D] mt-1">panitiahutri81.mawar002@gmail.com</p>
        </div>
      </div>

      {/* ===== PHOTO LIGHTBOX ===== */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/90 z-10">
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-sm truncate">{lightbox.title}</h3>
              <p className="text-gray-500 text-xs">{lightbox.credit}</p>
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(lightbox.full, `hutri81-foto-${lightbox.id}.jpg`); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
              >📥 Download HD</button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
                className="w-9 h-9 bg-white/10 hover:bg-red-600 text-white rounded-lg flex items-center justify-center text-lg transition"
              >✕</button>
            </div>
          </div>
          {/* Image - click to close */}
          <div className="flex-1 flex items-center justify-center p-4 cursor-pointer" onClick={() => setLightbox(null)}>
            <img
              src={lightbox.full}
              alt={lightbox.title}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="text-center py-2 text-gray-600 text-[11px] bg-black/90">Klik area gelap untuk menutup</div>
        </div>
      )}

      {/* ===== VIDEO PLAYER ===== */}
      {videoPlayer && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            {/* Close button */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-white font-bold text-sm">{videoPlayer.title}</h3>
                <p className="text-gray-500 text-xs">{videoPlayer.credit}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(videoPlayer.full, `hutri81-video-${videoPlayer.id}.mp4`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                >📥 Download</button>
                <button
                  onClick={() => setVideoPlayer(null)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
                >✕ Tutup</button>
              </div>
            </div>
            {/* Video element */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <video
                key={videoPlayer.id}
                controls
                autoPlay
                playsInline
                className="w-full aspect-video bg-black"
                src={videoPlayer.full}
              >
                Browser Anda tidak mendukung video.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] text-center py-6 px-4">
        <p className="text-gray-500 text-xs">© 2026 Panitia HUT RI ke-81 — Perumahan Ciptaland Blok Mawar 🇮🇩</p>
      </footer>
    </div>
  );
}
