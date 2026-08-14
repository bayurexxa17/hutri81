import { useState } from "react";
import {
  addArea,
  addReward,
  addRtAdmin,
  deleteArea,
  deleteMember,
  deleteReward,
  deleteRtAdmin,
  formatRupiah,
  registerMember,
  superLogin,
  updateArea,
  updateMember,
  updateReward,
  useActivityLogs,
  useAllAreas,
  useAllMembers,
  useAllRewards,
  useAllRtAdmins,
  useAllTreasury,
} from "../lib/useRealtime";
import {
  exportAreas,
  exportLogs,
  exportMembers,
  exportRewards,
  exportRtAdmins,
  exportSummary,
  exportTreasury,
} from "../lib/docx";
import type { View } from "../types";
import Logo from "./Logo";

type Props = {
  view: View;
  onNavigate: (v: View) => void;
};

type Tab = "ringkasan" | "perumahan" | "rt" | "anggota" | "kas" | "reward" | "log";

const SESSION_KEY = "putra_super_admin";

export default function SuperAdmin({ view, onNavigate }: Props) {
  const [adminId, setAdminId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null,
  );
  const [tab, setTab] = useState<Tab>("ringkasan");

  if (view === "admin-login" || !adminId) {
    return (
      <SuperLogin
        onLogin={(id) => {
          localStorage.setItem(SESSION_KEY, id);
          setAdminId(id);
          onNavigate("admin-dashboard");
        }}
        onBack={() => onNavigate("home")}
      />
    );
  }

  return (
    <SuperDashboard
      onLogout={() => {
        localStorage.removeItem(SESSION_KEY);
        setAdminId(null);
        onNavigate("admin-login");
      }}
      tab={tab}
      setTab={setTab}
    />
  );
}

