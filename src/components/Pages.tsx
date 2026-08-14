import { useMemo, useState } from "react";
import type { NewsArticle, View } from "../types";
import { registerMember } from "../lib/realtime";
import { useAllAreas } from "../lib/useRealtime";

type PagesProps = {
  view: View;
  onNavigate: (view: View) => void;
  newsId: string | null;
  onOpenNews: (id: string) => void;
};

const newsList: NewsArticle[] = [
  {
    id: "suka-suka",
    title: "Putra.net Luncurkan Internet Suka-Suka, Unlimited Mulai Rp13.000/Hari",
    date: "3 Oktober 2025",
    excerpt:
      "Paket internet fleksibel dengan masa aktif 1, 7, atau 14 hari. Cocok untuk gaya hidup digital yang dinamis tanpa terikat paket bulanan.",
    category: "Produk",
  },
  {
    id: "palembang",
    title: "Putra.net Resmikan Cabang ke-14 di Palembang, Percepat Ekonomi Digital",
    date: "18 November 2025",
    excerpt:
      "Perluasan jaringan fiber optic ke Sumatera Selatan memperkuat komitmen Putra.net (by BTP) menghadirkan internet cepat dan terjangkau.",
    category: "Perusahaan",
  },
  {
    id: "depok",
    title: "Internet Cepat dan Stabil, Putra.net Resmikan Cabang Depok",
    date: "9 September 2025",
    excerpt:
      "Kantor layanan baru di Depok memudahkan pelanggan Jabodetabek mendapatkan dukungan teknis dan pendaftaran langsung.",
    category: "Perusahaan",
  },
  {
    id: "ciptaland",
    title: "Putra.net Hadir di Perumahan Ciptaland, Tiban — Batam",
    date: "10 Februari 2026",
    excerpt:
      "Layanan fiber optic Putra.net by PT Bangun Tirta Pratama kini tersisa untuk warga Perumahan Ciptaland dan sekitarnya di Kota Batam.",
    category: "Perusahaan",
  },
];

const streamPlans = [
  { name: "Stream 30", speed: "30 Mbps", price: "Rp306.000", best: false },
  { name: "Stream 50", speed: "50 Mbps", price: "Rp414.000", best: false },
  { name: "Stream 75", speed: "75 Mbps", price: "Rp495.000", best: false },
  { name: "Stream 100", speed: "100 Mbps", price: "Rp576.000", best: true },
  { name: "Stream 200", speed: "200 Mbps", price: "Rp725.000", best: false },
];

const streamPlusPlans = [
  { name: "Stream+ 30", speed: "30 Mbps", price: "Rp324.000", best: false },
  { name: "Stream+ 50", speed: "50 Mbps", price: "Rp432.000", best: false },
  { name: "Stream+ 75", speed: "75 Mbps", price: "Rp515.000", best: false },
  { name: "Stream+ 100", speed: "100 Mbps", price: "Rp595.000", best: true },
  { name: "Stream+ 200", speed: "200 Mbps", price: "Rp755.000", best: false },
];

const sukaPlans = [
  { name: "Harian", speed: "Up to 150 Mbps", price: "Rp13.000", unit: "/Hari", best: true },
  { name: "7 Hari", speed: "Up to 150 Mbps", price: "Rp81.000", unit: "/7 Hari", best: false },
  { name: "14 Hari", speed: "Up to 150 Mbps", price: "Rp133.000", unit: "/14 Hari", best: false },
];

const suitePlans = [
  { name: "Suite 25", speed: "25 Mbps", price: "Rp350.000", best: false },
  { name: "Suite 50", speed: "50 Mbps", price: "Rp450.000", best: true },
  { name: "Suite 100", speed: "100 Mbps", price: "Rp540.000", best: false },
];

