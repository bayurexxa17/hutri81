/**
 * Real-time data layer.
 *
 * Strukturnya 1:1 mengikuti skema tabel Supabase (housing_areas, members,
 * rt_admins, treasury, rewards), sehingga ketika VITE_SUPABASE_URL dan
 * VITE_SUPABASE_ANON_KEY diisi di .env, aplikasi otomatis menggunakan Supabase
 * + Realtime Postgres Changes. Tanpa env, lapisan ini memakai localStorage +
 * BroadcastChannel agar semua tab peramban tetap sinkron secara real-time.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Area = {
  id: string;
  name: string;
  city: string;
  rt_admin_name: string;
  rt_admin_phone: string;
  target: number;
  revenue_share: number; // kas RT per pendaftaran (Rupiah)
  points_per_signup: number; // poin warga per pendaftaran
  lat: number;
  lng: number;
};

export type Member = {
  id: string;
  name: string;
  phone: string;
  email: string;
  area_id: string;
  package_name: string;
  points: number;
  status: "baru" | "aktif" | "nonaktif";
  registered_at: string; // ISO
};

export type RtAdmin = {
  id: string;
  username: string;
  password: string;
  area_id: string;
  name: string;
};

export type Treasury = {
  id: string;
  area_id: string;
  member_id: string | null;
  member_name?: string;
  amount: number;
  type: "komisi" | "pencairan" | "bonus";
  note: string;
  created_at: string;
};

export type Reward = {
  id: string;
  name: string;
  points_cost: number;
  stock: number;
  icon: string;
};

export type SuperAdmin = {
  id: string;
  username: string;
  password: string;
  name: string;
};

export type ActivityLog = {
  id: string;
  ts: string;
  actor: string;
  action: string;
  entity: string;
  detail: string;
};

const URL = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const ANON = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
export const USE_REMOTE = !!(URL && ANON && URL.startsWith("https://"));

export const supabase: SupabaseClient | null = USE_REMOTE
  ? createClient(URL as string, ANON as string, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;

/* ---------------- Fallback (local) store ---------------- */
const LS_KEY = "putra_rt_store_v1";
const CHAN = "oxy-rt-bus";

type DB = {
  areas: Area[];
  members: Member[];
  admins: RtAdmin[];
  treasury: Treasury[];
  rewards: Reward[];
  superAdmins: SuperAdmin[];
  logs: ActivityLog[];
};

const uid = () =>
  "id_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

