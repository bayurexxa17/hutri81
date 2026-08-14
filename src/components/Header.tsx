import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import type { View } from "../types";

type HeaderProps = {
  view: View;
  onNavigate: (view: View) => void;
  onOpenSearch: () => void;
};

const packageItems: { label: string; view: View }[] = [
  { label: "Stream", view: "package-stream" },
  { label: "Stream+", view: "package-stream-plus" },
  { label: "Suka Suka", view: "package-suka-suka" },
  { label: "Apartment & Mall", view: "package-apartment" },
  { label: "Add On", view: "package-addon" },
];

const helpItems: { label: string; view: View }[] = [
  { label: "FAQ", view: "help" },
  { label: "Tips & Tutorial", view: "help" },
  { label: "Cara Bayar", view: "help" },
  { label: "Syarat & Ketentuan", view: "help" },
];

export default function Header({ view, onNavigate, onOpenSearch }: HeaderProps) {
  const [openMenu, setOpenMenu] = useState<"paket" | "bantuan" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [view]);

  const navBtn = (active: boolean) =>
    `text-[14px] font-semibold transition-colors ${
      active ? "text-oxy-teal" : "text-slate-700 hover:text-oxy-teal"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-[0_4px_24px_rgba(11,29,54,0.06)] backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="shrink-0"
          aria-label="Beranda Putra.net"
        >
          <Logo />
        </button>

        <nav ref={navRef} className="hidden items-center gap-7 lg:flex">
          <div className="relative">
            <button
              type="button"
              className={`${navBtn(view.startsWith("package") || view === "packages")} inline-flex items-center gap-1`}
              onClick={() => setOpenMenu(openMenu === "paket" ? null : "paket")}
            >
              Paket & Harga
              <Caret open={openMenu === "paket"} />
            </button>
            {openMenu === "paket" && (
              <Dropdown>
                {packageItems.map((item) => (
                  <DropdownItem
                    key={item.label}
                    onClick={() => {
                      onNavigate(item.view);
                      setOpenMenu(null);
                    }}
                  >
                    {item.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
          </div>

          <button type="button" className={navBtn(view === "news")} onClick={() => onNavigate("news")}>
            News
          </button>

          <div className="relative">
            <button
              type="button"
              className={`${navBtn(view === "help")} inline-flex items-center gap-1`}
              onClick={() => setOpenMenu(openMenu === "bantuan" ? null : "bantuan")}
            >
              Bantuan
              <Caret open={openMenu === "bantuan"} />
            </button>
            {openMenu === "bantuan" && (
              <Dropdown>
                {helpItems.map((item) => (
                  <DropdownItem
                    key={item.label}
                    onClick={() => {
                      onNavigate(item.view);
                      setOpenMenu(null);
                    }}
                  >
                    {item.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
          </div>

          <button
            type="button"
            className={navBtn(view === "contact")}
            onClick={() => onNavigate("contact")}
          >
            Hubungi Kami
          </button>
          <button
            type="button"
            className={navBtn(view === "rt-admin" || view === "rt-login")}
            onClick={() => onNavigate("rt-login")}
          >
            Mitra RT
          </button>
          <button
            type="button"
            className={navBtn(view === "admin-login" || view === "admin-dashboard")}
            onClick={() => onNavigate("admin-login")}
          >
            Admin Pusat
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onNavigate("subscribe")}
            className="hidden rounded-full bg-[#22c55e] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm shadow-green-200 transition hover:bg-[#16a34a] sm:inline-flex"
          >
            Berlangganan
          </button>
          <button
            type="button"
            onClick={() => onNavigate("selfcare")}
            className="hidden rounded-full bg-[#f97316] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm shadow-orange-200 transition hover:bg-[#ea580c] sm:inline-flex"
          >
            Selfcare
          </button>
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 transition hover:border-oxy-teal hover:text-oxy-teal"
            aria-label="Cari Area"
          >
            <SearchIcon />
            <span className="hidden md:inline">Cari Area</span>
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            <p className="px-3 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Paket & Harga
            </p>
            {packageItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => onNavigate(item.view)}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => onNavigate("news")}
            >
              News
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => onNavigate("help")}
            >
              Bantuan
            </button>
            <button
              type="button"
              className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => onNavigate("contact")}
            >
              Hubungi Kami
            </button>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onNavigate("subscribe")}
                className="rounded-full bg-[#22c55e] py-2.5 text-sm font-bold text-white"
              >
                Berlangganan
              </button>
              <button
                type="button"
                onClick={() => onNavigate("selfcare")}
                className="rounded-full bg-[#f97316] py-2.5 text-sm font-bold text-white"
              >
                Selfcare
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Dropdown({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-0 top-[calc(100%+14px)] z-50 min-w-[220px] rounded-2xl border border-slate-100 bg-white py-2 shadow-xl shadow-slate-200/70">
      {children}
    </div>
  );
}

function DropdownItem({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-oxy-teal"
    >
      {children}
    </button>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  ) : (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
