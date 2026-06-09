import { useState, useEffect, useCallback, useMemo } from "react";

// ─── Seed Data ───────────────────────────────────────────────────────────────
const SEED_SELLERS = [
  { id: "s1", name: "Carlos Mendes", phone: "(11) 98765-4321", email: "carlos@email.com", cpf: "123.456.789-00", status: "active", notes: "Especialista em eletrônicos", createdAt: "2024-01-10" },
  { id: "s2", name: "Ana Paula Lima", phone: "(11) 91234-5678", email: "ana@email.com", cpf: "987.654.321-00", status: "active", notes: "Foco em acessórios", createdAt: "2024-01-15" },
  { id: "s3", name: "Roberto Souza", phone: "(11) 99876-5432", email: "roberto@email.com", cpf: "", status: "inactive", notes: "", createdAt: "2024-02-01" },
];
const SEED_PRODUCTS = [
  { id: "p1", code: "PROD-001", name: "Notebook Dell Inspiron", desc: "Intel i5, 8GB RAM, 256GB SSD", category: "Eletrônicos", costPrice: 2500, salePrice: 3200, stock: 5, status: "available", sellerId: "s1", image: "", createdAt: "2024-02-10" },
  { id: "p2", code: "PROD-002", name: "Mouse Logitech MX Master", desc: "Mouse sem fio premium", category: "Periféricos", costPrice: 200, salePrice: 350, stock: 12, status: "available", sellerId: "s2", image: "", createdAt: "2024-02-15" },
  { id: "p3", code: "PROD-003", name: "Monitor LG 27\"", desc: "Full HD IPS 75Hz", category: "Eletrônicos", costPrice: 700, salePrice: 1100, stock: 3, status: "available", sellerId: "s1", image: "", createdAt: "2024-02-20" },
  { id: "p4", code: "PROD-004", name: "Teclado Mecânico Redragon", desc: "Switch Red, RGB, ABNT2", category: "Periféricos", costPrice: 150, salePrice: 280, stock: 0, status: "sold", sellerId: "s2", image: "", createdAt: "2024-02-25" },
  { id: "p5", code: "PROD-005", name: "Headset JBL Quantum", desc: "Surround 7.1, USB, LED", category: "Periféricos", costPrice: 180, salePrice: 320, stock: 2, status: "reserved", sellerId: "s1", image: "", createdAt: "2024-03-01" },
];
const SEED_SALES = [
  { id: "v1", productId: "p2", sellerId: "s2", customer: "João Silva", date: "2024-03-05", qty: 2, unitPrice: 350, discount: 0, payment: "credit", total: 700, createdAt: "2024-03-05" },
  { id: "v2", productId: "p4", sellerId: "s1", customer: "Maria Fernanda", date: "2024-03-10", qty: 1, unitPrice: 280, discount: 20, payment: "pix", total: 260, createdAt: "2024-03-10" },
  { id: "v3", productId: "p1", sellerId: "s1", customer: "Pedro Alves", date: new Date().toISOString().split("T")[0], qty: 1, unitPrice: 3200, discount: 100, payment: "debit", total: 3100, createdAt: new Date().toISOString().split("T")[0] },
];

// ─── Utils ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => n?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d) => d ? new Date(d + "T00:00").toLocaleDateString("pt-BR") : "-";
const today = () => new Date().toISOString().split("T")[0];
const STATUS_LABELS = { available: "Disponível", sold: "Vendido", reserved: "Reservado", inactive: "Inativo" };
const STATUS_COLORS = { available: "#16a34a", sold: "#dc2626", reserved: "#d97706", inactive: "#6b7280" };
const STATUS_BG = { available: "#dcfce7", sold: "#fee2e2", reserved: "#fef3c7", inactive: "#f3f4f6" };
const PAY_LABELS = { credit: "Cartão Crédito", debit: "Cartão Débito", pix: "PIX", cash: "Dinheiro", transfer: "Transferência" };
const CATEGORIES = ["Eletrônicos", "Periféricos", "Roupas", "Calçados", "Móveis", "Eletrodomésticos", "Livros", "Brinquedos", "Outros"];

// ─── Auth ─────────────────────────────────────────────────────────────────────
const USERS = [
  { id: "u1", username: "admin", password: "admin123", role: "admin", name: "Administrador" },
  { id: "u2", username: "vendedor", password: "venda123", role: "seller", name: "Carlos Mendes" },
];

