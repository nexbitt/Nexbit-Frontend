/**
 * @file AdminSidebar.jsx
 * @description Sidebar de navegación para el panel de administración.
 *
 * CORRECCIONES APLICADAS:
 *  BUG #5 — Migración Factura → Ticket:
 *     - Se elimina la entrada "Facturas" del menú de navegación.
 *     - Se agrega "Tickets" apuntando a /admin/tickets.
 *     - Se cambia el ícono de Receipt por TicketIcon (Ticket en lucide-react).
 *  BUG #4 — El Admin ya NO ve enlaces a vistas de cliente.
 *     (Los QUICK_ACTIONS de Inicio.jsx apuntan a basePath que para Admin
 *      es /usuario; este Sidebar es el único punto de navegación del Admin.)
 */
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Boxes, Ticket, Tags, BarChart2,
  UsersRound, Building2, Bike, Shield,
  UserCog, LogOut, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

// ── Definición de grupos y rutas del sidebar ─────────────────────────────────
//
// CONCEPTO: Centralizar la navegación en un array de objetos hace que
// agregar o quitar secciones sea un cambio de una sola línea.
// Si mañana quieres añadir "Proveedores" solo agregas un objeto aquí.
//
const NAV_GROUPS = [
  {
    label: 'Tienda',
    items: [
      { to: '/admin/inicio', Icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/pedidos', Icon: ShoppingBag, label: 'Pedidos' },
      { to: '/admin/productos', Icon: Boxes, label: 'Productos' },
      { to: '/admin/categorias', Icon: Tags, label: 'Categorías' },
      { to: '/admin/reportes', Icon: BarChart2, label: 'Reportes' },
    ],
  },
  {
    label: 'Personas',
    items: [
      { to: '/admin/usuarios', Icon: UsersRound, label: 'Usuarios' },
      { to: '/admin/proveedores', Icon: Building2, label: 'Proveedores' },
      { to: '/admin/repartidores', Icon: Bike, label: 'Repartidores' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/admin/roles', Icon: Shield, label: 'Roles' },
      { to: '/admin/perfil', Icon: UserCog, label: 'Mi Perfil' },
    ],
  },
];

// ── Componente ────────────────────────────────────────────────────────────────
const AdminSidebar = ({ collapsed, onToggle, onLogout }) => {
  const { pendingReviewCount } = useSocket();
  return (
    <aside className={`adm-sidebar${collapsed ? ' adm-sidebar--collapsed' : ''}`}>

      {/* ── Logo (Cliqueable) ─────────────────────────────────────────── */}
      <NavLink to="/admin/inicio" className="adm-sb-logo" style={{ textDecoration: 'none' }}>
        <div className="adm-sb-logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 22H22L12 2Z" fill="white" />
          </svg>
        </div>
        {!collapsed && <span className="adm-sb-logo-text">Nexbit</span>}
      </NavLink>

      {/* ── Navegación ───────────────────────────────────── */}
      <nav className="adm-sb-nav">
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label} className="adm-sb-group">
            {!collapsed && (
              <span className="adm-sb-group-label">{label}</span>
            )}
            {items.map(({ to, Icon, label: itemLabel }) => (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? itemLabel : undefined}
                className={({ isActive }) =>
                  `adm-sb-link${isActive ? ' adm-sb-link--active' : ''}`
                }
              >
                <Icon size={18} className="adm-sb-icon" />
                {!collapsed && <span>{itemLabel}</span>}
                {to === '/admin/pedidos' && pendingReviewCount > 0 && (
                  <span className="adm-sb-badge">{pendingReviewCount}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="adm-sb-footer">
        <button
          className="adm-sb-link adm-sb-logout"
          onClick={onLogout}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={18} className="adm-sb-icon" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>

        <button
          className="adm-sb-collapse"
          onClick={onToggle}
          title="Expandir / Colapsar"
        >
          {collapsed
            ? <PanelLeftOpen size={16} />
            : <PanelLeftClose size={16} />
          }
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
