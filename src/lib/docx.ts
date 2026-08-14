import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import { formatRupiah } from "./realtime";
import type { Area, Member, RtAdmin, Reward, Treasury } from "./realtime";
import type { ActivityLog } from "../types";

function textP(text: string, opts: { bold?: boolean; size?: number; color?: string } = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold: opts.bold, size: opts.size ?? 22, color: opts.color })],
  });
}

function headerCell(label: string) {
  return new TableCell({
    shading: { type: ShadingType.SOLID, color: "0d9b8a", fill: "0d9b8a" },
    children: [
      new Paragraph({
        children: [new TextRun({ text: label, bold: true, color: "FFFFFF", size: 20 })],
        alignment: AlignmentType.LEFT,
      }),
    ],
  });
}

function bodyCell(text: string) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, size: 20 })],
      }),
    ],
  });
}

function makeTable(headers: string[], rows: (string | number)[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map(headerCell) }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map((c) => bodyCell(String(c))),
          }),
      ),
    ],
  });
}

function today() {
  return new Date().toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function downloadDoc(filename: string, title: string, sections: (Paragraph | Table)[]) {
  const doc = new Document({
    creator: "Putra.net Admin",
    title,
    styles: {
      default: { document: { run: { font: "Calibri", size: 22 } } },
    },
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: title, bold: true, size: 40, color: "0b1d36" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Dibuat otomatis: ${today()} WIB`, size: 20, color: "64748B", italics: true })],
          }),
          new Paragraph({ children: [new TextRun({ text: "" })] }),
          ...sections,
        ],
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

/* ------- Specific exporters ------- */
export function exportMembers(members: Member[], areas: Area[]) {
  const areaMap = new Map(areas.map((a) => [a.id, a.name]));
  const sorted = [...members].sort((a, b) => a.name.localeCompare(b.name));
  return downloadDoc(
    `putra-anggota-${Date.now()}.docx`,
    "Laporan Data Anggota Putra.net",
    [
      textP(`Total anggota: ${sorted.length} orang`, { bold: true }),
      new Paragraph({ children: [new TextRun({ text: "" })] }),
      makeTable(
        ["#", "Nama", "No. HP", "Email", "Perumahan/Area", "Paket", "Poin", "Status", "Terdaftar"],
        sorted.map((m, i) => [
          i + 1,
          m.name,
          m.phone,
          m.email,
          areaMap.get(m.area_id) ?? m.area_id,
          m.package_name,
          m.points,
          m.status,
          new Date(m.registered_at).toLocaleDateString("id-ID"),
        ]),
      ),
    ],
  );
}

export function exportAreas(areas: Area[], members: Member[]) {
  return downloadDoc(
    `putra-perumahan-${Date.now()}.docx`,
    "Laporan Data Perumahan Mitra RT",
    [
      textP(`Total perumahan mitra: ${areas.length}`, { bold: true }),
      new Paragraph({ children: [new TextRun({ text: "" })] }),
      makeTable(
        ["#", "Nama Perumahan", "Kota", "PIC RT", "No. HP", "Target", "Komisi/warga", "Poin/warga", "Total Warga"],
        areas.map((a, i) => [
          i + 1,
          a.name,
          a.city,
          a.rt_admin_name,
          a.rt_admin_phone,
          a.target,
          formatRupiah(a.revenue_share),
          a.points_per_signup,
          members.filter((m) => m.area_id === a.id).length,
        ]),
      ),
    ],
  );
}

export function exportRtAdmins(admins: RtAdmin[], areas: Area[]) {
  const areaMap = new Map(areas.map((a) => [a.id, a.name]));
  return downloadDoc(
    `putra-rt-admin-${Date.now()}.docx`,
    "Laporan Akun Pengurus RT",
    [
      makeTable(
        ["#", "Nama", "Username", "Perumahan"],
        admins.map((a, i) => [i + 1, a.name, a.username, areaMap.get(a.area_id) ?? "-"]),
      ),
    ],
  );
}

export function exportTreasury(treasury: Treasury[], areas: Area[]) {
  const areaMap = new Map(areas.map((a) => [a.id, a.name]));
  const sorted = [...treasury].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const totalIn = sorted.filter((t) => t.type !== "pencairan").reduce((s, t) => s + t.amount, 0);
  const totalOut = sorted.filter((t) => t.type === "pencairan").reduce((s, t) => s + Math.abs(t.amount), 0);
  return downloadDoc(
    `putra-kas-rt-${Date.now()}.docx`,
    "Laporan Kas RT Komisi Putra.net",
    [
      textP(`Total komisi masuk: ${formatRupiah(totalIn)}`, { bold: true, color: "16a34a" }),
      textP(`Total dicairkan: ${formatRupiah(totalOut)}`, { bold: true, color: "dc2626" }),
      textP(`Saldo berjalan: ${formatRupiah(totalIn - totalOut)}`, { bold: true, color: "0d9b8a" }),
      new Paragraph({ children: [new TextRun({ text: "" })] }),
      makeTable(
        ["#", "Tanggal", "Area", "Jenis", "Keterangan", "Nominal"],
        sorted.map((t, i) => [
          i + 1,
          new Date(t.created_at).toLocaleString("id-ID"),
          areaMap.get(t.area_id) ?? "-",
          t.type,
          t.note,
          (t.amount < 0 || t.type === "pencairan" ? "- " : "+ ") + formatRupiah(Math.abs(t.amount)),
        ]),
      ),
    ],
  );
}

export function exportRewards(rewards: Reward[]) {
  return downloadDoc(
    `putra-reward-${Date.now()}.docx`,
    "Katalog Reward Warga Putra.net",
    [
      makeTable(
        ["#", "Nama Reward", "Poin", "Stok"],
        rewards.map((r, i) => [i + 1, r.name, r.points_cost, r.stock]),
      ),
    ],
  );
}

export function exportLogs(logs: ActivityLog[]) {
  const sorted = [...logs].sort((a, b) => +new Date(b.ts) - +new Date(a.ts));
  return downloadDoc(
    `putra-activity-log-${Date.now()}.docx`,
    "Riwayat Aktivitas Sistem Putra.net",
    [
      textP(`Total entri log: ${sorted.length}`, { bold: true }),
      new Paragraph({ children: [new TextRun({ text: "" })] }),
      makeTable(
        ["#", "Waktu", "Pelaku", "Aksi", "Entitas", "Detail"],
        sorted.map((l, i) => [
          i + 1,
          new Date(l.ts).toLocaleString("id-ID"),
          l.actor,
          l.action,
          l.entity,
          l.detail,
        ]),
      ),
    ],
  );
}

export function exportSummary(
  areas: Area[],
  members: Member[],
  treasury: Treasury[],
  rewards: Reward[],
  admins: RtAdmin[],
) {
  const totalIn = treasury.filter((t) => t.type !== "pencairan").reduce((s, t) => s + t.amount, 0);
  const totalOut = treasury.filter((t) => t.type === "pencairan").reduce((s, t) => s + Math.abs(t.amount), 0);
  const packageMap = new Map<string, number>();
  members.forEach((m) => packageMap.set(m.package_name, (packageMap.get(m.package_name) ?? 0) + 1));
  return downloadDoc(
    `putra-ringkasan-${Date.now()}.docx`,
    "Ringkasan Eksekutif Program Mitra RT Putra.net by BTP",
    [
      textP("Indikator Utama", { bold: true, size: 28 }),
      new Paragraph({ children: [new TextRun({ text: "" })] }),
      makeTable(["Metrik", "Nilai"], [
        ["Jumlah perumahan mitra", areas.length],
        ["Jumlah pengurus RT terdaftar", admins.length],
        ["Total anggota warga", members.length],
        ["Total reward tersedia", rewards.reduce((s, r) => s + r.stock, 0)],
        ["Total komisi masuk", formatRupiah(totalIn)],
        ["Total komisi cair", formatRupiah(totalOut)],
        ["Saldo kas berjalan", formatRupiah(totalIn - totalOut)],
      ]),
      new Paragraph({ children: [new TextRun({ text: "" })] }),
      textP("Distribusi Paket", { bold: true, size: 28 }),
      new Paragraph({ children: [new TextRun({ text: "" })] }),
      makeTable(
        ["Paket", "Jumlah Warga"],
        Array.from(packageMap.entries()).map(([k, v]) => [k, v]),
      ),
    ],
  );
}