function seed(): DB {
  return {
    areas: [
      { id: "a0", name: "Perumahan Ciptaland", city: "Batam", rt_admin_name: "Pak Putra", rt_admin_phone: "+62 896-7575-7553", target: 200, revenue_share: 75000, points_per_signup: 50, lat: 1.10, lng: 103.99 },
      { id: "a1", name: "Perumahan Bumi Asri", city: "Depok", rt_admin_name: "Pak Budi", rt_admin_phone: "081211110001", target: 120, revenue_share: 75000, points_per_signup: 50, lat: 6.37, lng: 106.82 },
      { id: "a2", name: "Tebet Residence", city: "Jakarta Selatan", rt_admin_name: "Bu Rina", rt_admin_phone: "081211110002", target: 80, revenue_share: 80000, points_per_signup: 50, lat: 6.23, lng: 106.85 },
      { id: "a3", name: "BSD Nusa Loka", city: "Tangerang Selatan", rt_admin_name: "Pak Hadi", rt_admin_phone: "081211110003", target: 150, revenue_share: 85000, points_per_signup: 60, lat: 6.30, lng: 106.67 },
      { id: "a4", name: "Citra Garden City", city: "Bogor", rt_admin_name: "Bu Sari", rt_admin_phone: "081211110004", target: 100, revenue_share: 70000, points_per_signup: 45, lat: 6.60, lng: 106.80 },
      { id: "a5", name: "Cibubur Village", city: "Jakarta Timur", rt_admin_name: "Pak Wawan", rt_admin_phone: "081211110005", target: 90, revenue_share: 72000, points_per_signup: 45, lat: 6.37, lng: 106.90 },
      { id: "a6", name: "Griya Bandung Indah", city: "Bandung", rt_admin_name: "Pak Ade", rt_admin_phone: "081211110006", target: 70, revenue_share: 65000, points_per_signup: 40, lat: 6.92, lng: 107.63 },
      { id: "a7", name: "Palembang Mas Residence", city: "Palembang", rt_admin_name: "Pak Arief", rt_admin_phone: "081211110007", target: 60, revenue_share: 60000, points_per_signup: 40, lat: -2.99, lng: 104.76 },
    ],
    admins: [
      { id: "u0", username: "rtciptaland", password: "rt123", area_id: "a0", name: "Pak Putra" },
      { id: "u1", username: "rtbumi", password: "rt123", area_id: "a1", name: "Pak Budi" },
      { id: "u2", username: "rttebet", password: "rt123", area_id: "a2", name: "Bu Rina" },
      { id: "u3", username: "rtbsd", password: "rt123", area_id: "a3", name: "Pak Hadi" },
      { id: "u4", username: "rtbogor", password: "rt123", area_id: "a4", name: "Bu Sari" },
      { id: "u5", username: "rtcibubur", password: "rt123", area_id: "a5", name: "Pak Wawan" },
      { id: "u6", username: "rtbdg", password: "rt123", area_id: "a6", name: "Pak Ade" },
      { id: "u7", username: "rtplg", password: "rt123", area_id: "a7", name: "Pak Arief" },
    ],
    members: [
      { id: "m1", name: "Dewi Lestari", phone: "0812000001", email: "dewi@mail.com", area_id: "a1", package_name: "Suka Suka Harian", points: 50, status: "aktif", registered_at: new Date(Date.now() - 86400000 * 9).toISOString() },
      { id: "m2", name: "Rian Saputra", phone: "0812000002", email: "rian@mail.com", area_id: "a1", package_name: "Stream 100", points: 50, status: "aktif", registered_at: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: "m3", name: "Maya Anggraini", phone: "0812000003", email: "maya@mail.com", area_id: "a2", package_name: "Stream+ 100", points: 50, status: "aktif", registered_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: "m4", name: "Joko Widodo", phone: "0812000004", email: "joko@mail.com", area_id: "a3", package_name: "Suite 50", points: 60, status: "aktif", registered_at: new Date(Date.now() - 86400000 * 12).toISOString() },
      { id: "m5", name: "Nia Kurnia", phone: "0812000005", email: "nia@mail.com", area_id: "a3", package_name: "Stream 50", points: 60, status: "aktif", registered_at: new Date(Date.now() - 86400000 * 6).toISOString() },
      { id: "m6", name: "Bima Pratama", phone: "0812000006", email: "bima@mail.com", area_id: "a4", package_name: "Suka Suka Harian", points: 45, status: "aktif", registered_at: new Date(Date.now() - 86400000 * 3).toISOString() },
    ],
    treasury: [
      { id: "t1", area_id: "a1", member_id: "m1", member_name: "Dewi Lestari", amount: 75000, type: "komisi", note: "Komisi pendaftaran Suka Suka", created_at: new Date(Date.now() - 86400000 * 9).toISOString() },
      { id: "t2", area_id: "a1", member_id: "m2", member_name: "Rian Saputra", amount: 75000, type: "komisi", note: "Komisi pendaftaran Stream 100", created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: "t3", area_id: "a2", member_id: "m3", member_name: "Maya Anggraini", amount: 80000, type: "komisi", note: "Komisi pendaftaran Stream+ 100", created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: "t4", area_id: "a3", member_id: "m4", member_name: "Joko Widodo", amount: 85000, type: "komisi", note: "Komisi Suite 50", created_at: new Date(Date.now() - 86400000 * 12).toISOString() },
      { id: "t5", area_id: "a3", member_id: "m5", member_name: "Nia Kurnia", amount: 85000, type: "komisi", note: "Komisi Stream 50", created_at: new Date(Date.now() - 86400000 * 6).toISOString() },
      { id: "t6", area_id: "a4", member_id: "m6", member_name: "Bima Pratama", amount: 70000, type: "komisi", note: "Komisi Suka Suka", created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
    ],
    rewards: [
      { id: "r1", name: "Voucher Indomaret Rp50.000", points_cost: 500, stock: 20, icon: "voucher" },
      { id: "r2", name: "Gratis 7 Hari Suka Suka", points_cost: 300, stock: 50, icon: "wifi" },
      { id: "r3", name: "Tumbler Eksklusif Putra.net", points_cost: 800, stock: 12, icon: "merch" },
      { id: "r4", name: "Voucher Gojek Rp25.000", points_cost: 250, stock: 30, icon: "ride" },
      { id: "r5", name: "Kaos Putra.net Official", points_cost: 1200, stock: 8, icon: "merch" },
    ],
    superAdmins: [
      { id: "sa1", username: "admin", password: "admin123", name: "Admin Pusat Putra.net" },
    ],
    logs: [
      {
        id: "l0",
        ts: new Date().toISOString(),
        actor: "system",
        action: "seed",
        entity: "db",
        detail: "Database demo diinisialisasi",
      },
    ],
  };
}

function log(actor: string, action: string, entity: string, detail: string) {
  const db = load();
  db.logs.unshift({
    id: uid(),
    ts: new Date().toISOString(),
    actor,
    action,
    entity,
    detail,
  });
  if (db.logs.length > 500) db.logs.length = 500;
}

let _db: DB | null = null;

function load(): DB {
  if (_db) return _db;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) _db = JSON.parse(raw) as DB;
    else _db = seed();
  } catch {
    _db = seed();
  }
  return _db as DB;
}

