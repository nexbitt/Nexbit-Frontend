/**
 * @file Reportes.jsx
 * @description Panel de reportes para el administrador de Nexbit.
 * Muestra 5 tarjetas de reporte. Al hacer click en cada una se abre
 * un modal con la tabla detallada y gráfico correspondiente.
 *
 * INTEGRACIÓN:
 * 1. Copiar este archivo a frontend/src/pages/Reportes.jsx
 * 2. En App.jsx importar y agregar la ruta:
 *    import Reportes from './pages/Reportes';
 *    <Route path="reportes" element={<Reportes />} />
 * 3. En AdminSidebar.jsx agregar al grupo "Tienda":
 *    { to: '/admin/reportes', Icon: BarChart2, label: 'Reportes' }
 *    (importar BarChart2 desde 'lucide-react')
 *
 * BACKEND REQUERIDO — agregar estas rutas al backend:
 *   GET /api/reportes/ventas        → Query 1 (facturación detallada)
 *   GET /api/reportes/inventario    → Query 2 (stock y ganancias)
 *   GET /api/reportes/seguridad     → Query 3 (usuarios y roles)
 *   GET /api/reportes/carritos      → Query 4 (carritos activos)
 *   GET /api/reportes/repartidores  → Query 5 (pedidos por repartidor)
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import {
  BarChart2, Package, ShieldCheck, ShoppingCart,
  Truck, X, TrendingUp, AlertTriangle, CheckCircle,
  RefreshCw, ChevronRight, Users, Receipt
} from 'lucide-react';

const API = '/api/v1/reportes';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n ?? 0).toLocaleString('es-CO');
const fmtCOP = (n) => '$' + fmt(n);
const pct = (n) => Number(n ?? 0).toFixed(1) + '%';

// ── Badge de estado genérico ──────────────────────────────────────────────────
const Badge = ({ text }) => {
  const colors = {
    AGOTADO:           { bg: '#fef2f2', color: '#b91c1c' },
    'STOCK BAJO':      { bg: '#fff7ed', color: '#c2410c' },
    OK:                { bg: '#f0fdf4', color: '#166534' },
    'SIN STOCK':       { bg: '#fef2f2', color: '#b91c1c' },
    'STOCK INSUFICIENTE': { bg: '#fff7ed', color: '#c2410c' },
    DISPONIBLE:        { bg: '#f0fdf4', color: '#166534' },
    ACTIVO:            { bg: '#f0fdf4', color: '#166534' },
    INACTIVO:          { bg: '#f3f4f6', color: '#6b7280' },
    PENDIENTE:         { bg: '#fef9c3', color: '#854d0e' },
    'A TIEMPO':        { bg: '#f0fdf4', color: '#166534' },
    TARDE:             { bg: '#fef2f2', color: '#b91c1c' },
    EMITIDA:           { bg: '#eff6ff', color: '#1e40af' },
    PAGADA:            { bg: '#f0fdf4', color: '#166534' },
    ANULADA:           { bg: '#fef2f2', color: '#b91c1c' },
  };
  const style = colors[text] || { bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '2px 8px', borderRadius: '9999px',
      fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap'
    }}>
      {text}
    </span>
  );
};

// ── Tabla genérica reutilizable ───────────────────────────────────────────────
const DataTable = ({ columns, rows, badgeCols = [] }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
          {columns.map(c => (
            <th key={c.key} style={{
              padding: '10px 12px', textAlign: 'left',
              fontWeight: 600, color: '#374151',
              whiteSpace: 'nowrap', fontSize: '0.75rem',
              textTransform: 'uppercase', letterSpacing: '0.04em'
            }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Sin datos disponibles</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'transparent' : '#fafafa' }}>
            {columns.map(c => (
              <td key={c.key} style={{ padding: '9px 12px', color: '#111827', whiteSpace: c.wrap ? 'normal' : 'nowrap' }}>
                {badgeCols.includes(c.key) ? <Badge text={row[c.key]} /> : (row[c.key] ?? '—')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Mini barra horizontal para gráficos inline ────────────────────────────────
const MiniBar = ({ value, max, color = '#111111', label, sublabel }) => (
  <div style={{ marginBottom: '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
      <span style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{sublabel}</span>
    </div>
    <div style={{ background: '#e5e7eb', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(100, (value / max) * 100)}%`,
        background: color, height: '100%', borderRadius: '4px',
        transition: 'width 0.5s ease'
      }} />
    </div>
  </div>
);

// ── Indicador KPI para la tarjeta resumen ─────────────────────────────────────
const KpiChip = ({ label, value, color = '#111111' }) => (
  <div style={{
    background: '#f9fafb', border: '1px solid #e5e7eb',
    borderRadius: '10px', padding: '10px 14px', textAlign: 'center'
  }}>
    <div style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{value}</div>
    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>{label}</div>
  </div>
);

// ── Modal genérico ────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, icon: Icon, accentColor, children }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', padding: '40px 16px',
        overflowY: 'auto'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px',
          width: '100%', maxWidth: '1000px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: accentColor, color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon size={20} />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{title}</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#fff', display: 'flex' }}
          >
            <X size={18} />
          </button>
        </div>
        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform: scale(0.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
};

// ── Tarjeta de reporte en el dashboard ────────────────────────────────────────
const ReportCard = ({ icon: Icon, title, desc, accentColor, kpis, onClick, loading }) => (
  <button
    onClick={onClick}
    style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: '14px', padding: '0',
      cursor: 'pointer', textAlign: 'left', width: '100%',
      transition: 'all 0.2s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      overflow: 'hidden'
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    {/* Accent top bar */}
    <div style={{ height: '4px', background: accentColor }} />
    <div style={{ padding: '18px 20px' }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: accentColor + '18', borderRadius: '8px', padding: '7px', display: 'flex' }}>
            <Icon size={18} style={{ color: accentColor }} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827' }}>{title}</span>
        </div>
        <ChevronRight size={16} style={{ color: '#9ca3af' }} />
      </div>
      <p style={{ margin: '0 0 14px', fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.4 }}>{desc}</p>

      {/* KPI chips */}
      {loading ? (
        <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>Cargando datos...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: '8px' }}>
          {kpis.map(k => <KpiChip key={k.label} {...k} color={accentColor} />)}
        </div>
      )}
    </div>
  </button>
);