const addons = [
  { name: "Set Top Box TV", price: "Rp40.000/bln", desc: "Akses saluran TV premium di layar televisi rumah." },
  { name: "Video On Demand", price: "Gratis*", desc: "Tonton film & serial kapan saja sesuai keinginan." },
  { name: "Telepon Rumah", price: "Mulai Rp50.000", desc: "Nelpon jernih dengan nomor rumah dedicated." },
  { name: "OxyCool IoT", price: "Hubungi CS", desc: "Kontrol AC jarak jauh lewat aplikasi Putra.net." },
];

const faqs = [
  {
    q: "Bagaimana cara berlangganan Putra.net?",
    a: "Cek area terlebih dahulu melalui menu Cari Area, pilih paket, lalu isi formulir Berlangganan. Tim kami akan menghubungi Anda untuk jadwal instalasi 3–4 hari kerja.",
  },
  {
    q: "Apakah ada biaya pasang?",
    a: "Biaya instalasi reguler Rp400.000. Promo tertentu dapat memberikan diskon atau gratis instalasi. Untuk paket Suka-Suka, pelanggan baru wajib membeli Starter Pack yang sudah termasuk ONT, jasa instalasi, dan material.",
  },
  {
    q: "Apa itu paket Suka-Suka?",
    a: "Paket internet prabayar fleksibel hingga 150 Mbps dengan masa aktif 1 hari (Rp13.000), 7 hari, atau 14 hari. Perpanjangan dilakukan mudah lewat aplikasi Selfcare.",
  },
  {
    q: "Bagaimana cara membayar tagihan?",
    a: "Pembayaran dapat dilakukan melalui Selfcare, virtual account bank, e-wallet, minimarket, atau transfer. Sistem berlangganan reguler adalah pembayaran di awal.",
  },
  {
    q: "Berapa nomor Customer Care Putra.net?",
    a: "Hubungi +62 896-7575-7553 (24 jam) atau WhatsApp resmi kami. Email: cs@putra.net.",
  },
  {
    q: "Apakah internet Putra.net unlimited tanpa FUP?",
    a: "Ya. Semua paket Putra.net by BTP menggunakan 100% fiber optic tanpa kuota dan tanpa FUP.",
  },
];

const homebases = [
  { city: "Batam — Kantor Pusat", address: "Perumahan Ciptaland, Jl. Ciptaland No.58, Tiban, Batam" },
  { city: "Jakarta Selatan", address: "Jl. KH Abdullah Syafei No.27, Tebet" },
  { city: "Jakarta Pusat", address: "Jl. Proklamasi, Menteng" },
  { city: "Depok", address: "Ruko Margonda, Kota Depok" },
  { city: "Tangerang", address: "BSD City, Serpong" },
  { city: "Bandung", address: "Jl. Sukajadi, Bandung" },
];

