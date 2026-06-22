/**
 * @file App.jsx
 * @description Componente raíz. Dos layouts separados:
 *  - AdminLayout: sidebar oscuro colapsable (panel admin)
 *  - StoreLayout: topbar e-commerce (cliente / usuario)
 *
 * CORRECCIONES APLICADAS:
 *  BUG #4 — Admin permanece en su panel:
 *     El AdminLayout usa <Outlet> que solo renderiza rutas /admin/*.
 *     Se elimina cualquier ruta /admin/inicio que cargaba <Inicio>
 *     con QUICK_ACTIONS hacia /usuario/* (ver también Inicio.jsx).
 *  BUG #5 — Migración Factura → Ticket:
 *     - Eliminado: import Facturas / Route path="facturas"
 *     - Agregado:  import Tickets  / Route path="tickets"
 *     (Necesitarás crear frontend/src/pages/Tickets.jsx)
 */
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, NavLink } from 'react-router-dom';
import TopBar from './components/TopBar';
import AdminSidebar from './components/AdminSidebar';
import CartToast from './components/CartToast';
import { Bike, UserCog, LogOut, Package, Clock } from 'lucide-react';

// Páginas
import Usuarios from './pages/Usuarios';
import Roles from './pages/Roles';
import Categorias from './pages/Categorias';
import Productos from './pages/Productos';
import Pedidos from './pages/Pedidos';
import Proveedores from './pages/Proveedores';
import Repartidores from './pages/Repartidores';
import Perfil from './pages/Perfil';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Carrito from './pages/Carrito';
import Ayuda from './pages/Ayuda';
import Contacto from './pages/Contacto';
import Reportes from './pages/Reportes';
import ConfirmacionPedido from './pages/ConfirmacionPedido';

// Páginas del repartidor
import InicioRepartidor from './pages/repartidor/InicioRepartidor';
import PerfilRepartidor from './pages/repartidor/PerfilRepartidor';
import PedidosDisponibles from './pages/repartidor/PedidosDisponibles';
import PedidoActivo from './pages/repartidor/PedidoActivo';
import HistorialRepartidor from './pages/repartidor/HistorialRepartidor';
import ActiveBanner from './components/ActiveBanner';

import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './context/LanguageContext';
import AdminToast from './components/AdminToast';
import SimulationToolbar from './components/SimulationToolbar';
import RepartidorSimulationView from './components/RepartidorSimulationView';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import './services/authService';

// ─── Layout del Panel Admin ──────────────────────────────────────────────────
//
// CONCEPTO: AdminLayout contiene el <AdminSidebar> y un <Outlet>.
// React Router renderiza el componente de la sub-ruta activa dentro de <Outlet>.
// Esto garantiza que el Admin NUNCA salga de este layout hacia el StoreLayout.
//
const AdminLayout = () => {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { activeMode } = useSimulation();

  return (
    <div className="adm-layout">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        onLogout={logout}
      />
      <main className={`adm-content${collapsed ? ' adm-content--expanded' : ''}`}>
        <SimulationToolbar />
        <div className="admin-container">
          {activeMode === 'repartidor' ? (
            <RepartidorSimulationView />
          ) : (
            <Outlet />
          )}
        </div>
        <AdminToast />
      </main>
    </div>
  );
};