// ══════════════════════════════════════════════════════════════════════════════
//  MODALES DE DETALLE — uno por reporte
// ══════════════════════════════════════════════════════════════════════════════

const VentasModal = ({ open, onClose, data, kpis }) => {
  const totalFacturas = kpis?.total_tickets || data.length;
  const totalIngresos = kpis?.total_ingresos || 0;
  const porProducto = (kpis?.top_productos || []).map(p => [p.producto, p.total_uds]);
  const maxCant = Math.max(...porProducto.map(([, v]) => v), 1);

  const cols = [
    { key: 'Factura_No', label: 'Ticket' },
    { key: 'Fecha_Venta', label: 'Fecha' },
    { key: 'Cliente', label: 'Cliente' },
    { key: 'Producto', label: 'Producto' },
    { key: 'Categoria', label: 'Categoría' },
    { key: 'Cant', label: 'Cant.' },
    { key: 'Precio_Venta_COP', label: 'Precio Unit.' },
    { key: 'Total_Factura', label: 'Total Ticket' },
    { key: 'Estado_Pago', label: 'Estado' },
    { key: 'Repartidor', label: 'Repartidor' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Ventas y Detalle de Compras" icon={Receipt} accentColor="#111827">
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        <KpiChip label="Total tickets" value={totalFacturas} color="#111827" />
        <KpiChip label="Ingresos totales" value={fmtCOP(totalIngresos)} color="#111827" />
        <KpiChip label="Ticket promedio" value={totalFacturas ? fmtCOP(totalIngresos / totalFacturas) : '$0'} color="#111827" />
      </div>

      {/* Ranking productos */}
      {porProducto.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Top productos por unidades vendidas</h3>
          {porProducto.map(([prod, cant]) => (
            <MiniBar key={prod} label={prod} sublabel={`${cant} uds`} value={cant} max={maxCant} color="#111827" />
          ))}
        </div>
      )}

      <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Detalle completo</h3>
      <DataTable columns={cols} rows={data} badgeCols={['Estado_Pago']} />
    </Modal>
  );
};