export default function Pages({ view, onNavigate, newsId, onOpenNews }: PagesProps) {
  if (view === "packages" || view === "internet-rumah") {
    return <PackagesHub onNavigate={onNavigate} title={view === "internet-rumah" ? "Internet Rumah" : "Paket & Harga"} />;
  }
  if (view === "package-stream") {
    return (
      <PlanPage
        eyebrow="STREAM"
        title="Stream On Up to 200Mbps!"
        subtitle="Stream Internet Unlimited — koneksi fiber optic untuk streaming, work from home, dan gaming tanpa buffer."
        plans={streamPlans}
        unit="/bulan"
        onSubscribe={() => onNavigate("subscribe")}
      />
    );
  }
  if (view === "package-stream-plus") {
    return (
      <PlanPage
        eyebrow="STREAM+"
        title="Total Entertainment"
        subtitle="Stream+ Internet Entertainment Unlimited — internet hingga 200 Mbps plus saluran TV premium untuk seluruh keluarga."
        plans={streamPlusPlans}
        unit="/bulan"
        onSubscribe={() => onNavigate("subscribe")}
      />
    );
  }
  if (view === "package-suka-suka") {
    return (
      <PlanPage
        eyebrow="SUKA SUKA"
        title="Paket Fleksibel Bikin Hidup Lebih Simpel"
        subtitle="Suka Suka Internet Unlimited Fleksibel hingga 150 Mbps. Bayar harian atau mingguan, atur sendiri lewat Selfcare."
        plans={sukaPlans}
        unit=""
        note="* Aktifkan Starter Pack terlebih dahulu. Harga sudah termasuk PPN. Perpanjangan hanya melalui Selfcare."
        onSubscribe={() => onNavigate("subscribe")}
      />
    );
  }
  if (view === "package-apartment" || view === "internet-apartemen") {
    return (
      <PlanPage
        eyebrow="SUITE"
        title="Internet Apartemen & Mall"
        subtitle="Paket Suite dirancang untuk hunian vertikal. Stabil, rapi, dan siap mendukung banyak perangkat sekaligus."
        plans={suitePlans}
        unit="/bulan"
        onSubscribe={() => onNavigate("subscribe")}
      />
    );
  }
  if (view === "package-addon") {
    return <AddonPage onSubscribe={() => onNavigate("subscribe")} />;
  }
  if (view === "news") return <NewsPage onOpenNews={onOpenNews} />;
  if (view === "news-detail") return <NewsDetail id={newsId} onBack={() => onNavigate("news")} />;
  if (view === "help") return <HelpPage />;
  if (view === "contact") return <ContactPage />;
  if (view === "subscribe") return <SubscribePage />;
  if (view === "selfcare") return <SelfcarePage />;
  if (view === "check-area") return <CheckAreaPage onSubscribe={() => onNavigate("subscribe")} />;
  if (view === "local-homebase") return <HomebasePage />;
  return null;
}

function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#f6f8fb]">
      <div className="bg-gradient-to-br from-[#0b1d36] via-[#123056] to-[#0d9b8a] px-4 py-14 text-white sm:px-6">
        <div className="mx-auto max-w-[1100px]">
          {eyebrow && (
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#facc15]">{eyebrow}</p>
          )}
          <h1 className="mt-2 font-display text-[34px] font-extrabold leading-tight sm:text-[44px]">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-[15px] leading-7 text-white/75">{subtitle}</p>}
        </div>
      </div>
      <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6">{children}</div>
    </div>
  );
}

function PackagesHub({ onNavigate, title }: { onNavigate: (view: View) => void; title: string }) {
  const cards: { title: string; desc: string; view: View; accent: string }[] = [
    { title: "Stream", desc: "Internet unlimited hingga 200 Mbps untuk rumah.", view: "package-stream", accent: "from-orange-500 to-amber-400" },
    { title: "Stream+", desc: "Internet + TV hiburan lengkap untuk keluarga.", view: "package-stream-plus", accent: "from-teal-500 to-emerald-400" },
    { title: "Suka Suka", desc: "Paket harian fleksibel mulai Rp13.000/Hari.", view: "package-suka-suka", accent: "from-yellow-400 to-orange-400" },
    { title: "Apartment & Mall", desc: "Solusi koneksi untuk hunian vertikal.", view: "package-apartment", accent: "from-sky-500 to-indigo-400" },
    { title: "Add On", desc: "TV, VOD, telepon, dan perangkat IoT.", view: "package-addon", accent: "from-violet-500 to-fuchsia-400" },
  ];
  return (
    <PageShell eyebrow="Katalog" title={title} subtitle="Pilih paket yang paling sesuai dengan kebutuhan rumah, apartemen, atau gaya hidup fleksibel Anda.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.title}
            type="button"
            onClick={() => onNavigate(c.view)}
            className="overflow-hidden rounded-3xl bg-white text-left shadow-lg shadow-slate-200/70 transition hover:-translate-y-1"
          >
            <div className={`h-24 bg-gradient-to-r ${c.accent}`} />
            <div className="p-6">
              <h3 className="font-display text-2xl font-extrabold text-[#122033]">{c.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{c.desc}</p>
              <span className="mt-4 inline-block text-sm font-bold text-oxy-teal">Lihat Detail →</span>
            </div>
          </button>
        ))}
      </div>
    </PageShell>
  );
}

