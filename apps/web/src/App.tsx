import { useEffect, useState } from "react";

type Health = { status: string; service: string; environment?: string };
type Page = "Dashboard" | "Kasir" | "Produk" | "Persediaan" | "Transaksi" | "Laporan" | "Pengaturan";

const navigation: { group: string; items: { name: Page; icon: string; hint?: string }[] }[] = [
  { group: "WORKSPACE", items: [{ name: "Dashboard", icon: "▦" }, { name: "Kasir", icon: "▣" }] },
  { group: "MANAJEMEN TOKO", items: [{ name: "Produk", icon: "◇" }, { name: "Persediaan", icon: "▤" }, { name: "Transaksi", icon: "↗" }, { name: "Laporan", icon: "▥" }] },
  { group: "PREFERENSI", items: [{ name: "Pengaturan", icon: "⚙" }] },
];

const pageDescriptions: Record<Page, string> = {
  Dashboard: "Pantau ringkasan aktivitas tokomu dalam satu tempat.",
  Kasir: "Alur penjualan dan pembayaran akan dibangun di tahap transaksi.",
  Produk: "Kelola katalog barang, harga jual, dan informasi produk.",
  Persediaan: "Pantau stok masuk, stok keluar, dan riwayat pergerakan barang.",
  Transaksi: "Telusuri penjualan dan detail pembayaran.",
  Laporan: "Lihat performa penjualan dan ringkasan operasional toko.",
  Pengaturan: "Atur profil toko, akun, dan preferensi aplikasi.",
};