const InventarioModal = ({ open, onClose, data, kpis }) => {
  const agotados  = kpis?.agotados || 0;
  const bajos     = kpis?.stock_bajo || 0;
  const ok        = kpis?.ok || 0;
  const valorTotal = kpis?.valor_total_costo || 0;
  const ganPotencial = kpis?.ganancia_potencial || 0;

  const topMargen = (kpis?.top_margen || []).map(r => ({ Producto: r.producto, Margen_Pct: r.margen_pct }));
  const maxMargen = Math.max(...topMargen.map(r => Number(r.Margen_Pct)), 1);

  const cols = [
    { key: 'Producto', label: 'Producto' },
    { key: 'Categoria', label: 'Categoría' },
    { key: 'Proveedor', label: 'Proveedor' },
    { key: 'Stock_Disponible', label: 'Stock' },
    { key: 'Alerta_Stock', label: 'Estado' },
    { key: 'Costo_Unit_COP', label: 'Costo' },
    { key: 'PVP_COP', label: 'PVP' },
    { key: 'Margen_Pct', label: 'Margen %' },
    { key: 'Ganancia_Potencial', label: 'Ganancia Potencial' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Inventario, Stock y Ganancias" icon={Package} accentColor="#059669">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        <KpiChip label="Agotados" value={agotados} color="#dc2626" />
        <KpiChip label="Stock bajo" value={bajos} color="#d97706" />
        <KpiChip label="En stock OK" value={ok} color="#059669" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <KpiChip label="Valor inventario (costo)" value={fmtCOP(valorTotal)} color="#059669" />
        <KpiChip label="Ganancia potencial" value={fmtCOP(ganPotencial)} color="#059669" />
      </div>

      {topMargen.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Top productos por margen de ganancia</h3>
          {topMargen.map(r => (
            <MiniBar key={r.Producto} label={r.Producto} sublabel={pct(r.Margen_Pct)} value={Number(r.Margen_Pct)} max={maxMargen} color="#059669" />
          ))}
        </div>
      )}

      <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Detalle completo</h3>
      <DataTable columns={cols} rows={data} badgeCols={['Alerta_Stock']} />
    </Modal>
  );
};

const SeguridadModal = ({ open, onClose, data, kpis }) => {
  const activos  = kpis?.activos || 0;
  const inactivos = kpis?.inactivos || 0;
  const porRol   = (kpis?.por_rol || []).map(r => [r.rol, r.cantidad]);
  const maxRol   = Math.max(...porRol.map(([, v]) => v), 1);

  const cols = [
    { key: 'ID_User', label: 'ID' },
    { key: 'Nombre_Usuario', label: 'Nombre' },
    { key: 'Email_Login', label: 'Email' },
    { key: 'Telefono', label: 'Teléfono' },
    { key: 'Rol', label: 'Rol' },
    { key: 'Estado_Cuenta', label: 'Estado' },
    { key: 'Fecha_Registro', label: 'Registro' },
    { key: 'Ultima_Modificacion', label: 'Últ. modificación' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Seguridad, Roles y Accesos" icon={ShieldCheck} accentColor="#7c3aed">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        <KpiChip label="Total usuarios" value={data.length} color="#7c3aed" />
        <KpiChip label="Activos" value={activos} color="#059669" />
        <KpiChip label="Inactivos" value={inactivos} color="#6b7280" />
      </div>

      {porRol.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Usuarios por rol</h3>
          {porRol.map(([rol, cant]) => (
            <MiniBar key={rol} label={rol} sublabel={`${cant} usuario${cant > 1 ? 's' : ''}`} value={cant} max={maxRol} color="#7c3aed" />
          ))}
        </div>
      )}

      <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Detalle completo</h3>
      <DataTable columns={cols} rows={data} badgeCols={['Estado_Cuenta']} />
    </Modal>
  );
};