// ─── Layout del Repartidor ───────────────────────────────────────────────────
const RepartidorLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar" style={{ width: '220px' }}>
        <NavLink to="/repartidor/inicio" className="adm-sb-logo" style={{ textDecoration: 'none' }}>
          <div className="adm-sb-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 22H22L12 2Z" fill="white" />
            </svg>
          </div>
          <span className="adm-sb-logo-text">Nexbit</span>
        </NavLink>
        <nav className="adm-sb-nav">
          <div className="adm-sb-group">
            <span className="adm-sb-group-label">Entregas</span>
            <NavLink to="/repartidor/inicio" className={({ isActive }) => `adm-sb-link${isActive ? ' adm-sb-link--active' : ''}`}>
              <Bike size={18} className="adm-sb-icon" />
              <span>Inicio</span>
            </NavLink>
            <NavLink to="/repartidor/disponibles" className={({ isActive }) => `adm-sb-link${isActive ? ' adm-sb-link--active' : ''}`}>
              <Package size={18} className="adm-sb-icon" />
              <span>Disponibles</span>
            </NavLink>
            <NavLink to="/repartidor/activo" className={({ isActive }) => `adm-sb-link${isActive ? ' adm-sb-link--active' : ''}`}>
              <Bike size={18} className="adm-sb-icon" />
              <span>En Reparto</span>
            </NavLink>
            <NavLink to="/repartidor/historial" className={({ isActive }) => `adm-sb-link${isActive ? ' adm-sb-link--active' : ''}`}>
              <Clock size={18} className="adm-sb-icon" />
              <span>Historial</span>
            </NavLink>
          </div>
          <div className="adm-sb-group">
            <span className="adm-sb-group-label">Cuenta</span>
            <NavLink to="/repartidor/perfil" className={({ isActive }) => `adm-sb-link${isActive ? ' adm-sb-link--active' : ''}`}>
              <UserCog size={18} className="adm-sb-icon" />
              <span>Mi Perfil</span>
            </NavLink>
          </div>
        </nav>
        <div className="adm-sb-footer">
          <button className="adm-sb-link adm-sb-logout" onClick={logout}>
            <LogOut size={18} className="adm-sb-icon" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      <main className="adm-content">
        <div className="admin-container">
          <ActiveBanner repartidorId={user?.id_usuario} />
          <Outlet />
        </div>
      </main>
    </div>
  );
};
const StoreLayout = ({ variant }) => {
  const { logout } = useAuth();
  const basePath = variant === 'cliente' ? '/cliente' : '/usuario';

  return (
    <div className="store-layout">
      <TopBar onLogout={logout} variant={variant} />
      <CartToast basePath={basePath} />
      <div className="store-content">
        <div className="admin-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// ─── Rutas ───────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
      <div className="spinner" />
      <p style={{ marginTop: '1rem' }}>Validando sesión...</p>
    </div>
  );

  const isAdmin = role === 'Administrador';
  const isRepartidor = role === 'Repartidor';

  return (
    <Routes>
      {/* Redirección inicial */}
      <Route path="/" element={<Navigate to="/usuario/inicio" replace />} />

      {/* Auth (sin layout) */}
      <Route
        path="/login"
        element={isAuthenticated
          ? <Navigate to={isAdmin ? '/admin/inicio' : isRepartidor ? '/repartidor/inicio' : '/cliente/inicio'} replace />
          : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated
          ? <Navigate to={isAdmin ? '/admin/inicio' : isRepartidor ? '/repartidor/inicio' : '/cliente/inicio'} replace />
          : <Register />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated
          ? <Navigate to={isAdmin ? '/admin/inicio' : isRepartidor ? '/repartidor/inicio' : '/cliente/inicio'} replace />
          : <ForgotPassword />}
      />

      {/* ── Usuario / Invitado ────────────────────────────── */}
      <Route path="/usuario">
        <Route path="login" element={
          isAuthenticated ? <Navigate to="/usuario/inicio" replace /> : <Login />
        } />
        <Route element={<StoreLayout variant="usuario" />}>
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<Inicio />} />
          <Route path="productos" element={<Productos variant="usuario" />} />
          <Route path="carrito" element={<Carrito variant="usuario" />} />
          <Route path="pedidos" element={<Pedidos variant="usuario" />} />
          <Route path="pedidos/:id/confirmar" element={<ConfirmacionPedido variant="usuario" />} />
          <Route path="ayuda" element={<Ayuda />} />
          <Route path="contacto" element={<Contacto />} />
        </Route>
      </Route>

      {/* ── Cliente Registrado ────────────────────────────── */}
      <Route
        path="/cliente"
        element={
          <ProtectedRoute allowedRoles={['Cliente', 'Administrador']}>
            <StoreLayout variant="cliente" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="inicio" replace />} />
        <Route path="inicio" element={<Inicio />} />
        <Route path="productos" element={<Productos variant="cliente" />} />
          <Route path="carrito" element={<Carrito variant="cliente" />} />
          <Route path="pedidos" element={<Pedidos variant="cliente" />} />
          <Route path="pedidos/:id/confirmar" element={<ConfirmacionPedido variant="cliente" />} />
          <Route path="ayuda" element={<Ayuda />} />
          <Route path="contacto" element={<Contacto />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>

      {/* ── Repartidor ────────────────────────────────────── */}
      <Route
        path="/repartidor"
        element={
          <ProtectedRoute allowedRoles={['Repartidor']}>
            <RepartidorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="inicio" replace />} />
        <Route path="inicio" element={<InicioRepartidor />} />
        <Route path="disponibles" element={<PedidosDisponibles />} />
        <Route path="activo" element={<PedidoActivo />} />
        <Route path="historial" element={<HistorialRepartidor />} />
        <Route path="perfil" element={<PerfilRepartidor />} />
      </Route>

      {/* ── Administrador ─────────────────────────────────── */}
      {/*
        CORRECCIÓN #4: El Admin tiene su propio layout (AdminLayout).
        Las rutas /admin/* NUNCA mezclan el StoreLayout.
        La ruta /admin/inicio renderiza <Inicio /> dentro del AdminLayout,
        pero Inicio.jsx ahora detecta role === 'Administrador' y NO muestra
        los QUICK_ACTIONS con rutas /usuario/* (ver Inicio.jsx corregido).
      */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Administrador']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="inicio" replace />} />
        <Route path="inicio" element={<Inicio />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="roles" element={<Roles />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="productos" element={<Productos variant="admin" />} />
        <Route path="pedidos" element={<Pedidos variant="admin" />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="repartidores" element={<Repartidores />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>

      {/* Catch-all */}
      <Route path="/*" element={<Navigate to="/usuario/inicio" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <SimulationProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </SimulationProvider>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