// ─── Styles ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f2f5;color:#1a202c;font-size:14px}
  input,select,textarea{font-family:inherit;font-size:14px;border:1px solid #d1d5db;border-radius:8px;padding:8px 12px;width:100%;outline:none;transition:border-color .2s,box-shadow .2s;background:#fff;color:#1a202c}
  input:focus,select:focus,textarea:focus{border-color:#4f46e5;box-shadow:0 0 0 3px rgba(79,70,229,.15)}
  input[type=file]{padding:6px}
  button{font-family:inherit;cursor:pointer;border:none;border-radius:8px;font-size:13px;font-weight:600;padding:8px 16px;transition:all .15s}
  .btn-primary{background:#4f46e5;color:#fff}
  .btn-primary:hover{background:#4338ca}
  .btn-success{background:#16a34a;color:#fff}
  .btn-success:hover{background:#15803d}
  .btn-danger{background:#dc2626;color:#fff}
  .btn-danger:hover{background:#b91c1c}
  .btn-ghost{background:transparent;color:#4f46e5;border:1px solid #4f46e5}
  .btn-ghost:hover{background:#eef2ff}
  .btn-sm{padding:5px 10px;font-size:12px}
  .btn-icon{padding:6px 8px;background:transparent;color:#6b7280;border:1px solid #e5e7eb}
  .btn-icon:hover{background:#f3f4f6;color:#1a202c}
  label{display:block;margin-bottom:4px;font-weight:600;font-size:12px;color:#374151;text-transform:uppercase;letter-spacing:.04em}
  .card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:20px}
  .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;padding:10px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;background:#f9fafb;border-bottom:1px solid #e5e7eb}
  td{padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px;vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#fafafa}
  .stat-card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:20px}
  .stat-value{font-size:28px;font-weight:700;color:#1a202c;line-height:1}
  .stat-label{font-size:12px;color:#6b7280;margin-top:6px;font-weight:500}
  .sidebar{width:240px;background:#1e1b4b;min-height:100vh;flex-shrink:0;display:flex;flex-direction:column}
  .sidebar-logo{padding:20px 16px 8px;border-bottom:1px solid rgba(255,255,255,.08)}
  .sidebar-nav{flex:1;padding:12px 8px;overflow-y:auto}
  .nav-group{margin-bottom:16px}
  .nav-group-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.35);padding:0 10px;margin-bottom:4px}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;cursor:pointer;color:rgba(255,255,255,.7);font-size:13px;font-weight:500;transition:all .15s;border:none;background:none;width:100%;text-align:left}
  .nav-item:hover{background:rgba(255,255,255,.08);color:#fff}
  .nav-item.active{background:rgba(99,91,255,.35);color:#fff;font-weight:600}
  .nav-item svg,.nav-item i{font-size:16px;width:18px;flex-shrink:0}
  .topbar{background:#fff;border-bottom:1px solid #e5e7eb;padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between}
  .main{flex:1;overflow:hidden;display:flex;flex-direction:column}
  .content{flex:1;overflow-y:auto;padding:24px}
  .form-row{display:grid;gap:16px;margin-bottom:16px}
  .form-row.cols-2{grid-template-columns:1fr 1fr}
  .form-row.cols-3{grid-template-columns:1fr 1fr 1fr}
  .form-row.cols-4{grid-template-columns:1fr 1fr 1fr 1fr}
  .toast{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px}
  .toast-item{padding:12px 20px;border-radius:10px;color:#fff;font-weight:600;font-size:13px;box-shadow:0 4px 20px rgba(0,0,0,.15);animation:slideIn .3s ease}
  .toast-success{background:#16a34a}
  .toast-error{background:#dc2626}
  .toast-info{background:#4f46e5}
  @keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:none;opacity:1}}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px}
  .modal{background:#fff;border-radius:16px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}
  .modal-header{padding:20px 24px 16px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between}
  .modal-body{padding:20px 24px}
  .modal-footer{padding:16px 24px 20px;border-top:1px solid #e5e7eb;display:flex;gap:10px;justify-content:flex-end}
  .tabs{display:flex;gap:4px;background:#f3f4f6;border-radius:10px;padding:4px}
  .tab{padding:7px 16px;border-radius:7px;cursor:pointer;font-size:13px;font-weight:600;color:#6b7280;transition:all .15s;border:none;background:none}
  .tab.active{background:#fff;color:#1a202c;box-shadow:0 1px 4px rgba(0,0,0,.1)}
  .search-box{position:relative}
  .search-box input{padding-left:36px}
  .search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:16px}
  .img-thumb{width:40px;height:40px;border-radius:8px;object-fit:cover;background:#f3f4f6;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
  .product-img{width:100%;height:200px;object-fit:cover;border-radius:10px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;overflow:hidden}
  .empty{text-align:center;padding:48px 20px;color:#9ca3af}
  .empty-icon{font-size:48px;margin-bottom:12px;opacity:.4}
  .page-header{margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .page-title{font-size:22px;font-weight:700;color:#1a202c}
  .page-subtitle{font-size:13px;color:#6b7280;margin-top:2px}
  select option{color:#1a202c}
  @media(max-width:768px){
    .sidebar{width:60px}
    .sidebar-logo span,.nav-item span,.nav-group-label{display:none}
    .form-row.cols-2,.form-row.cols-3,.form-row.cols-4{grid-template-columns:1fr}
  }
`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, footer, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>{title}</h3>
          <button className="btn-icon" onClick={onClose} style={{ borderRadius: "50%", padding: "4px 8px" }}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span className="badge" style={{ background: STATUS_BG[status], color: STATUS_COLORS[status] }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Image Thumb ──────────────────────────────────────────────────────────────
function ImgThumb({ src, size = 40 }) {
  return (
    <div className="img-thumb" style={{ width: size, height: size }}>
      {src ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
        <span style={{ fontSize: 18, color: "#d1d5db" }}>📦</span>}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("admin123");
  const [err, setErr] = useState("");
  const submit = () => {
    const found = USERS.find(u => u.username === user && u.password === pass);
    if (found) onLogin(found);
    else setErr("Usuário ou senha inválidos.");
  };
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 36, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, background: "#eef2ff", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28 }}>🛍️</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a202c" }}>VendaFácil</h1>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Sistema de Controle de Vendas</p>
        </div>
        {err && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>{err}</div>}
        <div style={{ marginBottom: 14 }}>
          <label>Usuário</label>
          <input value={user} onChange={e => setUser(e.target.value)} placeholder="admin" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label>Senha</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="••••••••" />
        </div>
        <button className="btn-primary" style={{ width: "100%", padding: "11px", fontSize: 15 }} onClick={submit}>Entrar</button>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#9ca3af" }}>admin/admin123 · vendedor/venda123</p>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ products, sellers, sales }) {
  const todaySales = sales.filter(s => s.date === today());
  const totalRevenue = sales.reduce((a, s) => a + s.total, 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 3);
  const sellerRanking = sellers.map(s => ({
    ...s,
    count: sales.filter(v => v.sellerId === s.id).length,
    total: sales.filter(v => v.sellerId === s.id).reduce((a, v) => a + v.total, 0)
  })).sort((a, b) => b.total - a.total);

  const stats = [
    { label: "Total de Produtos", value: products.length, icon: "📦", color: "#eef2ff", tc: "#4f46e5" },
    { label: "Disponíveis", value: products.filter(p => p.status === "available").length, icon: "✅", color: "#dcfce7", tc: "#16a34a" },
    { label: "Vendidos", value: products.filter(p => p.status === "sold").length, icon: "🏷️", color: "#fee2e2", tc: "#dc2626" },
    { label: "Total Vendido", value: fmt(totalRevenue), icon: "💰", color: "#fefce8", tc: "#ca8a04" },
    { label: "Vendas Hoje", value: todaySales.length, icon: "📅", color: "#f0f9ff", tc: "#0284c7" },
    { label: "Estoque Baixo", value: lowStock.length, icon: "⚠️", color: "#fff7ed", tc: "#ea580c" },
  ];

  return (
    <div>
      <div className="page-header"><div><h2 className="page-title">Dashboard</h2><p className="page-subtitle">Visão geral do sistema</p></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.tc, fontSize: 24 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Ranking Vendedores */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🏆 Ranking de Vendedores</h3>
          {sellerRanking.filter(s => s.count > 0).length === 0 ? <p style={{ color: "#9ca3af", fontSize: 13 }}>Nenhuma venda registrada.</p> :
            sellerRanking.filter(s => s.count > 0).map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? "#fef3c7" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: i === 0 ? "#d97706" : "#6b7280" }}>#{i + 1}</div>
                <div style={{ flex: 1 }}><p style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</p><p style={{ color: "#6b7280", fontSize: 12 }}>{s.count} venda{s.count !== 1 ? "s" : ""}</p></div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#16a34a" }}>{fmt(s.total)}</div>
              </div>
            ))}
        </div>

        {/* Estoque Baixo */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>⚠️ Produtos com Estoque Baixo</h3>
          {lowStock.length === 0 ? <p style={{ color: "#9ca3af", fontSize: 13 }}>Nenhum produto com estoque crítico.</p> :
            lowStock.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <ImgThumb src={p.image} />
                <div style={{ flex: 1 }}><p style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</p><p style={{ color: "#6b7280", fontSize: 12 }}>{p.code}</p></div>
                <div style={{ background: "#fee2e2", color: "#dc2626", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>{p.stock} un.</div>
              </div>
            ))}
        </div>

        {/* Últimas Vendas */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>📋 Últimas Vendas</h3>
          {sales.length === 0 ? <p style={{ color: "#9ca3af", fontSize: 13 }}>Nenhuma venda registrada.</p> : (
            <table>
              <thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Vendedor</th><th>Total</th><th>Pagamento</th></tr></thead>
              <tbody>
                {[...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(v => {
                  const prod = products.find(p => p.id === v.productId);
                  const seller = sellers.find(s => s.id === v.sellerId);
                  return (
                    <tr key={v.id}>
                      <td>{fmtDate(v.date)}</td>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><ImgThumb src={prod?.image} size={30} />{prod?.name || "-"}</div></td>
                      <td>{v.customer}</td>
                      <td>{seller?.name || "-"}</td>
                      <td style={{ fontWeight: 700, color: "#16a34a" }}>{fmt(v.total)}</td>
                      <td><span className="badge" style={{ background: "#eef2ff", color: "#4f46e5" }}>{PAY_LABELS[v.payment] || v.payment}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT FORM ─────────────────────────────────────────────────────────────
function ProductForm({ initial, sellers, allCodes, onSave, onCancel }) {
  const [f, setF] = useState(initial || { code: "", name: "", desc: "", category: "", costPrice: "", salePrice: "", stock: "", status: "available", sellerId: "", image: "" });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const genCode = () => set("code", "PROD-" + String(Date.now()).slice(-5));
  const handleImg = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) { alert("Formato inválido. Use JPG, PNG ou WEBP."); return; }
    const r = new FileReader();
    r.onload = ev => set("image", ev.target.result);
    r.readAsDataURL(file);
  };
  const validate = () => {
    const e = {};
    if (!f.code.trim()) e.code = "Obrigatório";
    else if (allCodes.includes(f.code.trim()) && (!initial || initial.code !== f.code.trim())) e.code = "Código já existe";
    if (!f.name.trim()) e.name = "Obrigatório";
    if (!f.category) e.category = "Obrigatório";
    if (!f.costPrice || +f.costPrice <= 0) e.costPrice = "Deve ser maior que zero";
    if (!f.salePrice || +f.salePrice <= 0) e.salePrice = "Deve ser maior que zero";
    if (f.stock === "" || +f.stock < 0) e.stock = "Quantidade inválida";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submit = () => { if (validate()) onSave({ ...f, costPrice: +f.costPrice, salePrice: +f.salePrice, stock: +f.stock }); };

  return (
    <div>
      {/* Image */}
      <div style={{ marginBottom: 16 }}>
        <label>Foto do Produto</label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 80, height: 80, borderRadius: 10, background: "#f3f4f6", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {f.image ? <img src={f.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontSize: 32 }}>📦</span>}
          </div>
          <input type="file" accept="image/*" onChange={handleImg} style={{ flex: 1 }} />
        </div>
      </div>
      <div className="form-row cols-2">
        <div>
          <label>Código *</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={f.code} onChange={e => set("code", e.target.value)} placeholder="PROD-001" />
            <button className="btn-ghost btn-sm" onClick={genCode} style={{ whiteSpace: "nowrap" }}>Auto</button>
          </div>
          {errors.code && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.code}</p>}
        </div>
        <div>
          <label>Categoria *</label>
          <select value={f.category} onChange={e => set("category", e.target.value)}>
            <option value="">Selecione...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.category}</p>}
        </div>
      </div>
      <div className="form-row">
        <div>
          <label>Nome do Produto *</label>
          <input value={f.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Notebook Dell Inspiron" />
          {errors.name && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</p>}
        </div>
      </div>
      <div className="form-row">
        <div>
          <label>Descrição</label>
          <textarea value={f.desc} onChange={e => set("desc", e.target.value)} rows={2} placeholder="Detalhes do produto..." style={{ resize: "vertical" }} />
        </div>
      </div>
      <div className="form-row cols-3">
        <div>
          <label>Preço de Custo *</label>
          <input type="number" min="0" step="0.01" value={f.costPrice} onChange={e => set("costPrice", e.target.value)} placeholder="0,00" />
          {errors.costPrice && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.costPrice}</p>}
        </div>
        <div>
          <label>Preço de Venda *</label>
          <input type="number" min="0" step="0.01" value={f.salePrice} onChange={e => set("salePrice", e.target.value)} placeholder="0,00" />
          {errors.salePrice && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.salePrice}</p>}
        </div>
        <div>
          <label>Estoque *</label>
          <input type="number" min="0" value={f.stock} onChange={e => set("stock", e.target.value)} placeholder="0" />
          {errors.stock && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.stock}</p>}
        </div>
      </div>
      <div className="form-row cols-2">
        <div>
          <label>Status</label>
          <select value={f.status} onChange={e => set("status", e.target.value)}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label>Vendedor Responsável</label>
          <select value={f.sellerId} onChange={e => set("sellerId", e.target.value)}>
            <option value="">Nenhum</option>
            {sellers.filter(s => s.status === "active").map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn-primary" onClick={submit}>💾 Salvar Produto</button>
      </div>
    </div>
  );
}

// ─── PRODUCTS LIST ────────────────────────────────────────────────────────────
function Products({ products, sellers, onAdd, onEdit, onDelete, onView }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterSeller, setFilterSeller] = useState("");

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterCat && p.category !== filterCat) return false;
    if (filterSeller && p.sellerId !== filterSeller) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Produtos</h2><p className="page-subtitle">{products.length} produto(s) cadastrado(s)</p></div>
        <button className="btn-primary" onClick={onAdd}>+ Novo Produto</button>
      </div>
      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-row cols-4">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código ou nome..." />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Todas as categorias</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterSeller} onChange={e => setFilterSeller(e.target.value)}>
            <option value="">Todos os vendedores</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? <div className="empty"><div className="empty-icon">📦</div><p>Nenhum produto encontrado.</p></div> : (
          <table>
            <thead><tr><th>Foto</th><th>Código</th><th>Nome</th><th>Categoria</th><th>Preço Venda</th><th>Estoque</th><th>Status</th><th>Vendedor</th><th>Ações</th></tr></thead>
            <tbody>
              {filtered.map(p => {
                const seller = sellers.find(s => s.id === p.sellerId);
                return (
                  <tr key={p.id}>
                    <td><ImgThumb src={p.image} /></td>
                    <td style={{ fontFamily: "monospace", color: "#6b7280" }}>{p.code}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: 700, color: "#4f46e5" }}>{fmt(p.salePrice)}</td>
                    <td><span style={{ fontWeight: 700, color: p.stock === 0 ? "#dc2626" : p.stock <= 3 ? "#d97706" : "#16a34a" }}>{p.stock}</span></td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>{seller?.name || <span style={{ color: "#9ca3af" }}>—</span>}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn-icon btn-sm" onClick={() => onView(p)} title="Ver detalhes">👁</button>
                        <button className="btn-icon btn-sm" onClick={() => onEdit(p)} title="Editar">✏️</button>
                        <button className="btn-icon btn-sm" onClick={() => onDelete(p.id)} title="Excluir" style={{ color: "#dc2626" }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── PRODUCT DETAIL ───────────────────────────────────────────────────────────
function ProductDetail({ product, sellers, sales, onClose, onEdit }) {
  const seller = sellers.find(s => s.id === product.sellerId);
  const prodSales = sales.filter(s => s.productId === product.id);
  const margin = product.salePrice > 0 ? ((product.salePrice - product.costPrice) / product.salePrice * 100).toFixed(1) : 0;
  return (
    <Modal title="Detalhes do Produto" onClose={onClose} footer={<><button className="btn-ghost" onClick={onClose}>Fechar</button><button className="btn-primary" onClick={() => onEdit(product)}>✏️ Editar</button></>}>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div style={{ width: 120, height: 120, borderRadius: 12, background: "#f3f4f6", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {product.image ? <img src={product.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontSize: 48 }}>📦</span>}
        </div>
        <div>
          <StatusBadge status={product.status} />
          <h3 style={{ fontWeight: 700, fontSize: 18, marginTop: 6 }}>{product.name}</h3>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{product.desc}</p>
          <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 4, fontFamily: "monospace" }}>{product.code}</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[["Categoria", product.category], ["Preço de Custo", fmt(product.costPrice)], ["Preço de Venda", fmt(product.salePrice)], ["Margem", margin + "%"], ["Estoque", product.stock + " un."], ["Vendedor", seller?.name || "—"]].map(([l, v]) => (
          <div key={l} style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px" }}>
            <p style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{l}</p>
            <p style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{v}</p>
          </div>
        ))}
      </div>
      <h4 style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Histórico de Vendas ({prodSales.length})</h4>
      {prodSales.length === 0 ? <p style={{ color: "#9ca3af", fontSize: 13 }}>Sem vendas registradas.</p> : (
        <table>
          <thead><tr><th>Data</th><th>Cliente</th><th>Qtd</th><th>Total</th></tr></thead>
          <tbody>
            {prodSales.map(v => <tr key={v.id}><td>{fmtDate(v.date)}</td><td>{v.customer}</td><td>{v.qty}</td><td style={{ fontWeight: 700 }}>{fmt(v.total)}</td></tr>)}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

// ─── SELLERS LIST ─────────────────────────────────────────────────────────────
function SellerForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || { name: "", phone: "", email: "", cpf: "", status: "active", notes: "" });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Obrigatório";
    if (!f.phone.trim()) e.phone = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  return (
    <div>
      <div className="form-row cols-2">
        <div>
          <label>Nome Completo *</label>
          <input value={f.name} onChange={e => set("name", e.target.value)} />
          {errors.name && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.name}</p>}
        </div>
        <div>
          <label>Telefone *</label>
          <input value={f.phone} onChange={e => set("phone", e.target.value)} placeholder="(00) 00000-0000" />
          {errors.phone && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.phone}</p>}
        </div>
      </div>
      <div className="form-row cols-2">
        <div>
          <label>E-mail</label>
          <input type="email" value={f.email} onChange={e => set("email", e.target.value)} />
        </div>
        <div>
          <label>CPF / Documento</label>
          <input value={f.cpf} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" />
        </div>
      </div>
      <div className="form-row cols-2">
        <div>
          <label>Status</label>
          <select value={f.status} onChange={e => set("status", e.target.value)}>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div>
          <label>Observações</label>
          <textarea value={f.notes} onChange={e => set("notes", e.target.value)} rows={2} style={{ resize: "vertical" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn-primary" onClick={() => { if (validate()) onSave(f); }}>💾 Salvar Vendedor</button>
      </div>
    </div>
  );
}

function Sellers({ sellers, products, sales, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const filtered = sellers.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Vendedores</h2><p className="page-subtitle">{sellers.length} vendedor(es)</p></div>
        <button className="btn-primary" onClick={onAdd}>+ Novo Vendedor</button>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar vendedor..." />
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? <div className="empty"><div className="empty-icon">👤</div><p>Nenhum vendedor encontrado.</p></div> : (
          <table>
            <thead><tr><th>Nome</th><th>Telefone</th><th>E-mail</th><th>Produtos</th><th>Vendas</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {filtered.map(s => {
                const sellerProducts = products.filter(p => p.sellerId === s.id).length;
                const sellerSales = sales.filter(v => v.sellerId === s.id).length;
                return (
                  <tr key={s.id}>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#4f46e5" }}>{s.name.slice(0, 2).toUpperCase()}</div>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </div></td>
                    <td>{s.phone}</td>
                    <td style={{ color: "#4f46e5" }}>{s.email || "—"}</td>
                    <td><span className="badge" style={{ background: "#eef2ff", color: "#4f46e5" }}>{sellerProducts}</span></td>
                    <td><span className="badge" style={{ background: "#dcfce7", color: "#16a34a" }}>{sellerSales}</span></td>
                    <td><span className="badge" style={{ background: s.status === "active" ? "#dcfce7" : "#f3f4f6", color: s.status === "active" ? "#16a34a" : "#6b7280" }}>{s.status === "active" ? "Ativo" : "Inativo"}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn-icon btn-sm" onClick={() => onEdit(s)}>✏️</button>
                        <button className="btn-icon btn-sm" onClick={() => onDelete(s.id)} style={{ color: "#dc2626" }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── NEW SALE ─────────────────────────────────────────────────────────────────
function NewSale({ products, sellers, onSave, onCancel }) {
  const [f, setF] = useState({ productId: "", sellerId: "", customer: "", date: today(), qty: 1, unitPrice: "", discount: 0, payment: "pix" });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const selectedProduct = products.find(p => p.id === f.productId);
  useEffect(() => {
    if (selectedProduct) {
      set("unitPrice", selectedProduct.salePrice);
      if (selectedProduct.sellerId) set("sellerId", selectedProduct.sellerId);
    }
  }, [f.productId]);
  const total = Math.max(0, (Number(f.qty) * Number(f.unitPrice)) - Number(f.discount));
  const validate = () => {
    const e = {};
    if (!f.productId) e.productId = "Selecione um produto";
    if (!f.sellerId) e.sellerId = "Selecione um vendedor";
    if (!f.customer.trim()) e.customer = "Obrigatório";
    if (!f.date) e.date = "Obrigatório";
    if (!f.qty || +f.qty < 1) e.qty = "Mínimo 1";
    if (selectedProduct && +f.qty > selectedProduct.stock) e.qty = `Estoque insuficiente (${selectedProduct.stock} disponível)`;
    if (!f.unitPrice || +f.unitPrice <= 0) e.unitPrice = "Deve ser maior que zero";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  return (
    <div>
      <div className="page-header"><div><h2 className="page-title">Registrar Venda</h2></div></div>
      <div className="card" style={{ maxWidth: 700 }}>
        <div className="form-row cols-2">
          <div>
            <label>Produto *</label>
            <select value={f.productId} onChange={e => set("productId", e.target.value)}>
              <option value="">Selecione...</option>
              {products.filter(p => p.status !== "inactive").map(p => (
                <option key={p.id} value={p.id} disabled={p.stock === 0}>{p.code} — {p.name} ({p.stock} em estoque)</option>
              ))}
            </select>
            {errors.productId && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.productId}</p>}
            {selectedProduct && selectedProduct.stock === 0 && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 4, fontWeight: 600 }}>⛔ Estoque zerado. Venda não permitida.</p>}
          </div>
          <div>
            <label>Vendedor *</label>
            <select value={f.sellerId} onChange={e => set("sellerId", e.target.value)}>
              <option value="">Selecione...</option>
              {sellers.filter(s => s.status === "active").map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.sellerId && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.sellerId}</p>}
          </div>
        </div>
        <div className="form-row cols-2">
          <div>
            <label>Nome do Cliente *</label>
            <input value={f.customer} onChange={e => set("customer", e.target.value)} />
            {errors.customer && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.customer}</p>}
          </div>
          <div>
            <label>Data da Venda *</label>
            <input type="date" value={f.date} onChange={e => set("date", e.target.value)} />
          </div>
        </div>
        <div className="form-row cols-4">
          <div>
            <label>Quantidade *</label>
            <input type="number" min="1" value={f.qty} onChange={e => set("qty", e.target.value)} />
            {errors.qty && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.qty}</p>}
          </div>
          <div>
            <label>Preço Unitário *</label>
            <input type="number" min="0" step="0.01" value={f.unitPrice} onChange={e => set("unitPrice", e.target.value)} />
            {errors.unitPrice && <p style={{ color: "#dc2626", fontSize: 11, marginTop: 4 }}>{errors.unitPrice}</p>}
          </div>
          <div>
            <label>Desconto (R$)</label>
            <input type="number" min="0" step="0.01" value={f.discount} onChange={e => set("discount", e.target.value)} />
          </div>
          <div>
            <label>Forma de Pagamento</label>
            <select value={f.payment} onChange={e => set("payment", e.target.value)}>
              {Object.entries(PAY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div style={{ background: "#f0f9ff", borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, color: "#0369a1" }}>Valor Total da Venda:</span>
          <span style={{ fontWeight: 800, fontSize: 22, color: "#0369a1" }}>{fmt(total)}</span>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn-success" onClick={() => { if (validate()) onSave({ ...f, total, qty: +f.qty, unitPrice: +f.unitPrice, discount: +f.discount }); }}>✅ Confirmar Venda</button>
        </div>
      </div>
    </div>
  );
}

// ─── SALES HISTORY ────────────────────────────────────────────────────────────
function SalesHistory({ sales, products, sellers, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterSeller, setFilterSeller] = useState("");
  const [filterPay, setFilterPay] = useState("");
  const filtered = sales.filter(v => {
    const prod = products.find(p => p.id === v.productId);
    const q = search.toLowerCase();
    if (q && !prod?.name.toLowerCase().includes(q) && !prod?.code.toLowerCase().includes(q) && !v.customer.toLowerCase().includes(q)) return false;
    if (filterDate && v.date !== filterDate) return false;
    if (filterSeller && v.sellerId !== filterSeller) return false;
    if (filterPay && v.payment !== filterPay) return false;
    return true;
  });
  const total = filtered.reduce((a, v) => a + v.total, 0);
  return (
    <div>
      <div className="page-header">
        <div><h2 className="page-title">Histórico de Vendas</h2><p className="page-subtitle">{filtered.length} venda(s) · Total: {fmt(total)}</p></div>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-row cols-4">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Produto ou cliente..." />
          </div>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <select value={filterSeller} onChange={e => setFilterSeller(e.target.value)}>
            <option value="">Todos os vendedores</option>
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterPay} onChange={e => setFilterPay(e.target.value)}>
            <option value="">Todas as formas</option>
            {Object.entries(PAY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? <div className="empty"><div className="empty-icon">📋</div><p>Nenhuma venda encontrada.</p></div> : (
          <table>
            <thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Vendedor</th><th>Qtd</th><th>Desconto</th><th>Total</th><th>Pagamento</th><th>Ação</th></tr></thead>
            <tbody>
              {[...filtered].sort((a, b) => b.date.localeCompare(a.date)).map(v => {
                const prod = products.find(p => p.id === v.productId);
                const seller = sellers.find(s => s.id === v.sellerId);
                return (
                  <tr key={v.id}>
                    <td>{fmtDate(v.date)}</td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><ImgThumb src={prod?.image} size={30} /><div><p style={{ fontWeight: 600, fontSize: 12 }}>{prod?.name || "—"}</p><p style={{ color: "#9ca3af", fontSize: 11 }}>{prod?.code}</p></div></div></td>
                    <td>{v.customer}</td>
                    <td>{seller?.name || "—"}</td>
                    <td>{v.qty}</td>
                    <td style={{ color: v.discount > 0 ? "#dc2626" : "#9ca3af" }}>{v.discount > 0 ? `-${fmt(v.discount)}` : "—"}</td>
                    <td style={{ fontWeight: 700, color: "#16a34a" }}>{fmt(v.total)}</td>
                    <td><span className="badge" style={{ background: "#eef2ff", color: "#4f46e5" }}>{PAY_LABELS[v.payment] || v.payment}</span></td>
                    <td><button className="btn-icon btn-sm" onClick={() => onDelete(v.id)} style={{ color: "#dc2626" }}>🗑</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function Reports({ products, sellers, sales }) {
  const [tab, setTab] = useState("period");
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);
  const [to, setTo] = useState(today());
  const [filterSeller, setFilterSeller] = useState("");

  const filtered = sales.filter(v => {
    if (v.date < from || v.date > to) return false;
    if (filterSeller && v.sellerId !== filterSeller) return false;
    return true;
  });
  const totalRevenue = filtered.reduce((a, v) => a + v.total, 0);
  const totalQty = filtered.reduce((a, v) => a + v.qty, 0);
  const avgTicket = filtered.length > 0 ? totalRevenue / filtered.length : 0;

  // Best products
  const productRank = products.map(p => {
    const pvSales = filtered.filter(v => v.productId === p.id);
    return { ...p, count: pvSales.reduce((a, v) => a + v.qty, 0), revenue: pvSales.reduce((a, v) => a + v.total, 0) };
  }).sort((a, b) => b.revenue - a.revenue).filter(p => p.count > 0);

  // Seller performance
  const sellerPerf = sellers.map(s => {
    const svSales = filtered.filter(v => v.sellerId === s.id);
    return { ...s, count: svSales.length, revenue: svSales.reduce((a, v) => a + v.total, 0) };
  }).sort((a, b) => b.revenue - a.revenue);

  const exportCSV = (data, filename) => {
    const rows = [Object.keys(data[0])];
    data.forEach(row => rows.push(Object.values(row)));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = filename + ".csv";
    a.click();
  };

  return (
    <div>
      <div className="page-header"><div><h2 className="page-title">Relatórios</h2></div></div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="form-row cols-4">
          <div><label>De</label><input type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div><label>Até</label><input type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
          <div><label>Vendedor</label>
            <select value={filterSeller} onChange={e => setFilterSeller(e.target.value)}>
              <option value="">Todos</option>
              {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
        {[["Total Vendido", fmt(totalRevenue), "💰"], ["Qtd. Itens", totalQty, "📦"], ["Ticket Médio", fmt(avgTicket), "🎫"]].map(([l, v, i]) => (
          <div key={l} className="stat-card"><div style={{ fontSize: 24 }}>{i}</div><div className="stat-value" style={{ fontSize: 22, marginTop: 8 }}>{v}</div><div className="stat-label">{l}</div></div>
        ))}
      </div>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[["period", "Por Período"], ["sellers", "Por Vendedor"], ["products", "Produtos Mais Vendidos"], ["stock", "Estoque"]].map(([k, v]) => (
          <button key={k} className={`tab${tab === k ? " active" : ""}`} onClick={() => setTab(k)}>{v}</button>
        ))}
      </div>

      {tab === "period" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ fontWeight: 700, fontSize: 14 }}>Vendas no Período ({filtered.length})</h3>
            <button className="btn-ghost btn-sm" onClick={() => exportCSV(filtered.map(v => ({ data: v.date, cliente: v.customer, total: v.total })), "vendas")}>⬇ Exportar CSV</button>
          </div>
          {filtered.length === 0 ? <div className="empty"><p>Nenhuma venda no período.</p></div> : (
            <table>
              <thead><tr><th>Data</th><th>Produto</th><th>Cliente</th><th>Vendedor</th><th>Total</th><th>Pagamento</th></tr></thead>
              <tbody>
                {[...filtered].sort((a, b) => b.date.localeCompare(a.date)).map(v => {
                  const prod = products.find(p => p.id === v.productId);
                  const seller = sellers.find(s => s.id === v.sellerId);
                  return <tr key={v.id}><td>{fmtDate(v.date)}</td><td>{prod?.name}</td><td>{v.customer}</td><td>{seller?.name}</td><td style={{ fontWeight: 700 }}>{fmt(v.total)}</td><td>{PAY_LABELS[v.payment]}</td></tr>;
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
      {tab === "sellers" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead><tr><th>Vendedor</th><th>Status</th><th>Nº Vendas</th><th>Total Vendido</th></tr></thead>
            <tbody>
              {sellerPerf.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td><span className="badge" style={{ background: s.status === "active" ? "#dcfce7" : "#f3f4f6", color: s.status === "active" ? "#16a34a" : "#6b7280" }}>{s.status === "active" ? "Ativo" : "Inativo"}</span></td>
                  <td>{s.count}</td>
                  <td style={{ fontWeight: 700, color: "#16a34a" }}>{fmt(s.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "products" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead><tr><th>#</th><th>Produto</th><th>Categoria</th><th>Qtd Vendida</th><th>Receita</th></tr></thead>
            <tbody>
              {productRank.length === 0 ? <tr><td colSpan={5}><div className="empty"><p>Nenhum produto vendido no período.</p></div></td></tr> :
                productRank.map((p, i) => (
                  <tr key={p.id}><td style={{ fontWeight: 700, color: "#4f46e5" }}>#{i + 1}</td><td style={{ fontWeight: 600 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><ImgThumb src={p.image} size={28} />{p.name}</div></td><td>{p.category}</td><td>{p.count}</td><td style={{ fontWeight: 700, color: "#16a34a" }}>{fmt(p.revenue)}</td></tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "stock" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table>
            <thead><tr><th>Produto</th><th>Código</th><th>Categoria</th><th>Estoque</th><th>Status</th><th>Valor em Estoque</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><ImgThumb src={p.image} size={28} />{p.name}</div></td>
                  <td style={{ fontFamily: "monospace", color: "#6b7280" }}>{p.code}</td>
                  <td>{p.category}</td>
                  <td><span style={{ fontWeight: 700, color: p.stock === 0 ? "#dc2626" : p.stock <= 3 ? "#d97706" : "#16a34a" }}>{p.stock}</span></td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ fontWeight: 700 }}>{fmt(p.stock * p.salePrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function Settings({ user, onLogout }) {
  return (
    <div>
      <div className="page-header"><h2 className="page-title">Configurações</h2></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>👤 Minha Conta</h3>
          <div style={{ marginBottom: 12 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: "#4f46e5", marginBottom: 12 }}>{user.name.slice(0, 2).toUpperCase()}</div>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</p>
            <p style={{ color: "#6b7280", fontSize: 13 }}>@{user.username} · {user.role === "admin" ? "Administrador" : "Vendedor"}</p>
          </div>
          <button className="btn-danger" style={{ marginTop: 12 }} onClick={onLogout}>🚪 Sair do Sistema</button>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>ℹ️ Sobre o Sistema</h3>
          <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6 }}>VendaFácil v1.0 — Sistema de controle de produtos, vendedores e vendas.</p>
          <div style={{ marginTop: 16 }}>
            {[["Usuários do sistema", USERS.length], ["Perfis disponíveis", "Admin, Vendedor"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}>
                <span style={{ color: "#6b7280" }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [sellers, setSellers] = useState(SEED_SELLERS);
  const [sales, setSales] = useState(SEED_SALES);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null); // { type, data }
  const [detailProduct, setDetailProduct] = useState(null);

  const toast = useCallback((msg, type = "success") => {
    const id = uid();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const isAdmin = user?.role === "admin";

  // Products CRUD
  const addProduct = (data) => {
    const np = { ...data, id: "p" + uid(), createdAt: today() };
    setProducts(p => [...p, np]);
    setModal(null);
    toast("Produto cadastrado com sucesso!");
  };
  const editProduct = (data) => {
    setProducts(p => p.map(x => x.id === data.id ? { ...x, ...data } : x));
    setModal(null);
    setDetailProduct(null);
    toast("Produto atualizado!");
  };
  const deleteProduct = (id) => {
    if (!window.confirm("Excluir este produto?")) return;
    setProducts(p => p.filter(x => x.id !== id));
    toast("Produto excluído.", "info");
  };

  // Sellers CRUD
  const addSeller = (data) => {
    setSellers(p => [...p, { ...data, id: "s" + uid(), createdAt: today() }]);
    setModal(null);
    toast("Vendedor cadastrado!");
  };
  const editSeller = (data) => {
    setSellers(p => p.map(x => x.id === data.id ? { ...x, ...data } : x));
    setModal(null);
    toast("Vendedor atualizado!");
  };
  const deleteSeller = (id) => {
    if (!window.confirm("Excluir este vendedor?")) return;
    setSellers(p => p.filter(x => x.id !== id));
    toast("Vendedor excluído.", "info");
  };

  // Sales
  const addSale = (data) => {
    const ns = { ...data, id: "v" + uid(), createdAt: today() };
    setSales(p => [...p, ns]);
    setProducts(p => p.map(prod => {
      if (prod.id === data.productId) {
        const newStock = prod.stock - data.qty;
        return { ...prod, stock: newStock, status: newStock === 0 ? "sold" : prod.status };
      }
      return prod;
    }));
    setPage("sales");
    toast("🎉 Venda registrada com sucesso!");
  };
  const deleteSale = (id) => {
    if (!window.confirm("Excluir esta venda? O estoque será restaurado.")) return;
    const sale = sales.find(s => s.id === id);
    if (sale) {
      setProducts(p => p.map(prod => {
        if (prod.id === sale.productId) return { ...prod, stock: prod.stock + sale.qty, status: prod.status === "sold" ? "available" : prod.status };
        return prod;
      }));
    }
    setSales(p => p.filter(s => s.id !== id));
    toast("Venda excluída e estoque restaurado.", "info");
  };

  const allCodes = products.map(p => p.code);

  const navGroups = [
    { label: "Principal", items: [{ id: "dashboard", icon: "🏠", label: "Dashboard" }] },
    { label: "Catálogo", items: [{ id: "products", icon: "📦", label: "Produtos" }, { id: "sellers", icon: "👥", label: "Vendedores" }] },
    { label: "Vendas", items: [{ id: "newSale", icon: "💳", label: "Nova Venda" }, { id: "sales", icon: "📋", label: "Histórico" }] },
    { label: "Análises", items: [{ id: "reports", icon: "📊", label: "Relatórios" }] },
    { label: "Sistema", items: [{ id: "settings", icon: "⚙️", label: "Configurações" }] },
  ];

  if (!user) return (
    <>
      <style>{css}</style>
      <Login onLogin={u => { setUser(u); }} />
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-logo">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "rgba(99,91,255,.3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🛍️</div>
              <div>
                <p style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>VendaFácil</p>
                <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>v1.0</p>
              </div>
            </div>
          </div>
          <div className="sidebar-nav">
            {navGroups.map(g => (
              <div key={g.label} className="nav-group">
                <div className="nav-group-label">{g.label}</div>
                {g.items.map(item => {
                  if (!isAdmin && ["reports"].includes(item.id)) return null;
                  return (
                    <button key={item.id} className={`nav-item${page === item.id ? " active" : ""}`} onClick={() => setPage(item.id)}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(99,91,255,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#fff", flexShrink: 0 }}>{user.name.slice(0, 2).toUpperCase()}</div>
              <div style={{ overflow: "hidden" }}>
                <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
                <p style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>{user.role === "admin" ? "Admin" : "Vendedor"}</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>
              {navGroups.flatMap(g => g.items).find(i => i.id === page)?.label || ""}
            </h2>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</span>
              <button className="btn-ghost btn-sm" onClick={() => setUser(null)}>Sair</button>
            </div>
          </div>
          <div className="content">
            {page === "dashboard" && <Dashboard products={products} sellers={sellers} sales={sales} />}
            {page === "products" && (
              <Products
                products={products} sellers={sellers}
                onAdd={() => setModal({ type: "addProduct" })}
                onEdit={p => setModal({ type: "editProduct", data: p })}
                onDelete={deleteProduct}
                onView={p => setDetailProduct(p)}
              />
            )}
            {page === "sellers" && (
              <Sellers
                sellers={sellers} products={products} sales={sales}
                onAdd={() => setModal({ type: "addSeller" })}
                onEdit={s => setModal({ type: "editSeller", data: s })}
                onDelete={deleteSeller}
              />
            )}
            {page === "newSale" && <NewSale products={products} sellers={sellers} onSave={addSale} onCancel={() => setPage("dashboard")} />}
            {page === "sales" && <SalesHistory sales={sales} products={products} sellers={sellers} onDelete={deleteSale} />}
            {page === "reports" && isAdmin && <Reports products={products} sellers={sellers} sales={sales} />}
            {page === "settings" && <Settings user={user} onLogout={() => setUser(null)} />}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "addProduct" && (
        <Modal title="Novo Produto" onClose={() => setModal(null)}>
          <ProductForm sellers={sellers} allCodes={allCodes} onSave={addProduct} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "editProduct" && (
        <Modal title="Editar Produto" onClose={() => setModal(null)}>
          <ProductForm initial={modal.data} sellers={sellers} allCodes={allCodes} onSave={d => editProduct({ ...modal.data, ...d })} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "addSeller" && (
        <Modal title="Novo Vendedor" onClose={() => setModal(null)}>
          <SellerForm onSave={addSeller} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === "editSeller" && (
        <Modal title="Editar Vendedor" onClose={() => setModal(null)}>
          <SellerForm initial={modal.data} onSave={d => editSeller({ ...modal.data, ...d })} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {/* Product detail */}
      {detailProduct && (
        <ProductDetail
          product={detailProduct} sellers={sellers} sales={sales}
          onClose={() => setDetailProduct(null)}
          onEdit={p => { setDetailProduct(null); setModal({ type: "editProduct", data: p }); }}
        />
      )}

      <Toast toasts={toasts} />
    </>
  );
}
