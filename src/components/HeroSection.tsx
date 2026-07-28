import { useState, useEffect } from 'react';
import heroSilhouette from '../assets/hero-silhouette.png';

interface Props {
  pesertaCount: number;
  lombaCount: number;
  totalDana: number;
  onDaftarClick: () => void;
  onLihatPesertaClick: () => void;
  onDonasiClick: () => void;
}

export default function HeroSection({ pesertaCount, lombaCount, totalDana, onDaftarClick, onLihatPesertaClick, onDonasiClick }: Props) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date('2026-08-17T00:00:00+07:00').getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section id="beranda" className="relative w-full overflow-hidden bg-gradient-to-br from-[#E31C25] via-[#C1272D] to-[#8B1A1A] min-h-[600px]">
      {/* Silhouette BG */}
      <div className="absolute right-0 bottom-0 opacity-[0.07] pointer-events-none select-none" style={{height:'90%'}}>
        <img src={heroSilhouette} alt="" className="h-full w-auto object-contain" draggable={false} />
      </div>
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-400/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-5 py-2 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm">
          <span className="text-sm">🇮🇩</span>
          <span className="text-xs font-bold text-white/90 tracking-widest uppercase">Dirgahayu Republik Indonesia</span>
          <span className="text-sm">🇮🇩</span>
        </div>

        {/* Title */}
        <h1 className="leading-[1.05] mb-4">
          <span className="block text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg">
            HUT KEMERDEKAAN
          </span>
          <span className="block text-4xl sm:text-5xl lg:text-6xl font-black text-yellow-300 tracking-tight drop-shadow-lg mt-1">
            RI KE-81
          </span>
        </h1>

        {/* Subtitle */}
        <div className="text-white/90 mb-6">
          <p className="text-base sm:text-lg">Perumahan <strong>Ciptaland Blok Mawar</strong></p>
          <p className="text-sm text-white/70">RT 002 / RW 014</p>
        </div>

        {/* Countdown label */}
        <p className="text-white/80 text-sm font-semibold mb-3">🎉 Menuju Hari Kemerdekaan 🎉</p>

        {/* Countdown */}
        <div className="flex gap-3 sm:gap-4 mb-8">
          {[
            { val: pad(time.days), label: 'HARI' },
            { val: pad(time.hours), label: 'JAM' },
            { val: pad(time.minutes), label: 'MENIT' },
            { val: pad(time.seconds), label: 'DETIK' },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center">
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">{t.val}</span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-white/70 mt-1.5 tracking-wider">{t.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <button onClick={onDaftarClick} className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#C1272D] font-bold text-sm rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
            📝 Daftar Lomba
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
          <button onClick={onLihatPesertaClick} className="flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent text-white font-bold text-sm rounded-full border-2 border-white/60 hover:bg-white/10 transition-all">
            📋 Lihat Peserta Live ({pesertaCount})
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
          {/* 1. 50K/KK */}
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow cursor-default">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-xl sm:text-2xl font-black text-gray-900">50K<span className="text-sm font-bold text-gray-500">/KK</span></div>
            <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Partisipasi Warga</div>
          </div>
          {/* 2. Lomba count */}
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow cursor-default">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xl sm:text-2xl font-black text-gray-900">{lombaCount}+</div>
            <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Lomba</div>
          </div>
          {/* 3. DANA */}
          <div className="bg-white rounded-2xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow cursor-default">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-lg sm:text-xl font-black text-[#C1272D]">{totalDana > 0 ? `${(totalDana / 1000000).toFixed(1)}jt` : 'Rp 0'}</div>
            <div className="text-[10px] text-gray-400 font-semibold mt-0.5">{totalDana > 0 ? 'Terkumpul' : 'Belum ada data'}</div>
          </div>
          {/* 4. ❤️ Donasi */}
          <button onClick={onDonasiClick} className="bg-white rounded-2xl shadow-lg p-4 text-center hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-0">
            <div className="text-2xl mb-1">❤️</div>
            <div className="text-lg sm:text-xl font-black text-pink-600">Donasi</div>
            <div className="text-[10px] text-gray-400 font-semibold mt-0.5">Klik di sini</div>
          </button>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 60" className="w-full" preserveAspectRatio="none">
          <path d="M0,30 Q360,60 720,30 Q1080,0 1440,30 L1440,60 L0,60 Z" fill="#F5F5F0" />
        </svg>
      </div>
    </section>
  );
}