function PlanPage({
  eyebrow,
  title,
  subtitle,
  plans,
  unit,
  note,
  onSubscribe,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  plans: { name: string; speed: string; price: string; unit?: string; best?: boolean }[];
  unit: string;
  note?: string;
  onSubscribe: () => void;
}) {
  return (
    <PageShell eyebrow={eyebrow} title={title} subtitle={subtitle}>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/70 ${
              p.best ? "ring-2 ring-[#22c55e]" : ""
            }`}
          >
            {p.best && (
              <span className="absolute -top-3 right-5 rounded-full bg-[#22c55e] px-3 py-1 text-[11px] font-bold text-white">
                Paling Populer
              </span>
            )}
            <p className="text-sm font-bold text-oxy-teal">{p.speed}</p>
            <h3 className="mt-1 font-display text-2xl font-extrabold text-[#122033]">{p.name}</h3>
            <p className="mt-4 font-display text-[32px] font-extrabold text-[#f97316]">
              {p.price}
              <span className="text-sm font-semibold text-slate-500">{p.unit || unit}</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• Kuota unlimited / tanpa FUP</li>
              <li>• 100% Fiber Optic</li>
              <li>• Modem WiFi Dual Band</li>
              <li>• Customer care 24 jam</li>
            </ul>
            <button
              type="button"
              onClick={onSubscribe}
              className="mt-6 w-full rounded-full bg-[#22c55e] py-2.5 text-sm font-bold text-white hover:bg-[#16a34a]"
            >
              Berlangganan
            </button>
          </div>
        ))}
      </div>
      {note && <p className="mt-8 text-sm text-slate-500">{note}</p>}
    </PageShell>
  );
}

function AddonPage({ onSubscribe }: { onSubscribe: () => void }) {
  return (
    <PageShell eyebrow="ADD ON" title="Layanan Tambahan" subtitle="Lengkapi paket internet Anda dengan hiburan, telepon, dan perangkat pintar.">
      <div className="grid gap-5 md:grid-cols-2">
        {addons.map((a) => (
          <div key={a.name} className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/70">
            <h3 className="font-display text-xl font-extrabold text-[#122033]">{a.name}</h3>
            <p className="mt-1 font-display text-2xl font-bold text-[#f97316]">{a.price}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{a.desc}</p>
            <button
              type="button"
              onClick={onSubscribe}
              className="mt-5 rounded-full bg-[#22c55e] px-5 py-2 text-sm font-bold text-white"
            >
              Tambahkan
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function NewsPage({ onOpenNews }: { onOpenNews: (id: string) => void }) {
  return (
    <PageShell eyebrow="NEWS" title="Kabar Terbaru Putra.net" subtitle="Promo, perluasan jaringan, dan cerita koneksi dari seluruh Indonesia.">
      <div className="grid gap-5 md:grid-cols-2">
        {newsList.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onOpenNews(n.id)}
            className="rounded-3xl bg-white p-6 text-left shadow-lg shadow-slate-200/70 transition hover:-translate-y-0.5"
          >
            <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-oxy-teal">
              {n.category}
            </span>
            <h3 className="mt-3 font-display text-xl font-extrabold leading-snug text-[#122033]">{n.title}</h3>
            <p className="mt-2 text-xs font-semibold text-slate-400">{n.date}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{n.excerpt}</p>
          </button>
        ))}
      </div>
    </PageShell>
  );
}

function NewsDetail({ id, onBack }: { id: string | null; onBack: () => void }) {
  const item = newsList.find((n) => n.id === id) ?? newsList[0];
  return (
    <PageShell eyebrow={item.category} title={item.title} subtitle={item.date}>
      <article className="rounded-3xl bg-white p-6 leading-8 text-slate-700 shadow-lg sm:p-10">
        <p>
          {item.excerpt} Putra.net by BTP terus berinovasi menghadirkan layanan internet fiber optic yang relevan
          dengan kebutuhan masyarakat modern — cepat, stabil, fleksibel, dan mudah digunakan.
        </p>
        <p className="mt-4">
          Pelanggan dapat memilih paket Stream, Stream+, atau Suka-Suka sesuai kebutuhan. Aktivasi semudah
          membeli paket data seluler: hubungi tim kami, pilih starter pack, lakukan pembayaran, dan internet
          langsung siap digunakan.
        </p>
        <p className="mt-4">
          Untuk informasi lengkap hubungi Customer Care +62 896-7575-7553 atau chat WhatsApp resmi kami.
        </p>
        <button type="button" onClick={onBack} className="mt-8 text-sm font-bold text-oxy-teal">
          ← Kembali ke News
        </button>
      </article>
    </PageShell>
  );
}

function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <PageShell
      eyebrow="BANTUAN"
      title="Pusat Bantuan Putra.net"
      subtitle="Temukan jawaban seputar pendaftaran, pembayaran, paket, dan layanan pelanggan."
    >
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left font-bold text-[#122033]"
              >
                {f.q}
                <span className="text-oxy-teal">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p className="px-5 pb-5 text-sm leading-7 text-slate-600">{f.a}</p>}
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-3xl bg-[#0b1d36] p-6 text-white">
          <h3 className="font-display text-xl font-bold">Cara Bayar</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>1. Masuk ke Selfcare Putra.net</li>
            <li>2. Pilih tagihan atau perpanjang paket</li>
            <li>3. Bayar via VA, e-wallet, atau minimarket</li>
            <li>4. Paket aktif otomatis setelah pembayaran</li>
          </ul>
          <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm">
            <p className="font-bold">Syarat & Ketentuan</p>
            <p className="mt-2 text-white/70">
              Masa berlangganan reguler minimum 12 bulan. Paket Suka-Suka bersifat prabayar time-to-time
              berdasarkan waktu aktivasi.
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <PageShell
      eyebrow="HUBUNGI KAMI"
      title="Bagaimana kami dapat membantu Anda?"
      subtitle="Kirimkan pertanyaan atau pesan Anda, kami akan segera menghubungi Anda kembali."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <form
          className="space-y-4 rounded-3xl bg-white p-6 shadow-lg sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Field label="ID Pelanggan" placeholder="Opsional untuk pelanggan baru" />
          <Field label="Subject" placeholder="Topik pesan" />
          <Field label="Nama Lengkap" placeholder="Nama Anda" />
          <Field label="Email" type="email" placeholder="nama@email.com" />
          <Field label="Telepon" placeholder="08xxxxxxxxxx" />
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">Pesan</span>
            <textarea className="h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-oxy-teal" />
          </label>
          <button type="submit" className="rounded-full bg-[#22c55e] px-6 py-2.5 text-sm font-bold text-white">
            Kirim Pesan
          </button>
          {sent && <p className="text-sm font-semibold text-oxy-teal">Pesan terkirim. Tim kami akan segera menghubungi Anda.</p>}
        </form>
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
          <h3 className="font-display text-xl font-extrabold">Kantor Layanan Pelanggan</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Perumahan Ciptaland
            <br />
            Jl. Ciptaland No.58, Tiban
            <br />
            Kota Batam, Indonesia
          </p>
          <p className="mt-5 font-display text-2xl font-extrabold text-[#122033]">+62 896-7575-7553</p>
          <p className="text-sm text-slate-500">Call center 24 jam & WhatsApp official</p>
          <a
            href="https://www.google.com/maps/search/?q=Perumahan+Ciptaland+Tiban+Batam"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-700"
          >
            Get Directions
          </a>
        </div>
      </div>
    </PageShell>
  );
}

function SubscribePage() {
  const areas = useAllAreas();
  const [step, setStep] = useState(1);
  const [paket, setPaket] = useState("Suka Suka Harian");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    area_id: areas[0]?.id ?? "",
    city: areas[0]?.city ?? "",
  });

  const submit = () => {
    if (!form.name || !form.phone || !form.area_id) {
      alert("Mohon lengkapi data nama, nomor HP, dan area perumahan.");
      return;
    }
    const area = areas.find((a) => a.id === form.area_id);
    registerMember({
      name: form.name,
      phone: form.phone,
      email: form.email || "anon@mail.com",
      city: area?.city ?? form.city,
      area_id: form.area_id,
      package_name: paket,
    });
    setStep(3);
  };

  return (
    <PageShell
      eyebrow="BERLANGGANAN"
      title="Daftar Internet Putra.net"
      subtitle="Pilih area perumahan Anda — setiap pendaftaran otomatis menjadi poin warga & komisi kas RT di dashboard Mitra."
    >
      <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-8 flex gap-3 text-sm font-bold">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`rounded-full px-3 py-1 ${step >= s ? "bg-[#22c55e] text-white" : "bg-slate-100 text-slate-400"}`}
            >
              Langkah {s}
            </span>
          ))}
        </div>
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Nama Lengkap"
              placeholder="Nama sesuai KTP"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <InputField
              label="Nomor HP"
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
            <InputField
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">Perumahan / Area</span>
                <select
                  value={form.area_id}
                  onChange={(e) => {
                    const a = areas.find((x) => x.id === e.target.value);
                    setForm({ ...form, area_id: e.target.value, city: a?.city ?? "" });
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-oxy-teal"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.city}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-full bg-[#22c55e] px-6 py-2.5 text-sm font-bold text-white sm:col-span-2"
            >
              Lanjut Pilih Paket
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {["Suka Suka Harian", "Stream 50", "Stream 100", "Stream+ 100", "Suite 50"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaket(p)}
                  className={`rounded-2xl border px-4 py-4 text-left font-bold ${
                    paket === p ? "border-[#22c55e] bg-green-50 text-[#16a34a]" : "border-slate-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="rounded-full border px-5 py-2.5 text-sm font-bold">
                Kembali
              </button>
              <button
                type="button"
                onClick={submit}
                className="rounded-full bg-[#22c55e] px-6 py-2.5 text-sm font-bold text-white"
              >
                Kirim Pendaftaran
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-[#16a34a]">
              ✓
            </div>
            <p className="font-display text-3xl font-extrabold text-[#22c55e]">Pendaftaran Berhasil!</p>
            <p className="mx-auto mt-3 max-w-lg text-slate-600">
              Data <strong>{form.name}</strong> untuk paket <strong>{paket}</strong> di{" "}
              <strong>{areas.find((a) => a.id === form.area_id)?.name}</strong> sudah masuk ke sistem. Komisi
              kas RT dan poin reward warga langsung bertambah di dashboard Mitra RT secara real-time.
            </p>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setForm({ name: "", phone: "", email: "", area_id: areas[0]?.id ?? "", city: areas[0]?.city ?? "" });
              }}
              className="mt-6 rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-600"
            >
              Daftarkan warga lain
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-oxy-teal"
      />
    </label>
  );
}