function save() {
  if (!_db) return;
  localStorage.setItem(LS_KEY, JSON.stringify(_db));
  // force snapshot refresh for in-tab subscribers
  _db = null;
  const ch = new BroadcastChannel(CHAN);
  ch.postMessage({ type: "sync" });
  ch.close();
  listeners.forEach((l) => l());
}

const listeners = new Set<() => void>();
let channel: BroadcastChannel | null = null;
if (typeof window !== "undefined") {
  channel = new BroadcastChannel(CHAN);
  channel.onmessage = () => {
    _db = null;
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", (e) => {
    if (e.key === LS_KEY) {
      _db = null;
      listeners.forEach((l) => l());
    }
  });
}
// silence unused
void channel;

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getDB(): DB {
  return load();
}

/* ---------------- Mutations (fallback) ---------------- */
export function registerMember(input: {
  name: string;
  phone: string;
  email: string;
  city: string;
  area_id: string;
  package_name: string;
  actor?: string;
}): Member {
  const db = load();
  const area = db.areas.find((a) => a.id === input.area_id)!;
  const member: Member = {
    id: uid(),
    name: input.name,
    phone: input.phone,
    email: input.email,
    area_id: input.area_id,
    package_name: input.package_name,
    points: area.points_per_signup,
    status: "aktif",
    registered_at: new Date().toISOString(),
  };
  db.members.unshift(member);
  db.treasury.unshift({
    id: uid(),
    area_id: area.id,
    member_id: member.id,
    member_name: member.name,
    amount: area.revenue_share,
    type: "komisi",
    note: `Komisi otomatis pendaftaran ${input.package_name}`,
    created_at: new Date().toISOString(),
  });
  log(input.actor ?? "pelanggan", "create", "member", `${member.name} mendaftar ${input.package_name} di ${area.name}`);
  save();
  listeners.forEach((l) => l());
  return member;
}

export function approveMember(id: string) {
  const db = load();
  const m = db.members.find((x) => x.id === id);
  if (m) {
    m.status = "aktif";
    log("rt-admin", "approve", "member", m.name);
    save();
    listeners.forEach((l) => l());
  }
}

export function updateMember(id: string, patch: Partial<Member>) {
  const db = load();
  const m = db.members.find((x) => x.id === id);
  if (m) {
    Object.assign(m, patch);
    log("admin", "update", "member", `${m.name}: ${Object.keys(patch).join(",")}`);
    save();
    listeners.forEach((l) => l());
  }
}

export function deleteMember(id: string) {
  const db = load();
  const m = db.members.find((x) => x.id === id);
  db.members = db.members.filter((x) => x.id !== id);
  log("admin", "delete", "member", m?.name ?? id);
  save();
  listeners.forEach((l) => l());
}

