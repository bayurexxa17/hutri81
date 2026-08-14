import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import Pages from "./components/Pages";
import HelpWidget from "./components/HelpWidget";
import RtAdmin from "./components/RtAdmin";
import SuperAdmin from "./components/SuperAdmin";
import type { View } from "./types";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [newsId, setNewsId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigate = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    document.title =
      view === "home"
        ? "Putra.net — Internet Unlimited by PT Bangun Tirta Pratama"
        : `Putra.net — ${labelOf(view)}`;
  }, [view]);

  const isRt = view === "rt-login" || view === "rt-admin";
  const isAdmin = view === "admin-login" || view === "admin-dashboard";

  return (
    <div className="min-h-screen bg-white">
      {!isRt && <Header view={view} onNavigate={navigate} onOpenSearch={() => setSearchOpen(true)} />}
      {view === "home" ? (
        <HomePage onNavigate={navigate} />
      ) : isRt ? (
        <RtAdmin view={view} onNavigate={navigate} />
      ) : isAdmin ? (
        <SuperAdmin view={view} onNavigate={navigate} />
      ) : (
        <Pages
          view={view}
          onNavigate={navigate}
          newsId={newsId}
          onOpenNews={(id) => {
            setNewsId(id);
            navigate("news-detail");
          }}
        />
      )}
      {!isRt && !isAdmin && <Footer onNavigate={navigate} />}
      {!isRt && !isAdmin && <HelpWidget />}
      {searchOpen && !isRt && !isAdmin && (
        <AreaModal
          onClose={() => setSearchOpen(false)}
          onFull={() => {
            setSearchOpen(false);
            navigate("check-area");
          }}
        />
      )}
    </div>
  );
}

function labelOf(view: View) {
  const map: Record<View, string> = {
    home: "Beranda",
    packages: "Paket & Harga",
    "package-stream": "Stream",
    "package-stream-plus": "Stream+",
    "package-suka-suka": "Suka Suka",
    "package-apartment": "Apartment & Mall",
    "package-addon": "Add On",
    news: "News",
    "news-detail": "News",
    help: "Bantuan",
    contact: "Hubungi Kami",
    subscribe: "Berlangganan",
    selfcare: "Selfcare",
    "check-area": "Cari Area",
    "local-homebase": "Local Homebase",
    "internet-rumah": "Internet Rumah",
    "internet-apartemen": "Internet Apartemen",
    "rt-login": "Mitra RT",
    "rt-admin": "Dashboard Mitra RT",
    "admin-login": "Admin Pusat",
    "admin-dashboard": "Admin Pusat",
  };
  return map[view];
}

function AreaModal({ onClose, onFull }: { onClose: () => void; onFull: () => void }) {
  const [q, setQ] = useState("");
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 px-4 pt-28" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-[#122033]">Cari Area</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">Cek apakah alamat Anda sudah terjangkau jaringan Putra.net.</p>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ketik kelurahan, kecamatan, atau kota..."
          className="mt-4 h-12 w-full rounded-full border border-slate-200 px-5 text-sm outline-none focus:border-oxy-teal"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500">
            Tutup
          </button>
          <button type="button" onClick={onFull} className="rounded-full bg-[#22c55e] px-5 py-2 text-sm font-bold text-white">
            Cek Area Lengkap
          </button>
        </div>
      </div>
    </div>
  );
}