function SelfcarePage() {
  const [mode, setMode] = useState<"login" | "dashboard">("login");
  const [id, setId] = useState("");
  return (
    <PageShell
      eyebrow="SELFCARE"
      title="Kelola Internetmu Sendiri"
      subtitle="Perpanjang paket Suka-Suka, cek tagihan, dan atur layanan kapan saja."
    >
      {mode === "login" ? (
        <form
          className="mx-auto max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-lg"
          onSubmit={(e) => {
            e.preventDefault();
            setMode("dashboard");
          }}
        >
          <Field label="ID Pelanggan / Email" placeholder="OX-123456 atau email" value={id} onChange={setId} />
          <Field label="Password" type="password" placeholder="••••••••" />
          <button type="submit" className="w-full rounded-full bg-[#f97316] py-3 text-sm font-bold text-white">
            Masuk Selfcare
          </button>
          <p className="text-center text-xs text-slate-500">Lupa password? Hubungi +62 896-7575-7553</p>
        </form>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { t: "Status Layanan", d: "Aktif · Stream 100" },
            { t: "Sisa Masa Aktif", d: "18 hari" },
            { t: "Tagihan Berikutnya", d: "Rp576.000" },
          ].map((c) => (
            <div key={c.t} className="rounded-3xl bg-white p-6 shadow-lg">
              <p className="text-sm text-slate-500">{c.t}</p>
              <p className="mt-2 font-display text-2xl font-extrabold text-[#122033]">{c.d}</p>
            </div>
          ))}
          <div className="rounded-3xl bg-[#0b1d36] p-6 text-white md:col-span-3">
            <p className="font-display text-xl font-bold">Perpanjang Suka-Suka</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {["1 Hari · Rp13.000", "7 Hari · Rp81.000", "14 Hari · Rp133.000"].map((x) => (
                <button key={x} type="button" className="rounded-full bg-[#22c55e] px-4 py-2 text-sm font-bold">
                  {x}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

function CheckAreaPage({ onSubscribe }: { onSubscribe: () => void }) {
  const [q, setQ] = useState("");
  const [done, setDone] = useState(false);
  const covered = useMemo(() => {
    if (!q) return false;
    const key = q.toLowerCase();
    return ["jakarta", "depok", "tangerang", "bekasi", "bandung", "bogor", "palembang", "tebet", "mampang"].some((c) =>
      key.includes(c),
    );
  }, [q]);

  return (
    <PageShell
      eyebrow="CEK AREA"
      title="Cari Area Jangkauan Putra.net"
      subtitle="Masukkan kelurahan, kecamatan, atau kota untuk melihat apakah rumah Anda sudah ter-cover."
    >
      <form
        className="rounded-3xl bg-white p-6 shadow-lg sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          setDone(true);
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setDone(false);
            }}
            placeholder="Contoh: Tiban, Kota Batam"
            className="h-12 flex-1 rounded-full border border-slate-200 px-5 text-sm outline-none focus:border-oxy-teal"
          />
          <button type="submit" className="h-12 rounded-full bg-[#22c55e] px-7 text-sm font-bold text-white">
            Cek Sekarang
          </button>
        </div>
        {done && (
          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            {covered ? (
              <>
                <p className="font-display text-xl font-extrabold text-[#22c55e]">Area Anda sudah ter-cover!</p>
                <p className="mt-2 text-sm text-slate-600">
                  Tim kami siap melakukan instalasi di wilayah {q}. Lanjutkan pendaftaran sekarang.
                </p>
                <button
                  type="button"
                  onClick={onSubscribe}
                  className="mt-4 rounded-full bg-[#f97316] px-5 py-2 text-sm font-bold text-white"
                >
                  Berlangganan
                </button>
              </>
            ) : (
              <>
                <p className="font-display text-xl font-extrabold text-[#f97316]">Belum terdeteksi di jangkauan</p>
                <p className="mt-2 text-sm text-slate-600">
                  Coba nama kelurahan/kecamatan lain, atau hubungi +62 896-7575-7553 agar kami bantu cek manual.
                </p>
              </>
            )}
          </div>
        )}
      </form>
    </PageShell>
  );
}

function HomebasePage() {
  return (
    <PageShell
      eyebrow="LOCAL HOMEBASE"
      title="Yuk Cari Homebase Terdekat Kamu"
      subtitle="Kunjungi titik layanan Putra.net untuk konsultasi paket, pembayaran, dan bantuan teknis."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {homebases.map((h) => (
          <div key={h.city} className="rounded-3xl bg-white p-6 shadow-lg">
            <h3 className="font-display text-xl font-extrabold text-[#122033]">{h.city}</h3>
            <p className="mt-2 text-sm text-slate-600">{h.address}</p>
            <p className="mt-3 text-sm font-bold text-oxy-teal">+62 896-7575-7553</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-oxy-teal"
      />
    </label>
  );
}