export function redeemReward(member_id: string, reward_id: string) {
  const db = load();
  const r = db.rewards.find((x) => x.id === reward_id);
  const m = db.members.find((x) => x.id === member_id);
  if (!r || !m || r.stock <= 0 || m.points < r.points_cost) return false;
  r.stock -= 1;
  m.points -= r.points_cost;
  log("rt-admin", "redeem", "reward", `${m.name} menukarkan ${r.name}`);
  save();
  listeners.forEach((l) => l());
  return true;
}

export function addReward(r: Omit<Reward, "id">) {
  const db = load();
  const nr = { ...r, id: uid() };
  db.rewards.push(nr);
  log("admin", "create", "reward", r.name);
  save();
  listeners.forEach((l) => l());
}

export function updateReward(id: string, patch: Partial<Reward>) {
  const db = load();
  const r = db.rewards.find((x) => x.id === id);
  if (r) {
    Object.assign(r, patch);
    log("admin", "update", "reward", r.name);
    save();
    listeners.forEach((l) => l());
  }
}

export function deleteReward(id: string) {
  const db = load();
  const r = db.rewards.find((x) => x.id === id);
  db.rewards = db.rewards.filter((x) => x.id !== id);
  log("admin", "delete", "reward", r?.name ?? id);
  save();
  listeners.forEach((l) => l());
}

export function addArea(a: Omit<Area, "id">) {
  const db = load();
  const na = { ...a, id: uid() };
  db.areas.push(na);
  log("admin", "create", "area", na.name);
  save();
  listeners.forEach((l) => l());
}

export function updateArea(id: string, patch: Partial<Area>) {
  const db = load();
  const a = db.areas.find((x) => x.id === id);
  if (a) {
    Object.assign(a, patch);
    log("admin", "update", "area", a.name);
    save();
    listeners.forEach((l) => l());
  }
}

export function deleteArea(id: string) {
  const db = load();
  const a = db.areas.find((x) => x.id === id);
  db.areas = db.areas.filter((x) => x.id !== id);
  log("admin", "delete", "area", a?.name ?? id);
  save();
  listeners.forEach((l) => l());
}

export function addRtAdmin(a: Omit<RtAdmin, "id">) {
  const db = load();
  const na = { ...a, id: uid() };
  db.admins.push(na);
  log("admin", "create", "rt-admin", na.name);
  save();
  listeners.forEach((l) => l());
}

export function deleteRtAdmin(id: string) {
  const db = load();
  const a = db.admins.find((x) => x.id === id);
  db.admins = db.admins.filter((x) => x.id !== id);
  log("admin", "delete", "rt-admin", a?.name ?? id);
  save();
  listeners.forEach((l) => l());
}

export function addTreasury(
  area_id: string,
  amount: number,
  type: Treasury["type"],
  note: string,
) {
  const db = load();
  const t = {
    id: uid(),
    area_id,
    member_id: null,
    amount,
    type,
    note,
    created_at: new Date().toISOString(),
  };
  db.treasury.unshift(t);
  log("admin", type === "pencairan" ? "withdraw" : "create", "treasury", note);
  save();
  listeners.forEach((l) => l());
}

export function rtLogin(username: string, password: string): RtAdmin | null {
  const db = load();
  return db.admins.find((a) => a.username === username && a.password === password) ?? null;
}

export function superLogin(username: string, password: string): SuperAdmin | null {
  const db = load();
  return db.superAdmins.find((a) => a.username === username && a.password === password) ?? null;
}

/* ----- Supabase realtime helpers (jika env tersedia) ----- */
export function channelRT(areaId: string, cb: () => void) {
  if (!supabase) {
    const fn = () => cb();
    subscribe(fn);
    return () => listeners.delete(fn);
  }
  const ch = supabase
    .channel(`rt-${areaId}`)
    .on("postgres_changes", { event: "*", schema: "public" }, () => cb())
    .subscribe();
  return () => {
    supabase.removeChannel(ch);
  };
}

export function resetDemo() {
  _db = seed();
  save();
  listeners.forEach((l) => l());
}

export function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}
