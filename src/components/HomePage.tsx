import { useEffect, useState } from "react";
import type { View } from "../types";

type HomePageProps = {
  onNavigate: (view: View) => void;
};

const quickServices: {
  label: string;
  view: View;
  color: string;
  icon: "chat" | "home" | "apt" | "clip" | "base" | "shield" | "cog";
}[] = [
  { label: "Berlangganan Sekarang", view: "subscribe", color: "bg-[#22c55e]", icon: "chat" },
  { label: "Internet Rumah", view: "internet-rumah", color: "bg-[#3b82f6]", icon: "home" },
  { label: "Internet Apartemen", view: "internet-apartemen", color: "bg-[#f59e0b]", icon: "apt" },
  { label: "Cek Paket Internet", view: "packages", color: "bg-[#8b5cf6]", icon: "clip" },
  { label: "Local Homebase", view: "local-homebase", color: "bg-[#ef4444]", icon: "base" },
  { label: "Mitra RT", view: "rt-admin", color: "bg-[#0b1d36]", icon: "shield" },
  { label: "Admin Pusat", view: "admin-dashboard", color: "bg-[#7c3aed]", icon: "cog" },
];

const benefits = [
  { title: "100% Fiber Optic", desc: "Koneksi stabil super cepat hingga ke rumah Anda", icon: "fiber" },
  { title: "Modem Wifi", desc: "ONT Dual Band WiFi siap pakai termasuk perangkat", icon: "wifi" },
  { title: "Tanpa Kuota", desc: "Internet unlimited tanpa FUP, streaming sepuasnya", icon: "quota" },
  { title: "Premium Channel", desc: "Saluran TV premium untuk hiburan seluruh keluarga", icon: "tv" },
  { title: "TV Apps", desc: "Akses aplikasi hiburan favorit langsung di layar TV", icon: "apps" },
  { title: "Video On Demand", desc: "Tonton film & serial kapan saja sesuai keinginan", icon: "vod" },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div>
      <Hero onNavigate={onNavigate} />
      <QuickBar onNavigate={onNavigate} />
      <VideoSection />
      <FeatureSplit
        reverse={false}
        eyebrow="STREAM"
        title={
          <>
            Stream On
            <br />
            Up to 200Mbps!
          </>
        }
        product="Stream Internet Unlimited"
        body="Untuk streamer sejati, apapun aplikasinya dapatkan kualitas streaming yang maksimal dan stabil dengan langganan paket wifi internet cepat kami."
        image="/images/couple-sofa.png"
        imageAlt="Pasangan muda di sofa menggunakan laptop"
        onDetail={() => onNavigate("package-stream")}
      />
      <FeatureSplit
        reverse
        eyebrow="STREAM+"
        title={<>Total Entertainment</>}
        product="Stream+ Internet Entertainment Unlimited"
        body="Berselancar dengan internet up to 200Mbps yang dilengkapi tayangan Saluran TV untuk hiburan seluruh anggota keluarga. Pasang dan nikmati keseruannya."
        image="/images/family-tv.png"
        imageAlt="Keluarga sedang menonton TV"
        onDetail={() => onNavigate("package-stream-plus")}
      />
      <FeatureSplit
        reverse={false}
        eyebrow="SUKA SUKA"
        title={
          <>
            Paket Fleksibel
            <br />
            Bikin Hidup Lebih Simpel
          </>
        }
        product="Suka Suka Internet Unlimited Fleksibel"
        body="Nikmati internet fleksibel hingga 150 Mbps, pilih paket harian atau mingguan, bayar sesuai kebutuhan Anda dengan ONT Dual Band WiFi. Pilih paket Anda sekarang dan nikmati kebebasannya!"
        image="/images/friends-cafe.png"
        imageAlt="Sekelompok teman muda berkumpul di kafe"
        onDetail={() => onNavigate("package-suka-suka")}
      />
      <BenefitsGrid />
    </div>
  );
}

type Slide = {
  bg: string;
  overlay: string;
  badge: string;
  title: React.ReactNode;
  titleClass?: string;
  sub: React.ReactNode;
  cardLabel: string;
  cardSpeed: string;
  cardPrice: string;
  cardUnit: string;
  cardTag: string;
  ctaLeft: { label: string; view: View; color: string };
  ctaRight: { label: string; view: View; color: string };
  people?: string;
};

