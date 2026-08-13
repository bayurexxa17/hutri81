import { useEffect, useSyncExternalStore } from "react";
import {
  getDB,
  subscribe,
  addTreasury,
  approveMember,
  redeemReward,
  rtLogin,
  superLogin,
  formatRupiah,
  registerMember,
  resetDemo,
  addArea,
  updateArea,
  deleteArea,
  addRtAdmin,
  deleteRtAdmin,
  addReward,
  updateReward,
  deleteReward,
  updateMember,
  deleteMember,
  type Area,
  type Member,
  type RtAdmin,
  type Reward,
  type Treasury,
  type SuperAdmin,
  type ActivityLog,
} from "./realtime";

export {
  addTreasury,
  approveMember,
  redeemReward,
  rtLogin,
  superLogin,
  formatRupiah,
  registerMember,
  resetDemo,
  addArea,
  updateArea,
  deleteArea,
  addRtAdmin,
  deleteRtAdmin,
  addReward,
  updateReward,
  deleteReward,
  updateMember,
  deleteMember,
};

function getSnapshot() {
  return getDB();
}

export function useDB() {
  return useSyncExternalStore(
    (cb) => subscribe(cb),
    getSnapshot,
    getSnapshot,
  );
}

export function useRtAdmin(adminId: string | null): RtAdmin | null {
  const db = useDB();
  return adminId ? db.admins.find((a) => a.id === adminId) ?? null : null;
}

export function useArea(areaId: string | null): Area | null {
  const db = useDB();
  return areaId ? db.areas.find((a) => a.id === areaId) ?? null : null;
}

export function useAreaMembers(areaId: string | null): Member[] {
  const db = useDB();
  if (!areaId) return [];
  return db.members.filter((m) => m.area_id === areaId);
}

export function useAreaTreasury(areaId: string | null): Treasury[] {
  const db = useDB();
  if (!areaId) return [];
  return db.treasury.filter((t) => t.area_id === areaId);
}

export function useRewards(): Reward[] {
  const db = useDB();
  return db.rewards;
}

export function useAllAreas(): Area[] {
  const db = useDB();
  return db.areas;
}

export function useAllMembers(): Member[] {
  const db = useDB();
  return db.members;
}

export function useAllRtAdmins(): RtAdmin[] {
  const db = useDB();
  return db.admins;
}

export function useSuperAdmins(): SuperAdmin[] {
  const db = useDB();
  return db.superAdmins;
}

export function useActivityLogs(): ActivityLog[] {
  const db = useDB();
  return db.logs;
}

export function useAllTreasury(): Treasury[] {
  const db = useDB();
  return db.treasury;
}

export function useAllRewards(): Reward[] {
  const db = useDB();
  return db.rewards;
}

export function useInterval(ms: number) {
  useEffect(() => {
    const t = setInterval(() => {}, ms);
    return () => clearInterval(t);
  }, [ms]);
}
