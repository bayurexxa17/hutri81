import { useState } from "react";

export default function HelpWidget() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="animate-slide-up w-[320px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-400/30">
          <div className="flex items-center justify-between bg-[#0b1d36] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">Customer Care Putra.net</p>
              <p className="text-[11px] text-white/60">Online · biasanya balas cepat</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              ✕
            </button>
          </div>
          <div className="space-y-3 bg-slate-50 px-4 py-4">
            <div className="rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[13px] leading-relaxed text-slate-700 shadow-sm">
              Halo! Ada yang bisa kami bantu? Tanyakan paket, cek area, atau kendala layanan.
            </div>
            {sent && (
              <div className="ml-8 rounded-2xl rounded-tr-sm bg-[#22c55e] px-3 py-2 text-[13px] text-white">
                Terima kasih! Tim kami akan segera menghubungi Anda.
              </div>
            )}
          </div>
          <form
            className="flex gap-2 border-t border-slate-100 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!message.trim()) return;
              setSent(true);
              setMessage("");
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan..."
              className="h-10 flex-1 rounded-full border border-slate-200 px-3 text-sm outline-none focus:border-oxy-teal"
            />
            <button
              type="submit"
              className="h-10 rounded-full bg-[#22c55e] px-4 text-sm font-bold text-white"
            >
              Kirim
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-[#facc15] px-4 py-3 font-display text-[13px] font-extrabold text-[#122033] shadow-xl shadow-yellow-400/40 transition hover:bg-[#fde047]"
      >
        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#122033] text-yellow-300">
          <span className="absolute inset-0 animate-[pulse-ring_1.8s_ease-out_infinite] rounded-full bg-[#122033]" />
          <svg className="relative h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3a8 8 0 00-8 8c0 1.7.5 3.3 1.5 4.6L4 21l5.6-1.5A8 8 0 1012 3zm-1 5h2v6h-2V8zm0 7h2v2h-2v-2z" />
          </svg>
        </span>
        Butuh Bantuan? Klik Di Sini
      </button>
    </div>
  );
}