const slides: Slide[] = [
  {
    bg: "/images/hero-bg.png",
    overlay: "bg-gradient-to-r from-[#ff7a18]/60 via-[#ffb347]/30 to-transparent",
    badge: "Promo Spesial",
    title: (
      <>
        INTERNET
        <br />
        SUKA-SUKA
      </>
    ),
    titleClass: "text-[#ff6a00]",
    sub: "Internet Fleksibel, Bayar Sesuai Kebutuhanmu!",
    cardLabel: "Paket Harian",
    cardSpeed: "Up to 150 Mbps",
    cardPrice: "Rp13.000",
    cardUnit: "/Hari",
    cardTag: "Bebas Atur Internetmu melalui Selfcare",
    ctaLeft: { label: "Lihat Paket", view: "package-suka-suka", color: "bg-[#22c55e] hover:bg-[#16a34a]" },
    ctaRight: { label: "Selfcare", view: "selfcare", color: "bg-[#f97316] hover:bg-[#ea580c]" },
    people: "/images/hero-people.png",
  },
  {
    bg: "/images/hero-bg-2.png",
    overlay: "bg-gradient-to-r from-[#0ea5a0]/60 via-[#22c55e]/25 to-transparent",
    badge: "Paling Populer",
    title: (
      <>
        STREAM ON
        <br />
        UP TO 200MBPS!
      </>
    ),
    titleClass: "text-white",
    sub: "Streaming, gaming, dan kerja dirumah stabil tanpa buffer.",
    cardLabel: "Stream 100",
    cardSpeed: "Up to 100 Mbps",
    cardPrice: "Rp576.000",
    cardUnit: "/bulan",
    cardTag: "Kuota unlimited · 100% Fiber Optic",
    ctaLeft: { label: "Lihat Detail", view: "package-stream", color: "bg-[#22c55e] hover:bg-[#16a34a]" },
    ctaRight: { label: "Berlangganan", view: "subscribe", color: "bg-[#0d9b8a] hover:bg-[#0a7a6d]" },
  },
  {
    bg: "/images/hero-bg-3.png",
    overlay: "bg-gradient-to-r from-[#1e3a8a]/70 via-[#6d28d9]/30 to-transparent",
    badge: "Keluarga",
    title: (
      <>
        TOTAL
        <br />
        ENTERTAINMENT
      </>
    ),
    titleClass: "text-white",
    sub: "Internet + saluran TV premium untuk seluruh anggota keluarga.",
    cardLabel: "Stream+ 100",
    cardSpeed: "Up to 100 Mbps",
    cardPrice: "Rp595.000",
    cardUnit: "/bulan",
    cardTag: "Premium Channel · VOD · TV Apps",
    ctaLeft: { label: "Lihat Detail", view: "package-stream-plus", color: "bg-[#22c55e] hover:bg-[#16a34a]" },
    ctaRight: { label: "Cek Area", view: "check-area", color: "bg-[#f97316] hover:bg-[#ea580c]" },
  },
];