function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);
  const [apiState, setApiState] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((response) => { if (!response.ok) throw new Error("API unavailable"); return response.json() as Promise<Health>; })
      .then((data) => { setHealth(data); setApiState("online"); })
      .catch(() => setApiState("offline"));
  }, []);

  const choosePage = (next: Page) => { setPage(next); setSidebarOpen(false); };

  return (
    <div className="app-shell">
      {sidebarOpen && <button className="mobile-scrim" aria-label="Tutup navigasi" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-symbol">W<span>•</span></div>
          <div><strong>WARUNG PINTAR</strong><small>SMART RETAIL SYSTEM</small></div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Tutup menu">×</button>
        </div>
        <div className="store-switcher"><div className="store-avatar">WP</div><div><strong>Warung Utama</strong><small>Workspace toko</small></div><span className="switch-chevron">⌄</span></div>
        <nav className="side-nav" aria-label="Navigasi utama">
          {navigation.map((section) => <div className="nav-section" key={section.group}>
            <p className="nav-heading">{section.group}</p>
            {section.items.map((item) => <button key={item.name} className={`nav-item ${page === item.name ? "active" : ""}`} onClick={() => choosePage(item.name)}>
              <span className="nav-icon">{item.icon}</span><span>{item.name}</span>{item.hint && <small>{item.hint}</small>}
            </button>)}
          </div>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon">✦</div><strong>Butuh bantuan?</strong><p>Pusat panduan WARUNG PINTAR akan segera hadir.</p><span>SEGERA HADIR ↗</span></div>
          <div className="profile-row"><div className="profile-avatar">A</div><div><strong>Administrator</strong><small>Owner workspace</small></div><button aria-label="Menu akun">•••</button></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Buka navigasi">☰</button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div>
          <div className="topbar-actions"><span className={`connection-pill ${apiState}`}><i />{apiState === "online" ? "API terhubung" : apiState === "checking" ? "Memeriksa API" : "API offline"}</span><button className="icon-button" aria-label="Notifikasi">♧</button><div className="top-avatar">A</div></div>
        </header>

        <div className="page-content">
          <div className="page-heading"><div><p className="eyebrow">OVERVIEW / {page.toUpperCase()}</p><h1>{page === "Dashboard" ? "Dashboard" : page}</h1><p>{pageDescriptions[page]}</p></div><div className="date-chip"><span>◷</span> Ringkasan hari ini</div></div>

          {page === "Dashboard" ? <Dashboard health={health} apiState={apiState} onOpen={choosePage} /> : <ModulePreview page={page} onOpen={choosePage} />}
          <footer className="page-footer"><span>© {new Date().getFullYear()} WARUNG PINTAR</span><span>BUILD FOUNDATION · PHASE 1</span></footer>
        </div>
      </main>
    </div>
  );
}

function Dashboard({ health, apiState, onOpen }: { health: Health | null; apiState: string; onOpen: (page: Page) => void }) {
  return <>
    <section className="welcome-banner"><div className="welcome-copy"><span className="banner-kicker">✦ SELAMAT DATANG DI WARUNG PINTAR</span><h2>Kelola tokomu,<br /><em>lebih mudah setiap hari.</em></h2><p>Semua kebutuhan operasional toko, disiapkan dalam satu workspace yang terintegrasi.</p><button onClick={() => onOpen("Kasir")}>Jelajahi halaman kasir <span>→</span></button></div><div className="banner-art" aria-hidden="true"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-card"><span>W</span><small>SMART<br />RETAIL</small></div><div className="art-spark">✳</div></div></section>

    <div className="section-title"><div><h2>Ringkasan toko</h2><p>Indikator utama akan tampil setelah modul transaksi aktif.</p></div><span className="preview-label">UI PREVIEW</span></div>
    <section className="stats-grid">
      <StatCard label="Penjualan hari ini" value="—" change="Menunggu modul penjualan" icon="↗" tone="green" />
      <StatCard label="Total transaksi" value="—" change="Menunggu modul transaksi" icon="▣" tone="blue" />
      <StatCard label="Produk terdaftar" value="—" change="Menunggu modul produk" icon="◇" tone="purple" />
      <StatCard label="Stok perlu perhatian" value="—" change="Menunggu modul persediaan" icon="▤" tone="orange" />
    </section>

    <section className="dashboard-grid">
      <div className="panel sales-panel"><div className="panel-heading"><div><h3>Aktivitas penjualan</h3><p>Grafik akan terisi dari transaksi aktual.</p></div><button className="subtle-button" onClick={() => onOpen("Laporan")}>Lihat laporan ↗</button></div><div className="chart-placeholder"><div className="chart-y"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="chart-area"><div className="chart-gridlines"><i/><i/><i/><i/><i/></div><div className="chart-empty"><span className="chart-empty-icon">⌁</span><strong>Belum ada data penjualan</strong><small>Grafik akan muncul setelah transaksi dicatat.</small></div><div className="chart-x"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div></div></div></div>
      <div className="panel activity-panel"><div className="panel-heading"><div><h3>Status sistem</h3><p>Kondisi layanan saat ini.</p></div><span className="live-indicator"><i /> LIVE</span></div><div className="system-row"><span className="system-icon">⌘</span><div><strong>Frontend</strong><small>Antarmuka aktif</small></div><span className="system-status good">Aktif</span></div><div className="system-row"><span className="system-icon">⌁</span><div><strong>API Service</strong><small>{health?.service ?? "warung-pintar-api"}</small></div><span className={`system-status ${apiState === "online" ? "good" : "waiting"}`}>{apiState === "online" ? "Terhubung" : apiState === "checking" ? "Memeriksa" : "Offline"}</span></div><div className="system-row"><span className="system-icon">▤</span><div><strong>Database</strong><small>PostgreSQL · Development</small></div><span className="system-status waiting">Belum diuji</span></div><div className="system-note">Data operasional belum ditampilkan. Tidak ada angka penjualan atau stok contoh yang dianggap sebagai data asli.</div></div>
    </section>

    <div className="section-title quick-title"><div><h2>Akses cepat</h2><p>Pilih area kerja yang ingin kamu buka.</p></div></div>
    <section className="quick-grid">{([{name:"Kasir",desc:"Penjualan & pembayaran",icon:"▣"},{name:"Produk",desc:"Katalog & harga barang",icon:"◇"},{name:"Persediaan",desc:"Kontrol stok barang",icon:"▤"},{name:"Laporan",desc:"Analisis performa toko",icon:"▥"}] as {name:Page;desc:string;icon:string}[]).map((item)=><button className="quick-card" key={item.name} onClick={()=>onOpen(item.name)}><span>{item.icon}</span><div><strong>{item.name}</strong><small>{item.desc}</small></div><b>→</b></button>)}</section>
  </>;
}

function StatCard({ label, value, change, icon, tone }: { label:string; value:string; change:string; icon:string; tone:string }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><i className={`stat-icon ${tone}`}>{icon}</i></div><strong className="stat-value">{value}</strong><small className="stat-foot">{change}</small></article>;
}

function ModulePreview({ page, onOpen }: { page: Page; onOpen: (page:Page)=>void }) {
  const details: Record<Exclude<Page,"Dashboard">,{tag:string;title:string;description:string;steps:string[]}> = {
    Kasir:{tag:"POINT OF SALE",title:"Kasir siap dibangun",description:"Antarmuka kasir akan mengutamakan pencarian produk cepat, keranjang yang jelas, dan proses pembayaran yang aman.",steps:["Pencarian produk & barcode","Keranjang dan ringkasan belanja","Metode pembayaran & struk"]},
    Produk:{tag:"PRODUCT CATALOG",title:"Pusat katalog produk",description:"Kelola data produk, kategori, satuan, harga jual, dan informasi pendukung lainnya.",steps:["Daftar & pencarian produk","Kategori, SKU, dan barcode","Harga jual dan status produk"]},
    Persediaan:{tag:"INVENTORY CONTROL",title:"Persediaan lebih terkendali",description:"Satu sumber data stok akan digunakan untuk menjaga konsistensi pergerakan barang.",steps:["Saldo stok terkini","Stok masuk dan stok keluar","Riwayat mutasi dan penyesuaian"]},
    Transaksi:{tag:"TRANSACTION HISTORY",title:"Riwayat transaksi toko",description:"Telusuri transaksi, status pembayaran, dan detail item setelah modul penjualan tersedia.",steps:["Daftar transaksi dan filter tanggal","Rincian item dan pembayaran","Status transaksi dan pembatalan terkontrol"]},
    Laporan:{tag:"BUSINESS REPORTS",title:"Laporan operasional toko",description:"Ringkasan penjualan dan performa produk akan dihitung dari transaksi yang tersimpan.",steps:["Ringkasan penjualan","Produk terlaris dan pergerakan stok","Ekspor laporan"]},
    Pengaturan:{tag:"WORKSPACE SETTINGS",title:"Pengaturan workspace",description:"Pengaturan profil toko, pengguna, dan keamanan akan tersedia bertahap.",steps:["Profil toko dan preferensi","Pengguna dan hak akses","Keamanan akun dan sesi"]},
  };
  const detail = details[page as Exclude<Page,"Dashboard">];
  return <section className="module-stage"><div className="module-visual"><div className="module-orbit orbit-a"/><div className="module-orbit orbit-b"/><div className="module-symbol">{page === "Kasir" ? "▣" : page === "Produk" ? "◇" : page === "Persediaan" ? "▤" : page === "Transaksi" ? "↗" : page === "Laporan" ? "▥" : "⚙"}</div><span className="module-glow"/></div><div className="module-copy"><span className="preview-label">{detail.tag} · ROADMAP</span><h2>{detail.title}</h2><p>{detail.description}</p><div className="roadmap-list">{detail.steps.map((step,index)=><div key={step}><span>0{index+1}</span>{step}<i>○</i></div>)}</div><div className="module-actions"><span className="coming-soon">● Dalam tahap pengembangan</span><button className="subtle-button" onClick={()=>onOpen("Dashboard")}>← Kembali ke dashboard</button></div></div></section>;
}

export default App;
