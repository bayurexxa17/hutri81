import Logo from "./Logo";
import type { View } from "../types";

type FooterProps = {
  onNavigate: (view: View) => void;
};

export default function Footer({ onNavigate }: FooterProps) {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-[#0b1d36] text-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1.6fr_1fr]">
        <div>
          <p className="font-display text-[15px] font-semibold text-white/70">Customer Care</p>
          <p className="mt-1 font-display text-[36px] font-extrabold leading-none tracking-tight">
            +62 896-7575-7553
          </p>
          <p className="mt-3 text-sm text-white/60">Layanan 24 jam, 7 hari seminggu</p>
          <a
            href="https://wa.me/6289675757553"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-900/30 transition hover:bg-[#16a34a]"
          >
            <WhatsAppIcon />
            Chat WhatsApp
          </a>
          <div className="mt-6 flex items-center gap-3">
            <Social href="https://www.instagram.com/oxygenid_official/" label="Instagram">
              <path d="M8 3h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8a5 5 0 015-5zm8 2H8a3 3 0 00-3 3v8a3 3 0 003 3h8a3 3 0 003-3V8a3 3 0 00-3-3zm-4 3.2A3.8 3.8 0 1112 16.8 3.8 3.8 0 0112 8.2zm0 1.6a2.2 2.2 0 100 4.4 2.2 2.2 0 000-4.4zM17.2 7.1a.9.9 0 11-1.8 0 .9.9 0 011.8 0z" />
            </Social>
            <Social href="https://www.facebook.com/Oxygen.id" label="Facebook">
              <path d="M14.5 8.5V6.8c0-.7.5-1 1.2-1H17V3h-2.2C12.3 3 11 4.5 11 6.7v1.8H9v2.7h2V21h3.2v-9.8h2.3l.5-2.7h-2.5z" />
            </Social>
            <Social href="https://x.com/oxygenidhome" label="X">
              <path d="M17.6 4H20l-5.7 6.5L21 20h-4.8l-3.8-5-4.3 5H4.2l6.1-7L3.2 4h4.9l3.4 4.6L17.6 4zm-1.2 14.4h1.3L7.7 5.5H6.3l10.1 12.9z" />
            </Social>
            <Social href="https://www.youtube.com/@oxygenid" label="YouTube">
              <path d="M21.6 7.2a2.7 2.7 0 00-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3a2.7 2.7 0 00-1.9 1.9A28 28 0 002 12a28 28 0 00.4 4.8 2.7 2.7 0 001.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 001.9-1.9A28 28 0 0022 12a28 28 0 00-.4-4.8zM10 15.2V8.8L15.5 12 10 15.2z" />
            </Social>
            <Social href="https://www.tiktok.com/@oxygenid_" label="TikTok">
              <path d="M15.4 4c.4 2.5 1.9 4.2 4.3 4.5v2.6c-1.5 0-2.9-.5-4.1-1.3v5.8a5.9 5.9 0 11-5.9-5.9c.3 0 .6 0 .9.1v2.8a3.2 3.2 0 00-.9-.1 3.1 3.1 0 103.1 3.1V4h2.6z" />
            </Social>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <FooterCol title="Paket & Harga">
            <FLink onClick={() => onNavigate("package-stream")}>Stream</FLink>
            <FLink onClick={() => onNavigate("package-stream-plus")}>Stream+</FLink>
            <FLink onClick={() => onNavigate("package-suka-suka")}>Suka Suka</FLink>
            <FLink onClick={() => onNavigate("package-apartment")}>Apartment & Mall</FLink>
            <FLink onClick={() => onNavigate("package-addon")}>Add On</FLink>
          </FooterCol>
          <FooterCol title="Pelanggan">
            <FLink onClick={() => onNavigate("check-area")}>Daftar / Cek Area</FLink>
            <FLink onClick={() => onNavigate("selfcare")}>Selfcare</FLink>
            <FLink onClick={() => onNavigate("selfcare")}>Bayar Online</FLink>
            <FLink onClick={() => onNavigate("contact")}>Hubungi Kami</FLink>
            <FLink onClick={() => onNavigate("local-homebase")}>Local Homebase</FLink>
            <FLink onClick={() => onNavigate("rt-login")}>Mitra RT Portal</FLink>
            <FLink onClick={() => onNavigate("admin-login")}>Admin Pusat</FLink>
          </FooterCol>
          <FooterCol title="Information">
            <FLink onClick={() => onNavigate("news")}>Promo</FLink>
            <FLink onClick={() => onNavigate("news")}>News</FLink>
            <FLink onClick={() => onNavigate("help")}>Info Cara Bayar</FLink>
            <FLink onClick={() => onNavigate("help")}>Tips & Tutorial</FLink>
            <FLink onClick={() => onNavigate("help")}>FAQ</FLink>
            <FLink onClick={() => onNavigate("help")}>Syarat Ketentuan</FLink>
          </FooterCol>
        </div>

        <div className="flex flex-col items-start lg:items-end">
          <Logo variant="light" />
          <p className="mt-5 max-w-[280px] text-sm leading-relaxed text-white/65 lg:text-right">
            Perumahan Ciptaland
            <br />
            Jl. Ciptaland No.58
            <br />
            Tiban, Kota Batam
            <br />
            Indonesia
          </p>
          <button
            type="button"
            onClick={scrollTop}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Ke Atas
          </button>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
          <p className="text-xs text-white/50">© 2026 Putra.net · PT Bangun Tirta Pratama. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>Powered by</span>
            <span className="font-display text-[13px] font-extrabold tracking-wide text-white">
              MoreRepublic
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-display text-[15px] font-bold">{title}</p>
      <div className="mt-4 flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left text-sm text-white/65 transition hover:text-white"
    >
      {children}
    </button>
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#22c55e]"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        {children}
      </svg>
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.33 4.94L2 22l5.39-1.41a10 10 0 004.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.77 13.9c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.12.1-1.81-.11-.41-.13-.94-.31-1.62-.6-2.85-1.23-4.7-4.1-4.84-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.08 1-2.36.24-.26.64-.38 1.02-.38.12 0 .23 0 .33.01.3.01.44.03.64.5.24.58.83 2.02.9 2.17.07.15.12.32.02.52-.09.19-.14.31-.28.48-.14.16-.29.37-.42.5-.14.14-.28.29-.12.56.16.26.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.18 1.34.27.13.43.11.59-.07.16-.18.69-.8.88-1.08.18-.27.37-.23.62-.14.26.09 1.63.77 1.91.91.28.14.46.21.53.33.07.12.07.68-.17 1.36z" />
    </svg>
  );
}
