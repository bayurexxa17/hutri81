import { useMemo, useState } from "react";
import {
  addTreasury,
  approveMember,
  formatRupiah,
  redeemReward,
  rtLogin,
  useAllAreas,
  useAllMembers,
  useArea,
  useAreaMembers,
  useAreaTreasury,
  useRewards,
  useAllRtAdmins,
} from "../lib/useRealtime";
import { registerMember, resetDemo } from "../lib/realtime";
import type { View } from "../types";
import type { Member as MemberT } from "../lib/realtime";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Logo from "./Logo";

type Props = {
  view: View;
  onNavigate: (v: View) => void;
};

// session key
const SESSION_KEY = "putra_rt_session_id";
const ACTIVE_TAB_KEY = "putra_rt_tab";
type Tab = "dashboard" | "anggota" | "reward" | "kas" | "peta";

export default function RtAdmin({ view, onNavigate }: Props) {
  const [adminId, setAdminId] = useState<string | null>(
    () => (typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null),
  );
  const [tab, setTab] = useState<Tab>(
    () => (localStorage.getItem(ACTIVE_TAB_KEY) as Tab) || "dashboard",
  );

  if (view === "rt-login" || !adminId) {
    return (
      <RtLogin
        onLogin={(id) => {
          localStorage.setItem(SESSION_KEY, id);
          setAdminId(id);
          onNavigate("rt-admin");
        }}
        onBack={() => onNavigate("home")}
      />
    );
  }

  return (
    <RtDashboard
      adminId={adminId}
      tab={tab}
      setTab={(t) => {
        setTab(t);
        localStorage.setItem(ACTIVE_TAB_KEY, t);
      }}
      onLogout={() => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(ACTIVE_TAB_KEY);
        setAdminId(null);
        onNavigate("rt-login");
      }}
    />
  );
}