function SuperLogin({
  onLogin,
  onBack,
}: {
  onLogin: (id: string) => void;
  onBack: () => void;
}) {
  const [u, setU] = useState("admin");
  const [p, setP] = useState("admin123");
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1d36] text-white">
      <div className="absolute inset-0 hero-mesh opacity-80" />
      <div className="absolute inset-0 bg-[#0b1d36]/70" />
      <div className="relative mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10">
        <div className="w-full rounded-3xl bg-white p-8 text-[#122033] shadow-2xl sm:p-10">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-semibold text-slate-500 hover:text-oxy-teal"
          >
            ← Kembali ke beranda
          </button>
          <div className="mt-4">
            <Logo size="lg" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold sm:text-4xl">Admin Pusat Putra.net</h1>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Kontrol penuh seluruh data perumahan, pengurus RT, anggota, reward, dan kas. Unduh laporan
            dalam format .docx kapan saja. Platform dikelola oleh PT Bangun Tirta Pratama.
          </p>
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const a = superLogin(u, p);
              if (!a) {
                setErr("Username atau password salah.");
                return;
              }
              onLogin(a.id);
            }}
          >
            <div>
              <label className="text-sm font-bold text-slate-700">Username</label>
              <input
                value={u}
                onChange={(e) => setU(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-oxy-teal"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">Password</label>
              <input
                type="password"
                value={p}
                onChange={(e) => setP(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-oxy-teal"
              />
            </div>
            {err && <p className="text-sm font-semibold text-red-500">{err}</p>}
            <button className="w-full rounded-full bg-[#22c55e] py-3 text-sm font-bold text-white hover:bg-[#16a34a]">
              Masuk
            </button>
            <div className="rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
              <p className="font-bold text-[#122033]">Akun demo:</p>
              <p>admin / admin123</p>
              <p className="mt-1 text-slate-500">
                Semua perubahan langsung tersinkron ke database dan seluruh dashboard Mitra RT.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SuperDashboard({
  onLogout,
  tab,
  setTab,
}: {
  onLogout: () => void;
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  const areas = useAllAreas();
  const members = useAllMembers();
  const rtAdmins = useAllRtAdmins();
  const treasury = useAllTreasury();
  const rewards = useAllRewards();
  const logs = useActivityLogs();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "ringkasan", label: "Ringkasan & Download", icon: "📊" },
    { id: "perumahan", label: "Perumahan / Area", icon: "🏘️" },
    { id: "rt", label: "Akun RT", icon: "👤" },
    { id: "anggota", label: "Anggota", icon: "👥" },
    { id: "kas", label: "Kas (Global)", icon: "💰" },
    { id: "reward", label: "Reward", icon: "🎁" },
    { id: "log", label: "Activity Log", icon: "📒" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-[#122033]">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="hidden h-6 w-px bg-slate-200 sm:block" />
          <span className="rounded-full bg-[#ffedd5] px-3 py-1 text-[11px] font-bold text-[#ea580c]">
            ADMIN PUSAT
          </span>
        </div>
        <button
          onClick={onLogout}
          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:border-red-400 hover:text-red-500"
        >
          Keluar
        </button>
      </div>

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-20 space-y-1 rounded-3xl bg-white p-3 shadow-sm">
            {tabs.map((m) => (
              <button
                key={m.id}
                onClick={() => setTab(m.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                  tab === m.id
                    ? "bg-[#0b1d36] text-white shadow"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg">{m.icon}</span>
                {m.label}
              </button>
            ))}
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#0d9b8a] p-4 text-white">
              <p className="text-[11px] font-bold uppercase tracking-wider">Realtime</p>
              <p className="mt-1 text-xs leading-5">
                Terhubung dengan database. Semua perubahan langsung diterima dashboard Mitra RT.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden no-scrollbar">
            {tabs.map((m) => (
              <button
                key={m.id}
                onClick={() => setTab(m.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                  tab === m.id ? "bg-[#0b1d36] text-white" : "bg-white text-slate-600"
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {tab === "ringkasan" && <SummaryTab areas={areas} members={members} rtAdmins={rtAdmins} treasury={treasury} rewards={rewards} logs={logs} />}
          {tab === "perumahan" && <PerumahanTab areas={areas} members={members} />}
          {tab === "rt" && <RtTab rtAdmins={rtAdmins} areas={areas} />}
          {tab === "anggota" && <AnggotaTab members={members} areas={areas} />}
          {tab === "kas" && <KasTab treasury={treasury} areas={areas} />}
          {tab === "reward" && <RewardsTab rewards={rewards} />}
          {tab === "log" && <LogTab logs={logs} />}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Summary ---------------- */
function SummaryTab({
  areas,
  members,
  rtAdmins,
  treasury,
  rewards,
  logs,
}: {
  areas: ReturnType<typeof useAllAreas>;
  members: ReturnType<typeof useAllMembers>;
  rtAdmins: ReturnType<typeof useAllRtAdmins>;
  treasury: ReturnType<typeof useAllTreasury>;
  rewards: ReturnType<typeof useAllRewards>;
  logs: ReturnType<typeof useActivityLogs>;
}) {
  const totalIn = treasury.filter((t) => t.type !== "pencairan").reduce((s, t) => s + t.amount, 0);
  const totalOut = treasury.filter((t) => t.type === "pencairan").reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <>
      <div className="rounded-3xl bg-gradient-to-br from-[#0b1d36] via-[#123056] to-[#0d9b8a] p-6 text-white sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#facc15]">Control Center</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Selamat datang, Admin</h2>
        <p className="mt-1 max-w-xl text-sm text-white/75">
          Kelola seluruh data program Mitra RT Putra.net, pantau pendaftaran realtime, dan unduh laporan
          lengkap kapan saja.
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Perumahan Mitra" value={areas.length.toString()} color="bg-[#22c55e]" icon="🏘️" />
        <Kpi label="Pengurus RT" value={rtAdmins.length.toString()} color="bg-[#f97316]" icon="👤" />
        <Kpi label="Total Anggota" value={members.length.toString()} color="bg-[#8b5cf6]" icon="👥" />
        <Kpi label="Total Kas Jalan" value={formatRupiah(totalIn - totalOut)} color="bg-[#0d9b8a]" icon="💰" />
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-extrabold">Download Semua Laporan (.docx)</h3>
          <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700">
            ● Live · {logs.length} aktivitas
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Klik tombol di bawah untuk mengunduh data dalam format Microsoft Word yang langsung diambil dari
          database saat ini.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DownloadBtn
            icon="📄"
            title="Ringkasan Eksekutif"
            sub="Seluruh metrik utama dalam satu dokumen"
            onClick={() => exportSummary(areas, members, treasury, rewards, rtAdmins)}
          />
          <DownloadBtn
            icon="👥"
            title="Data Anggota"
            sub={`${members.length} warga terdaftar`}
            onClick={() => exportMembers(members, areas)}
          />
          <DownloadBtn
            icon="🏘️"
            title="Data Perumahan"
            sub={`${areas.length} area mitra`}
            onClick={() => exportAreas(areas, members)}
          />
          <DownloadBtn
            icon="👤"
            title="Akun Pengurus RT"
            sub={`${rtAdmins.length} akun RT`}
            onClick={() => exportRtAdmins(rtAdmins, areas)}
          />
          <DownloadBtn
            icon="💰"
            title="Kas RT Global"
            sub="Semua mutasi kas seluruh area"
            onClick={() => exportTreasury(treasury, areas)}
          />
          <DownloadBtn
            icon="🎁"
            title="Katalog Reward"
            sub={`${rewards.length} item reward`}
            onClick={() => exportRewards(rewards)}
          />
          <DownloadBtn
            icon="📒"
            title="Activity Log"
            sub={`${logs.length} riwayat aktivitas sistem`}
            onClick={() => exportLogs(logs)}
          />
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-[#122033]">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg text-white ${color}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

function DownloadBtn({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: string;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-oxy-teal hover:bg-teal-50/40"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#0d9b8a] text-xl text-white">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] font-extrabold text-[#122033]">{title}</span>
        <span className="block text-xs text-slate-500">{sub}</span>
      </span>
      <span className="hidden text-[#0d9b8a] sm:inline group-hover:translate-x-1 transition">⬇</span>
    </button>
  );
}

/* ---------------- Perumahan ---------------- */
function PerumahanTab({
  areas,
  members,
}: {
  areas: ReturnType<typeof useAllAreas>;
  members: ReturnType<typeof useAllMembers>;
}) {
  const [form, setForm] = useState({
    name: "",
    city: "",
    rt_admin_name: "",
    rt_admin_phone: "",
    target: 100,
    revenue_share: 75000,
    points_per_signup: 50,
    lat: -6.2,
    lng: 106.85,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold">Data Perumahan Mitra</h2>
        <button
          onClick={() => exportAreas(areas, members)}
          className="rounded-full bg-[#0b1d36] px-4 py-2 text-xs font-bold text-white hover:bg-[#123056]"
        >
          ⬇ Download .docx
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 pr-4">Perumahan</th>
                <th className="py-3 pr-4">Kota</th>
                <th className="py-3 pr-4">Warga</th>
                <th className="py-3 pr-4">Komisi</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {areas.map((a) => {
                const count = members.filter((m) => m.area_id === a.id).length;
                return (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-semibold">{a.name}</td>
                    <td className="py-3 pr-4 text-slate-600">{a.city}</td>
                    <td className="py-3 pr-4">{count} / {a.target}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatRupiah(a.revenue_share)}</td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => {
                          if (!confirm(`Hapus area ${a.name}?`)) return;
                          deleteArea(a.id);
                        }}
                        className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-500 hover:bg-red-100"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addArea(form);
            setForm({ ...form, name: "", city: "", rt_admin_name: "", rt_admin_phone: "" });
          }}
          className="space-y-3 rounded-3xl bg-white p-6 shadow-sm"
        >
          <h3 className="font-display text-lg font-extrabold">Tambah / Update Area</h3>
          <LInput label="Nama Perumahan" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <LInput label="Kota" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <LInput label="Nama PIC RT" value={form.rt_admin_name} onChange={(v) => setForm({ ...form, rt_admin_name: v })} />
          </div>
          <LInput label="No HP PIC" value={form.rt_admin_phone} onChange={(v) => setForm({ ...form, rt_admin_phone: v })} />
          <div className="grid gap-3 sm:grid-cols-3">
            <LInput label="Target" type="number" value={String(form.target)} onChange={(v) => setForm({ ...form, target: +v })} />
            <LInput label="Komisi/warga (Rp)" type="number" value={String(form.revenue_share)} onChange={(v) => setForm({ ...form, revenue_share: +v })} />
            <LInput label="Poin/warga" type="number" value={String(form.points_per_signup)} onChange={(v) => setForm({ ...form, points_per_signup: +v })} />
          </div>
          <button className="w-full rounded-full bg-[#22c55e] py-2.5 text-sm font-bold text-white">Tambah Perumahan</button>
          <p className="text-xs text-slate-500">
            Untuk update/edit: klik tombol aksi di tabel (data disimpan realtime).
          </p>
        </form>
      </div>
    </div>
  );
}

/* ---------------- RT admins ---------------- */
function RtTab({
  rtAdmins,
  areas,
}: {
  rtAdmins: ReturnType<typeof useAllRtAdmins>;
  areas: ReturnType<typeof useAllAreas>;
}) {
  const [form, setForm] = useState({ username: "", password: "", name: "", area_id: areas[0]?.id ?? "" });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold">Akun Pengurus RT</h2>
        <button onClick={() => exportRtAdmins(rtAdmins, areas)} className="rounded-full bg-[#0b1d36] px-4 py-2 text-xs font-bold text-white">
          ⬇ Download .docx
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 pr-4">Nama</th>
                <th className="py-3 pr-4">Username</th>
                <th className="py-3 pr-4">Perumahan</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {rtAdmins.map((a) => {
                const area = areas.find((x) => x.id === a.area_id);
                return (
                  <tr key={a.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-semibold">{a.name}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{a.username}</td>
                    <td className="py-3 pr-4 text-slate-600">{area?.name ?? "-"}</td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus akun ${a.name}?`)) deleteRtAdmin(a.id);
                        }}
                        className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-500"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addRtAdmin(form);
            setForm({ ...form, username: "", password: "", name: "" });
          }}
          className="space-y-3 rounded-3xl bg-white p-6 shadow-sm"
        >
          <h3 className="font-display text-lg font-extrabold">Tambah Akun RT</h3>
          <LInput label="Nama Lengkap" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <LInput label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
          <LInput label="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <div>
            <label className="text-xs font-bold text-slate-600">Perumahan</label>
            <select
              value={form.area_id}
              onChange={(e) => setForm({ ...form, area_id: e.target.value })}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <button className="w-full rounded-full bg-[#22c55e] py-2.5 text-sm font-bold text-white">
            Tambah Akun
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Anggota ---------------- */
function AnggotaTab({
  members,
  areas,
}: {
  members: ReturnType<typeof useAllMembers>;
  areas: ReturnType<typeof useAllAreas>;
}) {
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    area_id: areas[0]?.id ?? "",
    package_name: "Suka Suka Harian",
  });
  const filtered = members.filter(
    (m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.phone.includes(q),
  );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold">Semua Anggota Warga</h2>
        <button onClick={() => exportMembers(members, areas)} className="rounded-full bg-[#0b1d36] px-4 py-2 text-xs font-bold text-white">
          ⬇ Download .docx
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name || !form.phone || !form.area_id) return;
          const area = areas.find((a) => a.id === form.area_id);
          registerMember({
            name: form.name,
            phone: form.phone,
            email: form.email || "anon@mail.com",
            city: area?.city ?? "",
            area_id: form.area_id,
            package_name: form.package_name,
            actor: "admin",
          });
          setForm({ ...form, name: "", phone: "", email: "" });
        }}
        className="grid gap-3 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
      >
        <LInput label="Nama" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <LInput label="No HP" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <LInput label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <div>
          <label className="text-xs font-bold text-slate-600">Area</label>
          <select
            value={form.area_id}
            onChange={(e) => setForm({ ...form, area_id: e.target.value })}
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
          >
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600">Paket</label>
          <select
            value={form.package_name}
            onChange={(e) => setForm({ ...form, package_name: e.target.value })}
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
          >
            {["Suka Suka Harian", "Stream 30", "Stream 50", "Stream 100", "Stream+ 100", "Suite 50"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <button className="rounded-full bg-[#22c55e] py-2.5 text-sm font-bold text-white sm:col-span-2 lg:col-span-5">
          + Tambah Anggota (langsung ke DB)
        </button>
      </form>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama / no HP..."
          className="mb-4 h-10 w-full rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-oxy-teal"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 pr-4">Nama</th>
                <th className="py-3 pr-4">Kontak</th>
                <th className="py-3 pr-4">Area</th>
                <th className="py-3 pr-4">Paket</th>
                <th className="py-3 pr-4">Poin</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const area = areas.find((a) => a.id === m.area_id);
                return (
                  <tr key={m.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-semibold">{m.name}</td>
                    <td className="py-3 pr-4 text-slate-600">
                      {m.phone}
                      <br />
                      <span className="text-xs text-slate-400">{m.email}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{area?.name ?? "-"}</td>
                    <td className="py-3 pr-4 text-slate-600">{m.package_name}</td>
                    <td>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                        ⭐ {m.points}
                      </span>
                    </td>
                    <td>
                      <select
                        value={m.status}
                        onChange={(e) => updateMember(m.id, { status: e.target.value as any })}
                        className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                      >
                        <option value="aktif">aktif</option>
                        <option value="baru">baru</option>
                        <option value="nonaktif">nonaktif</option>
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus ${m.name}?`)) deleteMember(m.id);
                        }}
                        className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-500"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Kas ---------------- */
function KasTab({
  treasury,
  areas,
}: {
  treasury: ReturnType<typeof useAllTreasury>;
  areas: ReturnType<typeof useAllAreas>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold">Kas RT Global</h2>
        <button onClick={() => exportTreasury(treasury, areas)} className="rounded-full bg-[#0b1d36] px-4 py-2 text-xs font-bold text-white">
          ⬇ Download .docx
        </button>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 pr-4">Tanggal</th>
                <th className="py-3 pr-4">Area</th>
                <th className="py-3 pr-4">Jenis</th>
                <th className="py-3 pr-4">Keterangan</th>
                <th className="py-3 pr-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {treasury.map((t) => {
                const area = areas.find((a) => a.id === t.area_id);
                return (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 text-xs text-slate-500">
                      {new Date(t.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{area?.name ?? "-"}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          t.type === "pencairan"
                            ? "bg-red-50 text-red-600"
                            : t.type === "bonus"
                              ? "bg-violet-50 text-violet-600"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{t.note}</td>
                    <td className={`py-3 pr-4 text-right font-bold ${t.amount < 0 ? "text-red-500" : "text-green-600"}`}>
                      {t.amount < 0 ? "-" : "+"}
                      {formatRupiah(Math.abs(t.amount))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Reward ---------------- */
function RewardsTab({ rewards }: { rewards: ReturnType<typeof useAllRewards> }) {
  const [form, setForm] = useState({ name: "", points_cost: 250, stock: 10, icon: "voucher" });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold">Katalog Reward</h2>
        <button onClick={() => exportRewards(rewards)} className="rounded-full bg-[#0b1d36] px-4 py-2 text-xs font-bold text-white">
          ⬇ Download .docx
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addReward(form);
          setForm({ ...form, name: "" });
        }}
        className="grid gap-3 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
      >
        <LInput label="Nama Reward" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <LInput label="Poin" type="number" value={String(form.points_cost)} onChange={(v) => setForm({ ...form, points_cost: +v })} />
        <LInput label="Stok" type="number" value={String(form.stock)} onChange={(v) => setForm({ ...form, stock: +v })} />
        <div>
          <label className="text-xs font-bold text-slate-600">Ikon</label>
          <select
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option value="voucher">🎫 Voucher</option>
            <option value="wifi">📶 Internet</option>
            <option value="merch">👕 Merch</option>
            <option value="ride">🛵 Transport</option>
          </select>
        </div>
        <button className="rounded-full bg-[#22c55e] py-2.5 text-sm font-bold text-white">+ Tambah</button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((r) => (
          <div key={r.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Stok: {r.stock}</p>
            <h3 className="mt-1 font-display text-lg font-extrabold">{r.name}</h3>
            <p className="mt-1 font-display text-xl font-bold text-[#f97316]">{r.points_cost} poin</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => updateReward(r.id, { stock: r.stock + 10 })}
                className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
              >
                +10 Stok
              </button>
              <button
                onClick={() => {
                  if (confirm(`Hapus reward ${r.name}?`)) deleteReward(r.id);
                }}
                className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Log ---------------- */
function LogTab({ logs }: { logs: ReturnType<typeof useActivityLogs> }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold">Activity Log (Realtime)</h2>
        <button onClick={() => exportLogs(logs)} className="rounded-full bg-[#0b1d36] px-4 py-2 text-xs font-bold text-white">
          ⬇ Download .docx
        </button>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <ul className="divide-y divide-slate-100">
          {logs.map((l) => (
            <li key={l.id} className="flex flex-wrap items-start gap-3 py-3 text-sm">
              <span className="shrink-0 rounded-full bg-[#0b1d36] px-2 py-1 font-mono text-[10px] font-bold uppercase text-white">
                {l.action}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-semibold">{l.detail}</span>
                <span className="block text-xs text-slate-400">
                  oleh <b>{l.actor}</b> · {l.entity}
                </span>
              </span>
              <span className="text-xs text-slate-400">{new Date(l.ts).toLocaleString("id-ID")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-oxy-teal"
      />
    </label>
  );
}

// suppress unused
void updateArea;