const CarritosModal = ({ open, onClose, data, kpis }) => {
  const totalProyectado = kpis?.valor_potencial || data.reduce((s, r) => s + Number(r.Total_Proyectado || 0), 0);
  const sinStock = kpis?.con_problema_stock || data.filter(r => r.Disponibilidad === 'SIN STOCK' || r.Disponibilidad === 'STOCK INSUFICIENTE').length;

  const cols = [
    { key: 'Usuario', label: 'Usuario' },
    { key: 'Producto', label: 'Producto' },
    { key: 'Cant_En_Carrito', label: 'Cant.' },
    { key: 'Precio_Actual', label: 'Precio' },
    { key: 'Total_Proyectado', label: 'Total proyectado' },
    { key: 'Disponibilidad', label: 'Disponibilidad' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Carritos Activos" icon={ShoppingCart} accentColor="#0284c7">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        <KpiChip label="Ítems en carritos" value={data.length} color="#0284c7" />
        <KpiChip label="Valor potencial" value={fmtCOP(totalProyectado)} color="#0284c7" />
        <KpiChip label="Con problema de stock" value={sinStock} color="#dc2626" />
      </div>
      <DataTable columns={cols} rows={data} badgeCols={['Disponibilidad']} />
    </Modal>
  );
};

const RepartidoresModal = ({ open, onClose, data, kpis }) => {
  const aTiempo  = kpis?.a_tiempo || 0;
  const tarde    = kpis?.con_retraso || 0;
  const totalPed = kpis?.total_pedidos || data.filter(r => r.ID_Pedido).length;
  const porRep   = (kpis?.por_repartidor || []).map(r => [r.repartidor, r.cantidad]);
  const maxRep = Math.max(...porRep.map(([, v]) => v), 1);

  const cols = [
    { key: 'Repartidor', label: 'Repartidor' },
    { key: 'Telefono', label: 'Teléfono' },
    { key: 'ID_Pedido', label: '# Pedido' },
    { key: 'Cliente', label: 'Cliente' },
    { key: 'Estado_Pedido', label: 'Estado' },
    { key: 'Entrega_Estimada', label: 'Entrega estimada' },
    { key: 'Entrega_Real', label: 'Entrega real' },
    { key: 'Cumplimiento', label: 'Cumplimiento' },
    { key: 'Total_Pedido', label: 'Total' },
    { key: 'Productos', label: 'Productos', wrap: true },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Repartidores y Pedidos" icon={Truck} accentColor="#b45309">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        <KpiChip label="Pedidos asignados" value={totalPed} color="#b45309" />
        <KpiChip label="Entregados a tiempo" value={aTiempo} color="#059669" />
        <KpiChip label="Con retraso" value={tarde} color="#dc2626" />
      </div>

      {porRep.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Pedidos por repartidor</h3>
          {porRep.map(([rep, cant]) => (
            <MiniBar key={rep} label={rep} sublabel={`${cant} pedido${cant > 1 ? 's' : ''}`} value={cant} max={maxRep} color="#b45309" />
          ))}
        </div>
      )}

      <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Detalle completo</h3>
      <DataTable columns={cols} rows={data} badgeCols={['Estado_Pedido', 'Cumplimiento']} />
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

const REPORTES_CONFIG = [
  {
    id: 'ventas',
    title: 'Ventas y Comprobantes',
    desc: 'Comprobantes emitidos, clientes, productos vendidos y estado de pago.',
    icon: Receipt,
    accentColor: '#111827',
    endpoint: `${API}/ventas`,
  },
  {
    id: 'inventario',
    title: 'Inventario y Ganancias',
    desc: 'Stock disponible, alertas, márgenes y valor del almacén.',
    icon: Package,
    accentColor: '#059669',
    endpoint: `${API}/inventario`,
  },
  {
    id: 'seguridad',
    title: 'Seguridad y Accesos',
    desc: 'Auditoría de usuarios, roles asignados y estados de cuenta.',
    icon: ShieldCheck,
    accentColor: '#7c3aed',
    endpoint: `${API}/seguridad`,
  },
  {
    id: 'carritos',
    title: 'Carritos Activos',
    desc: 'Demanda no convertida: qué tienen los clientes en el carrito.',
    icon: ShoppingCart,
    accentColor: '#0284c7',
    endpoint: `${API}/carritos`,
  },
  {
    id: 'repartidores',
    title: 'Repartidores y Logística',
    desc: 'Pedidos asignados, cumplimiento de entregas y tiempos.',
    icon: Truck,
    accentColor: '#b45309',
    endpoint: `${API}/repartidores`,
  },
];

const Reportes = () => {
  const [data,    setData]    = useState({});
  const [kpis,    setKpis]    = useState({});
  const [loading, setLoading] = useState({});
  const [modal,   setModal]   = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAll = useCallback(async () => {
    const newLoading = {};
    REPORTES_CONFIG.forEach(r => { newLoading[r.id] = true; });
    setLoading(newLoading);

    const [dataResults, kpiResults] = await Promise.all([
      Promise.allSettled(
        REPORTES_CONFIG.map(r => api.get(r.endpoint).then(res => ({ id: r.id, rows: res.data })))
      ),
      Promise.allSettled(
        REPORTES_CONFIG.map(r => api.get(`${r.endpoint}/kpis`).then(res => ({ id: r.id, kpis: res.data })))
      ),
    ]);

    const newData = {};
    dataResults.forEach(result => {
      if (result.status === 'fulfilled') {
        newData[result.value.id] = result.value.rows;
      } else {
        const idx = dataResults.indexOf(result);
        if (idx >= 0) newData[REPORTES_CONFIG[idx]?.id] = [];
      }
    });

    const newKpis = {};
    kpiResults.forEach(result => {
      if (result.status === 'fulfilled') {
        newKpis[result.value.id] = result.value.kpis;
      }
    });

    setData(newData);
    setKpis(newKpis);
    setLoading(Object.fromEntries(REPORTES_CONFIG.map(r => [r.id, false])));
    setLastRefresh(new Date());
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getKpis = (id) => {
    const k = kpis[id];
    if (!k) return [];
    switch (id) {
      case 'ventas':
        return [
          { label: 'Tickets', value: k.total_tickets || 0 },
          { label: 'Ingresos', value: fmtCOP(k.total_ingresos || 0) },
        ];
      case 'inventario':
        return [
          { label: 'Productos', value: k.total_productos || 0 },
          { label: 'Agotados', value: k.agotados || 0, color: (k.agotados || 0) > 0 ? '#dc2626' : undefined },
          { label: 'Stock bajo', value: k.stock_bajo || 0, color: (k.stock_bajo || 0) > 0 ? '#d97706' : undefined },
        ];
      case 'seguridad':
        return [
          { label: 'Total usuarios', value: k.total_usuarios || 0 },
          { label: 'Activos', value: k.activos || 0 },
        ];
      case 'carritos':
        return [
          { label: 'Ítems en carrito', value: k.total_items || 0 },
          { label: 'Valor potencial', value: fmtCOP(k.valor_potencial || 0) },
        ];
      case 'repartidores':
        return [
          { label: 'A tiempo', value: k.a_tiempo || 0, color: '#059669' },
          { label: 'Con retraso', value: k.con_retraso || 0, color: (k.con_retraso || 0) > 0 ? '#dc2626' : undefined },
        ];
      default: return [];
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Panel de Reportes</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#6b7280' }}>
            {lastRefresh
              ? `Última actualización: ${lastRefresh.toLocaleTimeString('es-CO')}`
              : 'Cargando reportes...'}
          </p>
        </div>
        <button
          onClick={fetchAll}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: '#111827', color: '#fff', border: 'none',
            borderRadius: '9999px', padding: '8px 16px',
            fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* ── Grid de tarjetas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {REPORTES_CONFIG.map(r => (
          <ReportCard
            key={r.id}
            icon={r.icon}
            title={r.title}
            desc={r.desc}
            accentColor={r.accentColor}
            kpis={getKpis(r.id)}
            loading={loading[r.id]}
            onClick={() => setModal(r.id)}
          />
        ))}
      </div>

      {/* ── Modales de detalle ── */}
      <VentasModal
        open={modal === 'ventas'}
        onClose={() => setModal(null)}
        data={data.ventas || []}
        kpis={kpis.ventas}
      />
      <InventarioModal
        open={modal === 'inventario'}
        onClose={() => setModal(null)}
        data={data.inventario || []}
        kpis={kpis.inventario}
      />
      <SeguridadModal
        open={modal === 'seguridad'}
        onClose={() => setModal(null)}
        data={data.seguridad || []}
        kpis={kpis.seguridad}
      />
      <CarritosModal
        open={modal === 'carritos'}
        onClose={() => setModal(null)}
        data={data.carritos || []}
        kpis={kpis.carritos}
      />
      <RepartidoresModal
        open={modal === 'repartidores'}
        onClose={() => setModal(null)}
        data={data.repartidores || []}
        kpis={kpis.repartidores}
      />
    </div>
  );
};

export default Reportes;