/* -------------------- LOGIN -------------------- */
function RtLogin({
  onLogin,
  onBack,
}: {
  onLogin: (adminId: string) => void;
  onBack: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = rtLogin(username.trim(), password);
    if (!admin) {
      setErr("Username atau password salah. Coba akun demo di bawah.");
      return;
    }
    onLogin(admin.id);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1d36]">
      <div className="absolute inset-0 hero-mesh opacity-80" />
      <div className="absolute inset-0 bg-[#0b1d36]/60" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10">
        <div className="grid w-full gap-6 rounded-3xl bg-white p-8 shadow-2xl sm:p-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-semibold text-slate-500 hover:text-oxy-teal"
            >
              ← Kembali ke situs Putra.net
            </button>
            <div className="mt-4">
              <Logo size="lg" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-extrabold text-[#122033] sm:text-4xl">
              Portal Mitra RT
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
              Kelola warga terdaftar, pantau poin reward, dan lihat kas RT perumahan Anda — semua
              tersinkron secara real-time.
            </p>

            <form className="mt-8 space-y-4" onSubmit={submit}>
              <div>
                <label className="text-sm font-bold text-slate-700">Username RT</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="rtciptaland"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-oxy-teal"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="rt123"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-oxy-teal"
                />
              </div>
              {err && <p className="text-sm font-semibold text-red-500">{err}</p>}
              <button
                type="submit"
                className="w-full rounded-full bg-[#22c55e] py-3 text-sm font-bold text-white shadow-lg shadow-green-200 hover:bg-[#16a34a]"
              >
                Masuk
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
              <p className="font-bold text-[#122033]">Akun demo:</p>
              <p>rtciptaland / rt123 — Perumahan Ciptaland, Batam (Kantor Pusat)</p>
              <p>rtbumi / rt123 — Perumahan Bumi Asri, Depok</p>
              <p>rttebet / rt123 — Tebet Residence, Jaksel</p>
              <p>rtbsd / rt123 — BSD Nusa Loka, Tangsel</p>
              <p className="mt-2 text-slate-500">
                Tambahkan pendaftaran baru dari halaman Berlangganan — dashboard ini update otomatis.
              </p>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-[#0d9b8a] to-[#0b1d36] p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#facc15]">Realtime Sync</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight">
              Terhubung ke database Supabase
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/80">
              Semua pendaftaran warga, penambahan poin, komisi kas RT, dan penukaran reward tersinkron
              langsung ke tabel Postgres melalui Supabase Realtime.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/85">
              <li>✓ Peta persebaran perumahan mitra</li>
              <li>✓ Grafik anggota baru harian & bulanan</li>
              <li>✓ Kas RT otomatis per pendaftaran</li>
              <li>✓ Validasi & approve member baru</li>
            </ul>
            <button
              type="button"
              onClick={() => {
                resetDemo();
                setErr(null);
              }}
              className="mt-auto rounded-full border border-white/25 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
            >
              Reset data demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- DASHBOARD -------------------- */
function RtDashboard({
  adminId,
  tab,
  setTab,
  onLogout,
}: {
  adminId: string;
  tab: Tab;
  setTab: (t: Tab) => void;
  onLogout: () => void;
}) {
  // Read current admin's area to scope data
  const allAreas = useAllAreas();
  const allMembers = useAllMembers();
  const allRewards = useRewards();

  // Find admin by ID (re-read from store via hook for reactivity)
  const allAdmins = useAllRtAdmins();
  const admin = allAdmins.find((a) => a.id === adminId);
  const area = useArea(admin?.area_id ?? null);
  const members = useAreaMembers(area?.id ?? null);
  const treasury = useAreaTreasury(area?.id ?? null);

  if (!admin || !area) {
    return (
      <div className="flex min-h-screen items-center justify-center p-10 text-slate-600">
        Session tidak valid.
        <button onClick={onLogout} className="ml-3 rounded-full bg-oxy-teal px-4 py-2 text-white">
          Login ulang
        </button>
      </div>
    );
  }

  const stats = computeAreaStats(area.id, members, treasury);
  const menu: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "anggota", label: "Anggota & Poin", icon: "👥" },
    { id: "reward", label: "Reward Warga", icon: "🎁" },
    { id: "kas", label: "Kas RT", icon: "💰" },
    { id: "peta", label: "Peta & Grafik", icon: "🗺️" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-[#122033]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="hidden h-6 w-px bg-slate-200 sm:block" />
          <span className="hidden font-display text-sm font-bold text-slate-700 sm:inline">
            Portal Mitra RT
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-right sm:block">
            <p className="text-xs text-slate-500">Login sebagai</p>
            <p className="text-sm font-bold">{admin.name} · {area.name}</p>
          </span>
          <button
            onClick={onLogout}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:border-oxy-teal hover:text-oxy-teal"
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-20 space-y-1 rounded-3xl bg-white p-3 shadow-sm">
            {menu.map((m) => (
              <button
                key={m.id}
                onClick={() => setTab(m.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  tab === m.id
                    ? "bg-[#22c55e] text-white shadow-md shadow-green-200"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-lg">{m.icon}</span>
                {m.label}
              </button>
            ))}
            <div className="mt-4 rounded-2xl bg-[#0b1d36] p-4 text-white">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#facc15]">Live</p>
              <p className="mt-1 text-xs leading-5 text-white/80">
                Data tersinkron realtime. Setiap warga yang daftar akan langsung muncul di dashboard ini.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden no-scrollbar">
            {menu.map((m) => (
              <button
                key={m.id}
                onClick={() => setTab(m.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                  tab === m.id ? "bg-[#22c55e] text-white" : "bg-white text-slate-600"
                }`}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {tab === "dashboard" && <DashboardTab area={area} stats={stats} members={members} treasury={treasury} allMembers={allMembers} />}
          {tab === "anggota" && <AnggotaTab members={members} />}
          {tab === "reward" && <RewardTab area={area} members={members} rewards={allRewards} />}
          {tab === "kas" && <KasTab area={area} treasury={treasury} />}
          {tab === "peta" && <PetaTab areas={allAreas} members={allMembers} currentAreaId={area.id} />}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Dashboard tab ---------------- */
function DashboardTab({
  area,
  stats,
  members,
  treasury,
  allMembers,
}: {
  area: ReturnType<typeof useArea> extends infer T ? NonNullable<T> : never;
  stats: ReturnType<typeof computeAreaStats>;
  members: MemberT[];
  treasury: ReturnType<typeof useAreaTreasury>;
  allMembers: MemberT[];
}) {
  const daily = useMemo(() => last7days(allMembers, area.id), [allMembers, area.id]);
  return (
    <>
      <div className="rounded-3xl bg-gradient-to-br from-[#0b1d36] via-[#123056] to-[#0d9b8a] p-6 text-white shadow-lg sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#facc15]">Area Anda</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{area.name}</h2>
        <p className="mt-1 text-sm text-white/70">{area.city} · PIC {area.rt_admin_name} · {area.rt_admin_phone}</p>
        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#facc15] transition-all duration-700"
            style={{ width: `${Math.min(100, (members.length / area.target) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/75">
          Progress: <b>{members.length}</b> / {area.target} warga terdaftar
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total Anggota" value={members.length.toString()} color="bg-[#22c55e]" icon="👥" />
        <Kpi label="Anggota Baru 7 Hari" value={stats.last7days.toString()} color="bg-[#f97316]" icon="🆕" />
        <Kpi label="Total Poin Warga" value={stats.totalPoints.toLocaleString("id-ID")} color="bg-[#8b5cf6]" icon="⭐" />
        <Kpi label="Saldo Kas RT" value={formatRupiah(stats.kasTotal)} color="bg-[#0d9b8a]" icon="💰" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-extrabold">Pendaftaran 7 Hari Terakhir</h3>
            <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-600">
              ● LIVE
            </span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#22c55e" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-display text-lg font-extrabold">Aktivitas Terbaru</h3>
          <ul className="space-y-3 text-sm">
            {treasury.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#22c55e]">
                  {t.type === "komisi" ? "💰" : t.type === "bonus" ? "🎁" : "💸"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {t.type === "komisi" ? "Komisi masuk" : t.type === "bonus" ? "Bonus" : "Pencairan"}
                    {t.member_name ? ` · ${t.member_name}` : ""}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString("id-ID")}</p>
                </div>
                <span className={`text-xs font-bold ${t.amount < 0 ? "text-red-500" : "text-[#16a34a]"}`}>
                  {t.amount < 0 ? "-" : "+"}
                  {formatRupiah(Math.abs(t.amount))}
                </span>
              </li>
            ))}
            {treasury.length === 0 && (
              <li className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                Belum ada aktivitas.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold">Perbandingan Paket di Area Anda</h3>
          <button
            type="button"
            onClick={() => {
              // Simulasi pendaftaran manual untuk demo realtime
              const packages = ["Suka Suka Harian", "Stream 50", "Stream 100", "Stream+ 100", "Suite 50"];
              const names = ["Andi Pratama", "Siti Nurhaliza", "Rizky Amelia", "Bagas Nugraha", "Wulan Sari", "Dimas Arya"];
              const nm = names[Math.floor(Math.random() * names.length)];
              const pk = packages[Math.floor(Math.random() * packages.length)];
              registerMember({
                name: nm + " " + Math.floor(Math.random() * 99),
                phone: "081" + Math.floor(10000000 + Math.random() * 89999999),
                email: nm.split(" ")[0].toLowerCase() + "@mail.com",
                city: area.city,
                area_id: area.id,
                package_name: pk,
              });
            }}
            className="rounded-full bg-[#0d9b8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0a7a6d]"
          >
            + Simulasi Warga Daftar
          </button>
        </div>
        <div className="h-[240px]">
          <ResponsiveContainer>
            <BarChart data={packageBreakdown(members)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="jumlah" fill="#f97316" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

/* ---------------- Anggota tab ---------------- */
function AnggotaTab({ members }: { members: MemberT[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"baru" | "poin" | "nama">("baru");
  const filtered = useMemo(() => {
    let list = members.filter(
      (m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.phone.includes(q),
    );
    if (sort === "baru") list = [...list].sort((a, b) => +new Date(b.registered_at) - +new Date(a.registered_at));
    if (sort === "poin") list = [...list].sort((a, b) => b.points - a.points);
    if (sort === "nama") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [members, q, sort]);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-extrabold">Daftar Anggota Warga</h2>
          <p className="text-sm text-slate-500">Update otomatis setiap ada pendaftaran baru.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama / no HP..."
            className="h-10 w-full rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-oxy-teal sm:w-72"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="h-10 rounded-full border border-slate-200 px-3 text-sm font-semibold"
          >
            <option value="baru">Terbaru</option>
            <option value="poin">Poin Tertinggi</option>
            <option value="nama">Nama A–Z</option>
          </select>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-3 pr-4">Nama</th>
              <th className="py-3 pr-4">No. HP</th>
              <th className="py-3 pr-4">Paket</th>
              <th className="py-3 pr-4">Poin</th>
              <th className="py-3 pr-4">Daftar</th>
              <th className="py-3 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-4 font-semibold">{m.name}</td>
                <td className="py-3 pr-4 text-slate-600">{m.phone}</td>
                <td className="py-3 pr-4 text-slate-600">{m.package_name}</td>
                <td className="py-3 pr-4">
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                    ⭐ {m.points}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs text-slate-500">
                  {new Date(m.registered_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="py-3 pr-4">
                  {m.status === "aktif" ? (
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">Aktif</span>
                  ) : m.status === "baru" ? (
                    <button
                      onClick={() => approveMember(m.id)}
                      className="rounded-full bg-[#f97316] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#ea580c]"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">Nonaktif</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                  Belum ada anggota yang sesuai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Reward tab ---------------- */
function RewardTab({
  area,
  members,
  rewards,
}: {
  area: ReturnType<typeof useArea>;
  members: MemberT[];
  rewards: ReturnType<typeof useRewards>;
}) {
  const [selectedMember, setSelectedMember] = useState<string>(members[0]?.id ?? "");
  const member = members.find((m) => m.id === selectedMember);
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-extrabold">Katalog Reward Warga</h2>
        <p className="text-sm text-slate-500">
          Poin reward akan otomatis bertambah setiap warga yang Anda referensikan mendaftar di area {area!.name}.
        </p>
        <div className="mt-4 max-w-xs">
          <label className="text-xs font-bold text-slate-600">Pilih warga untuk simulasi penukaran</label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"
          >
            <option value="">— Pilih warga —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · ⭐ {m.points}
              </option>
            ))}
          </select>
        </div>
        {member && (
          <p className="mt-3 text-sm font-semibold text-slate-700">
            Saldo poin {member.name}:{" "}
            <span className="text-[#f97316]">{member.points} poin</span>
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((r) => {
          const enough = member ? member.points >= r.points_cost : false;
          return (
            <div key={r.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#facc15] to-[#f97316] text-lg">
                {r.icon === "voucher" ? "🎫" : r.icon === "wifi" ? "📶" : r.icon === "ride" ? "🛵" : "👕"}
              </div>
              <h3 className="mt-4 font-display text-lg font-extrabold">{r.name}</h3>
              <p className="mt-1 text-xs text-slate-500">Stok tersedia: {r.stock}</p>
              <p className="mt-3 font-display text-xl font-extrabold text-[#f97316]">
                {r.points_cost} <span className="text-sm font-semibold text-slate-500">poin</span>
              </p>
              <button
                disabled={!enough || !member || r.stock <= 0}
                onClick={() => redeemReward(selectedMember, r.id)}
                className="mt-4 w-full rounded-full bg-[#22c55e] py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {r.stock <= 0 ? "Stok habis" : enough ? "Tukarkan poin" : "Poin tidak cukup"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Kas tab ---------------- */
function KasTab({
  area,
  treasury,
}: {
  area: ReturnType<typeof useArea>;
  treasury: ReturnType<typeof useAreaTreasury>;
}) {
  const totalIn = treasury.filter((t) => t.amount > 0 && t.type !== "pencairan").reduce((s, t) => s + t.amount, 0);
  const totalOut = treasury.filter((t) => t.type === "pencairan").reduce((s, t) => s + Math.abs(t.amount), 0);
  const saldo = totalIn - totalOut;
  const [nominal, setNominal] = useState(100000);
  const [note, setNote] = useState("");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Total Komisi Masuk" value={formatRupiah(totalIn)} color="bg-[#22c55e]" icon="📥" />
        <Kpi label="Total Dicairkan" value={formatRupiah(totalOut)} color="bg-[#ef4444]" icon="📤" />
        <Kpi label="Saldo Kas RT" value={formatRupiah(saldo)} color="bg-[#0d9b8a]" icon="🏦" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg font-extrabold">Riwayat Kas RT</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-3 pr-4">Tanggal</th>
                  <th className="py-3 pr-4">Jenis</th>
                  <th className="py-3 pr-4">Keterangan</th>
                  <th className="py-3 pr-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {treasury.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 text-xs text-slate-500">
                      {new Date(t.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
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
                    <td className={`py-3 pr-4 text-right font-bold ${t.amount < 0 ? "text-red-500" : "text-[#16a34a]"}`}>
                      {t.amount < 0 ? "-" : "+"}
                      {formatRupiah(Math.abs(t.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl bg-[#0b1d36] p-6 text-white shadow-sm">
          <h3 className="font-display text-lg font-extrabold">Ajukan Pencairan</h3>
          <p className="mt-1 text-sm text-white/70">
            Saldo kas RT untuk {area!.name} dapat dicairkan ke rekening RT atau digunakan untuk kegiatan
            warga.
          </p>
          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">Nominal</span>
              <input
                type="number"
                value={nominal}
                onChange={(e) => setNominal(+e.target.value)}
                className="mt-1 h-11 w-full rounded-xl bg-white/10 px-3 text-white outline-none placeholder:text-white/40 focus:bg-white/15"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">Keperluan</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Cth: Dana kerja bakti RT03"
                className="mt-1 w-full rounded-xl bg-white/10 px-3 py-2 text-white outline-none placeholder:text-white/40 focus:bg-white/15"
              />
            </label>
            <button
              type="button"
              disabled={nominal <= 0 || nominal > saldo}
              onClick={() => {
                addTreasury(area!.id, -nominal, "pencairan", note || "Pencairan kas RT");
                setNominal(100000);
                setNote("");
              }}
              className="w-full rounded-full bg-[#facc15] py-3 text-sm font-extrabold text-[#122033] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#fde047]"
            >
              Cairkan Sekarang
            </button>
            <p className="text-[11px] text-white/60">
              {saldo < nominal ? "Saldo tidak mencukupi." : "Tersimpan otomatis & tercatat di sistem realtime."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Peta + Grafik (gabungan) ---------------- */
function PetaTab({
  areas,
  members,
  currentAreaId,
}: {
  areas: ReturnType<typeof useAllAreas>;
  members: MemberT[];
  currentAreaId: string;
}) {
  const byArea = useMemo(() => {
    const map = new Map<string, number>();
    members.forEach((m) => map.set(m.area_id, (map.get(m.area_id) ?? 0) + 1));
    return areas.map((a) => ({
      id: a.id,
      name: a.name.replace("Perumahan ", "").replace(" Residence", "").replace(" Nusa Loka", ""),
      city: a.city,
      total: map.get(a.id) ?? 0,
      target: a.target,
      pct: Math.min(100, Math.round(((map.get(a.id) ?? 0) / a.target) * 100)),
      x: projLng(a.lng),
      y: projLat(a.lat),
      isCurrent: a.id === currentAreaId,
    }));
  }, [areas, members, currentAreaId]);

  const monthly = useMemo(() => last6Months(members), [members]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold">Peta Persebaran Mitra RT</h2>
            <p className="text-sm text-slate-500">
              Titik merah menunjukkan lokasi perumahan mitra. Ukuran titik bertambah seiring jumlah warga
              yang mendaftar.
            </p>
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-600">
            ● Live · {members.length} total anggota
          </span>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0b1d36] via-[#163255] to-[#0d9b8a]">
            <svg viewBox="0 0 800 420" className="h-[420px] w-full">
              {/* latitude/longitude projection helpers (very rough Indonesia bounds) */}
              <IndonesiaMap />
              {byArea.map((p) => (
                <g key={p.id} transform={`translate(${p.x}, ${p.y})`}>
                  {(p.total > 0 || p.isCurrent) && (
                    <circle
                      r={Math.min(34, 10 + p.total * 1.2)}
                      fill={p.isCurrent ? "#facc15" : "#f97316"}
                      fillOpacity={0.25}
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    r={Math.min(18, 4 + p.total * 0.9)}
                    fill={p.isCurrent ? "#facc15" : "#f97316"}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                  <text
                    y={-14 - Math.min(18, 4 + p.total * 0.9)}
                    textAnchor="middle"
                    className="fill-white text-[11px] font-bold"
                    style={{ paintOrder: "stroke", stroke: "#0b1d36", strokeWidth: 3 }}
                  >
                    {p.total}
                  </text>
                  <text
                    y={22 + Math.min(18, 4 + p.total * 0.9)}
                    textAnchor="middle"
                    className="fill-white text-[10px] font-semibold"
                    style={{ paintOrder: "stroke", stroke: "#0b1d36", strokeWidth: 3 }}
                  >
                    {p.city}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="space-y-2">
            {byArea.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                  p.isCurrent ? "border-[#22c55e] bg-green-50/60" : "border-slate-200 bg-white"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {p.name}
                    {p.isCurrent && <span className="ml-2 text-[11px] text-[#16a34a]">· Area Anda</span>}
                  </p>
                  <p className="text-xs text-slate-500">{p.city}</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-[#facc15]"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-extrabold">{p.total}</p>
                  <p className="text-[10px] text-slate-400">dari {p.target}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-display text-lg font-extrabold">Pertumbuhan Anggota 6 Bulan</h3>
          <div className="h-[260px]">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#0d9b8a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-display text-lg font-extrabold">Distribusi Paket Nasional</h3>
          <div className="h-[260px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={packageBreakdown(members)}
                  dataKey="jumlah"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {packageBreakdown(members).map((d, i) => (
                    <Cell
                      key={d.name}
                      fill={["#22c55e", "#f97316", "#facc15", "#0d9b8a", "#8b5cf6", "#3b82f6"][i % 6]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */
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

function computeAreaStats(_areaId: string, members: MemberT[], treasury: ReturnType<typeof useAreaTreasury>) {
  const totalPoints = members.reduce((s, m) => s + m.points, 0);
  const weekAgo = Date.now() - 7 * 86400000;
  const last7days = members.filter((m) => +new Date(m.registered_at) >= weekAgo).length;
  const kasTotal = treasury.reduce((s, t) => s + (t.type === "pencairan" ? -Math.abs(t.amount) : t.amount), 0);
  return { totalPoints, last7days, kasTotal };
}

function last7days(members: MemberT[], areaId: string) {
  const out: { day: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const count = members.filter(
      (m) => m.area_id === areaId && +new Date(m.registered_at) >= +d && +new Date(m.registered_at) < +next,
    ).length;
    out.push({
      day: d.toLocaleDateString("id-ID", { weekday: "short" }),
      count,
    });
  }
  return out;
}

function last6Months(members: MemberT[]) {
  const out: { month: string; total: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const total = members.filter(
      (m) => +new Date(m.registered_at) >= +d && +new Date(m.registered_at) < +next,
    ).length;
    out.push({
      month: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      total,
    });
  }
  return out;
}

function packageBreakdown(members: MemberT[]) {
  const map = new Map<string, number>();
  members.forEach((m) => map.set(m.package_name, (map.get(m.package_name) ?? 0) + 1));
  const order = ["Suka Suka Harian", "Stream 30", "Stream 50", "Stream 100", "Stream+ 100", "Suite 50"];
  const list = Array.from(map.entries()).map(([name, jumlah]) => ({ name, jumlah }));
  list.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  return list.length
    ? list
    : [
        { name: "Suka Suka Harian", jumlah: 0 },
        { name: "Stream 50", jumlah: 0 },
        { name: "Stream 100", jumlah: 0 },
        { name: "Stream+ 100", jumlah: 0 },
      ];
}

// very rough lng/lat -> SVG x/y across Indonesia
function projLng(lng: number) {
  // lng range ~ 95 .. 141
  return ((lng - 95) / (141 - 95)) * 800;
}
function projLat(lat: number) {
  // lat range ~ -11 .. 6
  return ((6 - lat) / (6 - -11)) * 420;
}

function IndonesiaMap() {
  // Stylized, simplified Indonesia silhouettes (decorative)
  return (
    <g fill="#ffffff" fillOpacity="0.08" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="0.8">
      {/* Sumatra */}
      <path d="M140,110 q-20,40 -18,90 q2,55 30,105 q22,35 40,40 q-10,-30 -8,-75 q4,-70 -44,-160 z" />
      {/* Java */}
      <path d="M270,280 q40,10 80,12 q55,0 95,-12 q-30,-20 -85,-20 q-55,0 -90,20 z" />
      {/* Kalimantan */}
      <path d="M330,120 q45,-8 80,30 q30,30 25,60 q-5,25 -30,45 q-40,28 -95,10 q-40,-20 -30,-80 q8,-35 50,-65 z" />
      {/* Sulawesi */}
      <path d="M550,110 q30,20 25,55 q-5,30 -20,45 q-10,25 -30,25 q-15,-15 -5,-40 q-15,-20 0,-45 q10,-25 30,-40 z" />
      {/* Papua */}
      <path d="M640,180 q40,-15 110,-5 q20,5 20,25 q0,25 -30,35 q-55,15 -110,-5 q-10,-10 -10,-25 q0,-15 20,-25 z" />
      {/* Bali / Nusa Tenggara */}
      <path d="M445,305 q30,30 75,55 q15,5 20,-5 q-10,-20 -35,-40 q-25,-20 -60,-10 z" />
    </g>
  );
}


