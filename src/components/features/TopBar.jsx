/**
 * @file TopBar.jsx
 * @description Barra de navegación para la tienda (usuario / cliente).
 * Diseño e-commerce de dos niveles:
 *  - Nivel superior: logo | búsqueda | acciones (carrito, cuenta)
 *  - Nivel inferior: links de categorías/secciones
 */
import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, LogIn, LogOut,
  Home, Store,
  ClipboardList, Menu, X,
  LifeBuoy, UserCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const TopBar = ({ onLogout, variant }) => {
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth(); // <--- Usar estado real
  const navigate     = useNavigate();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartBump, setCartBump]     = useState(false);
  const prevTotalRef = useRef(totalItems);

  const basePath  = variant === 'cliente' ? '/cliente' : '/usuario';
  const isCliente = variant === 'cliente';

  /* ── Scroll shadow ──────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Animación del carrito al añadir ────────────────── */
  useEffect(() => {
    if (totalItems > prevTotalRef.current) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 600);
      return () => clearTimeout(t);
    }
    prevTotalRef.current = totalItems;
  }, [totalItems]);

  const NAV_LINKS = [
    { to: `${basePath}/inicio`,    label: 'Inicio',      Icon: Home         },
    { to: `${basePath}/productos`, label: 'Catálogo',    Icon: Store        },
    { to: `${basePath}/pedidos`,   label: 'Mis Pedidos', Icon: ClipboardList },
    { to: `${basePath}/ayuda`,     label: 'Ayuda',       Icon: LifeBuoy     },
  ];

  return (
    <header className={`store-header${scrolled ? ' store-header--scrolled' : ''}`}>

      {/* ══ NIVEL 1: Marca + Acciones ════════════════════ */}
      <div className="store-header-top">
        <div className="store-header-inner">

          {/* Logo */}
          <div className="store-logo" onClick={() => navigate(`${basePath}/inicio`)}>
            <div className="store-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 22H22L12 2Z" fill="url(#hGrad)" />
                <defs>
                  <linearGradient id="hGrad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#111111" />
                    <stop offset="1" stopColor="#555555" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="store-logo-text">Nexbit</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Acciones derechas */}
          <div className="store-header-actions">

            {/* Cuenta */}
            {isAuthenticated ? (
              <NavLink to={isCliente ? "/cliente/perfil" : "/admin/perfil"} className="store-action-btn store-action-btn--text">
                <UserCircle size={17} />
                <span className="store-action-label">Mi Cuenta</span>
              </NavLink>
            ) : (
              <button
                className="store-action-btn store-action-btn--text"
                onClick={() => navigate('/login')}
              >
                <LogIn size={17} />
                <span className="store-action-label">Iniciar sesión</span>
              </button>
            )}

            {/* Carrito — botón principal */}
            <button
              className={`store-cart-btn${cartBump ? ' store-cart-btn--bump' : ''}`}
              onClick={() => navigate(`${basePath}/carrito`)}
              title="Ver carrito"
            >
              {/* SVG inline garantiza visibilidad sin importar CSS global */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20" height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalItems > 0 && (
                <span className="store-cart-badge">{totalItems > 99 ? '99+' : totalItems}</span>
              )}
              <span className="store-cart-label">Carrito</span>
            </button>

            {/* Logout (solo cliente) */}
            {isCliente && (
              <button
                className="store-action-btn store-action-btn--icon"
                onClick={onLogout}
                title="Cerrar sesión"
              >
                <LogOut size={17} />
              </button>
            )}

            {/* Hamburger */}
            <button
              className="store-hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menú"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ══ NIVEL 2: Categorías / Navegación ═════════════ */}
      <nav className={`store-nav-bar${mobileOpen ? ' store-nav-bar--open' : ''}`}>
        <div className="store-nav-inner">
          {NAV_LINKS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `store-nav-link${isActive ? ' store-nav-link--active' : ''}`
              }
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default TopBar;
