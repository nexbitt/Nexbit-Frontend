/**
 * @file Inicio.jsx
 * @description Página de inicio del sistema RematesPaisa.
 *
 * CORRECCIONES APLICADAS:
 *  BUG #1 — Localización COP: Los stats usan Intl.NumberFormat('es-CO').
 *  BUG #4 — Admin no ve accesos rápidos de cliente:
 *     QUICK_ACTIONS solo aparece para roles 'Cliente' e 'Invitado'.
 *     El Admin ve un panel de accesos directos a sus propias secciones.
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import api from '../api';
import {
  Package, ShoppingCart, ClipboardList, ArrowRight,
  Truck, ShieldCheck, Zap, Headphones,
  TrendingUp, Star, ChevronRight, Sparkles,
  // Iconos para el panel admin
  UsersRound, BarChart2, Boxes, Ticket
} from 'lucide-react';

// ── Utilidad de formato COP ──────────────────────────────────────────────────
//
// CONCEPTO — Intl.NumberFormat:
//   Es la API nativa del navegador para formatear números según una localidad.
//   'es-CO' = español colombiano → usa punto como separador de miles y
//   coma como separador decimal.
//   style: 'currency' + currency: 'COP' agrega el símbolo "COP" o "$".
//   minimumFractionDigits: 0 evita los ".00" en precios enteros (ej. $1.200).
//
const formatCOP = (valor) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor);

// ── Features (sin cambios) ───────────────────────────────────────────────────
const FEATURES = [
  { Icon: Truck, title: 'Envío Ágil', desc: 'Entregas coordinadas y rastreables en tiempo real.' },
  { Icon: ShieldCheck, title: 'Compra Segura', desc: 'Tus datos y transacciones están siempre protegidos.' },
  { Icon: Zap, title: 'Gestión Rápida', desc: 'Pedidos confirmados y procesados al instante.' },
  { Icon: Headphones, title: 'Soporte 24/7', desc: 'Un equipo listo para ayudarte en cualquier momento.' },
];

const ADMIN_QUICK_ACTIONS = [
  { Icon: Boxes, title: 'Productos', desc: 'Gestiona el catálogo y el inventario', to: '/admin/productos' },
  { Icon: ClipboardList, title: 'Pedidos', desc: 'Revisa y actualiza los pedidos activos', to: '/admin/pedidos' },
  { Icon: UsersRound, title: 'Usuarios', desc: 'Administra cuentas y roles', to: '/admin/usuarios' },
  { Icon: BarChart2, title: 'Reportes', desc: 'Analiza ventas e inventario', to: '/admin/reportes' },
];

// ── Componente principal ─────────────────────────────────────────────────────
const Inicio = () => {
  const { isAuthenticated, role, user } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  // basePath solo es relevante para clientes/invitados
  const basePath = role === 'Cliente' ? '/cliente' : '/usuario';

  // ── Stats en tiempo real ────────────────────────────────────────────────
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/api/stats');
      setStats(data);
    } catch {
      // Si falla, mantiene el último valor conocido
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, []);

  // CORRECCIÓN #1 — Formato COP con Intl.NumberFormat('es-CO')
  // Antes: stats.productos.toLocaleString()  → podía dar formato en-US
  // Ahora: toLocaleString('es-CO') es consistente en todos los navegadores.
  // Para contadores (sin decimales) usamos toLocaleString; para precios, formatCOP.
  const STATS_LIVE = [
    { value: stats ? stats.productos.toLocaleString('es-CO') + '+' : '...', label: 'Productos disponibles' },
    { value: stats ? stats.pedidos.toLocaleString('es-CO') : '...', label: 'Pedidos realizados' },
    { value: stats ? stats.clientes.toLocaleString('es-CO') : '...', label: 'Clientes registrados' },
    { value: stats ? stats.categorias.toLocaleString('es-CO') : '...', label: 'Categorías activas' },
  ];

  // ── Accesos rápidos para clientes / invitados ───────────────────────────
  const QUICK_ACTIONS = [
    {
      Icon: Package,
      title: 'Explorar Catálogo',
      desc: 'Descubre todos nuestros productos disponibles',
      to: `${basePath}/productos`,
    },
    {
      Icon: ShoppingCart,
      title: 'Mi Carrito',
      desc: totalItems > 0
        ? `Tienes ${totalItems} producto${totalItems > 1 ? 's' : ''} esperándote`
        : 'Tu carrito está vacío por ahora',
      to: `${basePath}/carrito`,
      badge: totalItems || null,
    },
    {
      Icon: ClipboardList,
      title: 'Mis Pedidos',
      desc: 'Revisa el estado de tus compras recientes',
      to: `${basePath}/pedidos`,
    },
  ];

  const isAdmin = role === 'Administrador';

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="hp-root">

      {/* ═══════════════════════════════════════ HERO ═══════════════════════ */}
      <section className="hp-hero">
        <div className="hp-hero-deco">
          <div className="hp-deco-blob hp-deco-blob--1" />
          <div className="hp-deco-blob hp-deco-blob--2" />
          <div className="hp-deco-grid" />
        </div>

        <div className="hp-hero-body">
          <div className="hp-hero-badge">
            <Sparkles size={13} />
            <span>Plataforma comercial · RematesPaisa</span>
          </div>

          <h1 className="hp-hero-title">
            {isAuthenticated
              ? <>Bienvenido, <span className="hp-hero-hi">{user?.nombre?.split(' ')[0] || 'Usuario'}</span></>
              : <>Todo lo que necesitas,<br /><span className="hp-hero-hi">en un solo lugar</span></>
            }
          </h1>

          <p className="hp-hero-sub">
            {isAuthenticated
              ? 'Explora el catálogo, gestiona tus pedidos y disfruta de la mejor experiencia de compra.'
              : 'Conectamos compradores y vendedores en una plataforma rápida, segura y moderna. Empieza hoy.'
            }
          </p>

          {/* CTAs — solo para NO administradores */}
          {!isAdmin && (
            <div className="hp-hero-ctas">
              <button
                className="hp-btn-primary"
                onClick={() => navigate(isAuthenticated ? `${basePath}/productos` : '/login')}
              >
                {isAuthenticated ? 'Ir al Catálogo' : 'Empezar ahora'}
                <ArrowRight size={17} />
              </button>
              {isAuthenticated
                ? (
                  <button className="hp-btn-ghost" onClick={() => navigate(`${basePath}/pedidos`)}>
                    Ver mis pedidos <ChevronRight size={16} />
                  </button>
                ) : (
                  <button className="hp-btn-ghost" onClick={() => navigate('/usuario/productos')}>
                    Explorar sin cuenta <ChevronRight size={16} />
                  </button>
                )
              }
            </div>
          )}

          <div className="hp-trust">
            <div className="hp-trust-stars">
              {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#111" />)}
            </div>
            <span className="hp-trust-text"></span>
          </div>
        </div>
      </section>

      {/* ═════════════════════════ STATS STRIP ══════════════════════════════ */}
      <section className="hp-stats">
        {STATS_LIVE.map(({ value, label }) => (
          <div key={label} className="hp-stat">
            <span className={`hp-stat-value${value === '...' ? ' hp-stat-loading' : ''}`}>
              {value}
            </span>
            <span className="hp-stat-label">{label}</span>
          </div>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CORRECCIÓN #4 — ACCESOS RÁPIDOS SEGÚN ROL
          ───────────────────────────────────────────────────────────────────
          Antes: QUICK_ACTIONS siempre apuntaba a basePath = '/usuario' incluso
                 para el Admin, lo que lo sacaba del panel admin.
          Ahora:
            - Admin ve su propio panel de accesos directos (/admin/*)
            - Cliente/Invitado ve los accesos del e-commerce (/cliente/* o /usuario/*)
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Panel de accesos rápidos para ADMIN */}
      {isAdmin && (
        <section className="hp-quick">
          <div className="hp-section-header">
            <h2 className="hp-section-title">Panel de Administración</h2>
            <p className="hp-section-sub">Accede rápidamente a las secciones de gestión</p>
          </div>
          <div className="hp-quick-grid">
            {ADMIN_QUICK_ACTIONS.map(({ Icon, title, desc, to }) => (
              <button key={to} className="hp-quick-card" onClick={() => navigate(to)}>
                <div className="hp-quick-icon-wrap">
                  <Icon size={24} />
                </div>
                <div className="hp-quick-text">
                  <h3 className="hp-quick-title">{title}</h3>
                  <p className="hp-quick-desc">{desc}</p>
                </div>
                <ArrowRight size={16} className="hp-quick-arrow" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Accesos rápidos para CLIENTE / INVITADO autenticado */}
      {isAuthenticated && !isAdmin && (
        <section className="hp-quick">
          <div className="hp-section-header">
            <h2 className="hp-section-title">¿Qué quieres hacer hoy?</h2>
            <p className="hp-section-sub">Accede rápidamente a las secciones principales</p>
          </div>
          <div className="hp-quick-grid">
            {QUICK_ACTIONS.map(({ Icon, title, desc, to, badge }) => (
              <button key={to} className="hp-quick-card" onClick={() => navigate(to)}>
                <div className="hp-quick-icon-wrap">
                  <Icon size={24} />
                  {badge > 0 && <span className="hp-quick-badge">{badge}</span>}
                </div>
                <div className="hp-quick-text">
                  <h3 className="hp-quick-title">{title}</h3>
                  <p className="hp-quick-desc">{desc}</p>
                </div>
                <ArrowRight size={16} className="hp-quick-arrow" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ═════════════════════════ FEATURES ══════════════════════════════════ */}
      <section className="hp-features">
        <div className="hp-section-header">
          <h2 className="hp-section-title">¿Por qué elegir RematesPaisa?</h2>
          <p className="hp-section-sub">Diseñado para ofrecerte la mejor experiencia comercial</p>
        </div>
        <div className="hp-features-grid">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="hp-feature-card">
              <div className="hp-feature-icon"><Icon size={22} /></div>
              <h3 className="hp-feature-title">{title}</h3>
              <p className="hp-feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════════════════ CTA BANNER (solo invitados) ══════════════ */}
      {!isAuthenticated && (
        <section className="hp-cta">
          <div className="hp-cta-inner">
            <div className="hp-cta-tag">
              <TrendingUp size={14} /> Únete hoy
            </div>
            <h2 className="hp-cta-title">Empieza a comprar en RematesPaisa</h2>
            <p className="hp-cta-sub">
              Crea tu cuenta gratis y accede a cientos de productos con gestión de pedidos, seguimiento y mucho más.
            </p>
            <div className="hp-cta-btns">
              <button className="hp-btn-primary" onClick={() => navigate('/register')}>
                Crear cuenta gratis <ArrowRight size={16} />
              </button>
              <button className="hp-btn-ghost hp-btn-ghost--light" onClick={() => navigate('/login')}>
                Ya tengo cuenta
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

// Exportamos también formatCOP para que otros componentes puedan importarlo
export { formatCOP };
export default Inicio;
