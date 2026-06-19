/**
 * @file Carrito.jsx
 * @description Vista del carrito de compras.
 * Permite gestionar productos, cantidades y proceder al checkout.
 */
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Package, ShieldCheck, Lock, CreditCard, ChevronRight } from 'lucide-react';
import CustomDialog from '../components/CustomDialog';

const Carrito = ({ variant }) => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, checkout } = useCart();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });

  // El checkout transaccional del backend requiere estar logueado. A un 'usuario' (invitado) le pedimos logearse.
  const isGuest = variant === 'usuario';

  const handleProceed = async () => {
    if (isGuest) {
      navigate('/login');
      return;
    }

    const result = await checkout();
    if (result.success) {
      navigate(`/${variant}/pedidos/${result.id_pedido}/confirmar`);
    } else {
      setDialog({ open: true, type: 'error', title: 'Error', message: result.error || "Ocurrió un error procesando el pedido.", onConfirm: null });
    }
  };

  const total = getCartTotal();

  return (
    <div className="storefront-container" style={{ paddingTop: '10px' }}>
      <h1 className="module-title-table" style={{ fontSize: '1.6rem', marginBottom: '5px' }}>Carrito de compras</h1>
      <p style={{ color: '#555', marginBottom: '15px', fontWeight: 'bold' }}>Productos en el carrito: ({cartItems.length})</p>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem', border: '1px solid #e1e1e1', borderRadius: '8px', background: 'white' }}>
          <Package size={64} color="#ccc" style={{ marginBottom: '1rem' }} />
          <h3>Tu carrito está vacío</h3>
          <button style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate(`/${variant}/productos`)}>
            Descubrir productos
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* MAIN COLUMN */}
          <div className="cart-main">
            {cartItems.map(item => (
              <div className="cart-item-row" key={item.producto_id} style={{ borderRadius: '8px', borderTop: '1px solid #e1e1e1', marginBottom: '15px' }}>
                <div className="cart-item-img" style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CartItemImg src={item.imagen_url} alt={item.nombre} />
                </div>

                <div className="cart-item-details" style={{ flex: 1.5 }}>
                  <h3 className="cart-item-title">{item.nombre}</h3>
                  <div className="cart-item-variant" style={{ color: '#64748b' }}>Stock Total: {item.stock_actual} | ID: {item.producto_id}</div>

                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: 0, marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85rem' }}
                    onClick={() => removeFromCart(item.producto_id)}
                  >
                    <TrashIcon /> Eliminar
                  </button>
                </div>

                <div className="cart-item-prices" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div className="cart-qty-selector" style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '0.85rem', marginRight: '5px', color: '#475569' }}>Cantidad:</label>
                    <input
                      type="number"
                      min="1"
                      max={item.stock_actual || 100}
                      value={item.cantidad}
                      onChange={(e) => updateQuantity(item.producto_id, parseInt(e.target.value))}
                      style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                  </div>

                  <div className="precio-final" style={{ fontSize: '1.2rem', color: '#0f172a' }}>${Number(item.precio).toLocaleString()}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Subtotal: ${(item.precio * item.cantidad).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: '5px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/${variant}/productos`) }} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                <ChevronRight size={16} /> Ver más productos
              </a>
            </div>
          </div>

          {/* SIDEBAR SUMMARY */}
          <div className="cart-sidebar">
            <h3 className="cart-sidebar-title">Resumen de Compra</h3>

            <div className="summary-row">
              <span>Subtotal ({cartItems.length} producto{cartItems.length !== 1 && 's'})</span>
              <span>${total.toLocaleString()}</span>
            </div>

            <div className="summary-row bold">
              <span>Total a pagar</span>
              <span style={{ fontSize: '1.3rem', color: 'var(--primary)' }}>${total.toLocaleString()}</span>
            </div>

            <button className="btn-checkout-red" onClick={handleProceed}>
              {isGuest ? 'Iniciar Sesión para Pagar' : 'Generar Pedido'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '15px', color: '#888' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); clearCart(); }} style={{ color: '#999', textDecoration: 'none' }}>Vaciar todo el carrito</a>
            </p>

            <div className="security-badges" style={{ marginTop: '20px' }}>
              <p><Lock size={14} /> Tu pedido seguro</p>
              <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
                <ShieldCheck size={28} color="var(--primary)" />
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomDialog
        type={dialog.type}
        open={dialog.open}
        onClose={() => setDialog(prev => ({ ...prev, open: false }))}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
      />
    </div>
  );
};

const CartItemImg = ({ src, alt }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <Package size={36} color="#94a3b8" />;
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
};

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

export default Carrito;