function Hero({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [i, setI] = useState(0);
  const s = slides[i];

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);

  const go = (delta: number) => setI((v) => (v + delta + slides.length) % slides.length);

  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[560px] sm:min-h-[620px]">
        {slides.map((sl, idx) => (
          <div
            key={sl.bg}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
            aria-hidden={idx !== i}
          >
            <img src={sl.bg} alt="" className="h-full w-full object-cover" />
            <div className={`absolute inset-0 ${sl.overlay}`} />
          </div>
        ))}
      </div>

      <div className="absolute inset-0">
        <div className="mx-auto grid min-h-[560px] max-w-[1280px] items-center gap-6 px-4 py-10 sm:px-6 sm:min-h-[620px] lg:grid-cols-[1.05fr_0.85fr_1fr] lg:py-6">
          <div key={`t-${i}`} className="z-10 animate-slide-up">
            <p className="mb-3 inline-flex items-center rounded-full bg-white/25 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              {s.badge}
            </p>
            <h1 className={`font-display text-[44px] font-extrabold leading-[0.95] tracking-tight drop-shadow-[0_3px_0_rgba(0,0,0,0.18)] sm:text-[64px] lg:text-[72px] ${s.titleClass ?? "text-white"}`}>
              {s.title}
            </h1>
            <div className="mt-5 inline-block rotate-[-2deg] rounded-xl bg-[#facc15] px-4 py-2.5 shadow-[4px_4px_0_rgba(18,32,51,0.15)]">
              <p className="font-display text-[15px] font-extrabold leading-snug text-[#122033] sm:text-[17px]">
                {s.sub}
              </p>
            </div>
          </div>

          <div key={`c-${i}`} className="z-10 flex justify-center lg:justify-start">
            <div className="w-full max-w-[320px] rounded-[28px] bg-white/20 p-1 shadow-2xl backdrop-blur-md animate-slide-up">
              <div className="rounded-[24px] bg-white px-6 py-6 text-center shadow-xl">
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-oxy-teal">{s.cardLabel}</p>
                <p className="mt-2 font-display text-[22px] font-extrabold text-[#122033]">{s.cardSpeed}</p>
                <div className="mt-3 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 px-3 py-3">
                  <p className="text-[11px] font-semibold text-slate-500">Mulai dari</p>
                  <p className="font-display text-[36px] font-extrabold leading-none text-[#f97316]">
                    {s.cardPrice}
                    <span className="text-[16px] font-bold text-slate-600">{s.cardUnit}</span>
                  </p>
                </div>
                <p className="mt-4 text-[13px] font-semibold leading-snug text-slate-600">{s.cardTag}</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(s.ctaLeft.view)}
                    className={`rounded-full py-2.5 text-[12px] font-bold text-white shadow-sm ${s.ctaLeft.color}`}
                  >
                    {s.ctaLeft.label}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate(s.ctaRight.view)}
                    className={`rounded-full py-2.5 text-[12px] font-bold text-white shadow-sm ${s.ctaRight.color}`}
                  >
                    {s.ctaRight.label}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-center lg:justify-end">
            {s.people ? (
              <img
                src={s.people}
                alt=""
                className="h-[320px] w-auto max-w-full object-contain drop-shadow-2xl sm:h-[420px] lg:h-[520px]"
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center sm:h-[420px] lg:h-[520px]">
                <div className="grid max-w-[280px] gap-3 rounded-3xl bg-white/10 p-6 backdrop-blur-md">
                  {["#22c55e", "#f97316", "#facc15"].map((c, idx) => (
                    <div key={c} className="flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 shadow-lg">
                      <span className="h-3 w-3 rounded-full" style={{ background: c }} />
                      <span className="text-sm font-bold text-[#122033]">
                        {["100% Fiber Optic", "TV Premium", "Tanpa Kuota"][idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Slide sebelumnya"
        className="absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#122033] shadow-lg transition hover:bg-white sm:inline-flex"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Slide berikutnya"
        className="absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#122033] shadow-lg transition hover:bg-white sm:inline-flex"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${
              idx === i ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function QuickBar({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <section className="relative z-20 -mt-8 px-4 sm:-mt-10 sm:px-6">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-3 rounded-[28px] bg-white p-4 shadow-[0_16px_50px_rgba(11,29,54,0.12)] sm:grid-cols-4 sm:p-5 lg:grid-cols-7">
        {quickServices.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onNavigate(item.view)}
            className="group flex flex-col items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-slate-50"
          >
            <span
              className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg ${item.color} transition group-hover:scale-105`}
            >
              <QuickIcon name={item.icon} />
            </span>
            <span className="text-center text-[13px] font-bold leading-tight text-slate-700">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group relative overflow-hidden rounded-[28px] shadow-2xl shadow-slate-300/60"
        >
          <img
            src="/images/video-thumb.png"
            alt="Pria memegang router WiFi Putra.net"
            className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
          {!playing ? (
            <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#f97316] shadow-xl transition group-hover:scale-110">
              <svg className="ml-1 h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center bg-[#0b1d36]/80 p-8 text-center">
              <span>
                <p className="font-display text-2xl font-bold text-white">Putra.net by BTP</p>
                <p className="mt-2 text-sm text-white/70">
                  Video: Cara mudah terhubung dengan internet unlimited & cepat dari Putra.net
                </p>
              </span>
            </span>
          )}
        </button>

        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-oxy-teal">Putra.net by BTP</p>
          <h2 className="mt-2 font-display text-[32px] font-extrabold leading-tight text-[#122033] sm:text-[40px]">
            Terkoneksi Dengan Internet yang Unlimited & Cepat
          </h2>
          <p className="mt-5 text-[15px] leading-8 text-slate-600">
            Kami provider internet dan wifi yang memahami kebutuhan Anda. Kini bukan hanya internet yang
            unlimited serta cepat tapi juga dengan fitur yang lengkap dan harga yang terjangkau. Jaringan
            100% fiber optic Putra.net (dikelola oleh PT Bangun Tirta Pratama) menghadirkan koneksi stabil
            untuk bekerja, belajar, streaming, hingga bermain game tanpa khawatir buffer. Atur paket sesuai
            gaya hidup Anda — harian, mingguan, atau bulanan — langsung dari aplikasi Selfcare.
          </p>
          <p className="mt-4 text-[15px] leading-8 text-slate-600">
            Dengan basis layanan di Perumahan Ciptaland, Tiban — Kota Batam, Putra.net siap menjadi partner
            koneksi perumahan dan hunian vertikal Anda. Nikmati modem WiFi dual band, saluran TV premium,
            serta dukungan customer care 24 jam di +62 896-7575-7553.
          </p>
        </div>
      </div>
    </section>
  );
}

function FeatureSplit({
  reverse,
  eyebrow,
  title,
  product,
  body,
  image,
  imageAlt,
  onDetail,
}: {
  reverse: boolean;
  eyebrow: string;
  title: React.ReactNode;
  product: string;
  body: string;
  image: string;
  imageAlt: string;
  onDetail: () => void;
}) {
  return (
    <section className={reverse ? "bg-[#f7fafc]" : "bg-white"}>
      <div
        className={`mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20 ${
          reverse ? "lg:[&>div:first-child]:order-2" : ""
        }`}
      >
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-oxy-teal">{eyebrow}</p>
          <h2 className="mt-2 font-display text-[34px] font-extrabold leading-[1.1] text-[#122033] sm:text-[42px]">
            {title}
          </h2>
          <p className="mt-3 font-display text-[18px] font-bold text-[#f97316]">{product}</p>
          <p className="mt-4 max-w-xl text-[15px] leading-8 text-slate-600">{body}</p>
          <button
            type="button"
            onClick={onDetail}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-[#16a34a]"
          >
            Lihat Detail
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="overflow-hidden rounded-[28px] shadow-2xl shadow-slate-300/50">
          <img src={image} alt={imageAlt} className="aspect-[16/11] w-full object-cover" />
        </div>
      </div>
    </section>
  );
}

function BenefitsGrid() {
  return (
    <section className="bg-[#0b1d36] py-16 sm:py-20">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#facc15]">Kenapa Putra.net</p>
          <h2 className="mt-2 font-display text-[32px] font-extrabold text-white sm:text-[40px]">
            Semua yang Kamu Butuhkan dalam Satu Koneksi
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-[#13294b] px-5 py-8 text-center shadow-lg shadow-black/20"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white">
                <BenefitIcon name={item.icon} />
              </div>
              <h3 className="font-display text-[18px] font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickIcon({ name }: { name: "chat" | "home" | "apt" | "clip" | "base" | "shield" | "cog" }) {
  const common = "h-8 w-8";
  if (name === "chat") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 6.5A2.5 2.5 0 017.5 4h9A2.5 2.5 0 0119 6.5v7A2.5 2.5 0 0116.5 16H9l-4 3.2V6.5z" strokeLinejoin="round" />
        <path d="M8 9h8M8 12h5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "home") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 11.5L12 5l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-8.5z" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "apt") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="3" width="16" height="18" rx="1.5" />
        <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M11 21v-3" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "clip") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 4.5h6v2.5H9zM9 11h6M9 14h4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l8 3v6c0 5-3.4 8.5-8 9-4.6-.5-8-4-8-9V6l8-3z" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "cog") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.2a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.2a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.2a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.2a1.7 1.7 0 00-1.5 1z" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V8l8-5 8 5v12" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6M9 10h.01M12 10h.01M15 10h.01M9 13h.01M12 13h.01M15 13h.01" strokeLinecap="round" />
    </svg>
  );
}

function BenefitIcon({ name }: { name: string }) {
  const common = "h-8 w-8";
  if (name === "fiber") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 13c4-8 12-8 16 0" strokeLinecap="round" />
        <path d="M7 16c2.6-4.5 7.4-4.5 10 0" strokeLinecap="round" />
        <circle cx="12" cy="19" r="1.6" fill="currentColor" />
      </svg>
    );
  }
  if (name === "wifi") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="6" y="9" width="12" height="8" rx="2" />
        <path d="M9 9V7a3 3 0 016 0v2M8 21h8M12 17v4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "quota") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="8" />
        <path d="M8 12h8M15 9l2 3-2 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "tv") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 18v3" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "apps") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="4" y="4" width="6" height="6" rx="1.4" />
        <rect x="14" y="4" width="6" height="6" rx="1.4" />
        <rect x="4" y="14" width="6" height="6" rx="1.4" />
        <rect x="14" y="14" width="6" height="6" rx="1.4" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M10 10l5 3-5 3v-6z" fill="currentColor" stroke="none" />
    </svg>
  );
}
