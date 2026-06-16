/**
 * @file CartToast.jsx
 * @description Notificación tipo toast que aparece al agregar un producto al carrito.
 * Se auto-descarta tras 3.5 segundos y tiene botón "Ver carrito".
 */
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, X, Check, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartToast = ({ basePath }) => {
  const { toast, clearToast } = useCart();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [currentToast, setCurrentToast] = useState(null);

  useEffect(() => {
    if (!toast) return;

    setCurrentToast(toast);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(clearToast, 350); // Espera a que termine la animación de salida
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(clearToast, 350);
  };

  const handleViewCart = () => {
    handleClose();
    navigate(`${basePath}/carrito`);
  };

  if (!currentToast) return null;

  const { product, quantity } = currentToast;

  return (
    <div className={`cart-toast${visible ? ' cart-toast--visible' : ''}`} role="alert">
      {/* Barra de progreso */}
      {visible && <div className="cart-toast-progress" />}

      <div className="cart-toast-inner">
        {/* Ícono de éxito */}
        <div className="cart-toast-check">
          <Check size={16} />
        </div>

        {/* Imagen del producto */}
        <div className="cart-toast-img">
          {product.imagen_url
            ? <img src={product.imagen_url} alt={product.nombre} />
            : <Package size={22} color="#94a3b8" />
          }
        </div>

        {/* Texto */}
        <div className="cart-toast-body">
          <p className="cart-toast-title">¡Agregado al carrito!</p>
          <p className="cart-toast-product">
            {product.nombre}
            {quantity > 1 && <span className="cart-toast-qty"> ×{quantity}</span>}
          </p>
        </div>

        {/* Acciones */}
        <div className="cart-toast-actions">
          <button className="cart-toast-view" onClick={handleViewCart}>
            <ShoppingCart size={14} /> Ver carrito
          </button>
          <button className="cart-toast-close" onClick={handleClose} aria-label="Cerrar">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartToast;
