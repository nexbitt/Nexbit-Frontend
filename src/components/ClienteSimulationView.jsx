import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, CreditCard, MapPin, Upload, FileImage, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import CustomDialog from './CustomDialog';

const ClienteSimulationView = () => {
  const { user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await api.get('/api/productos/publico');
        setProductos(res.data);
      } catch (err) {
        console.error('Error cargando productos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const addToCart = (producto) => {
    setCart(prev => {
      const existing = prev.find(item => item.id_producto === producto.id_producto);
      if (existing) {
        return prev.map(item =>
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const removeFromCart = (productoId) => {
    setCart(prev => prev.filter(item => item.id_producto !== productoId));
  };

  const updateQuantity = (productoId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id_producto !== productoId) return item;
      const newQty = item.cantidad + delta;
      return newQty <= 0 ? null : { ...item, cantidad: newQty };
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.precio_venta) * item.cantidad), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!direccion.trim()) {
      setDialog({ open: true, type: 'validation', title: 'Dirección requerida', message: 'Por favor ingresa una dirección de entrega', onConfirm: null });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/simulacion/checkout', {
        productos: cart.map(item => ({
          producto_id: item.id_producto,
          cantidad: item.cantidad
        })),
        direccion_entrega: direccion,
        notas: notas
      });
      setSuccessData(res.data);
      setCart([]);
      setCartOpen(false);
    } catch (err) {
      setDialog({ open: true, type: 'error', title: 'Error al crear pedido', message: err.response?.data?.message || 'Error al crear el pedido', onConfirm: null });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    setComprobanteFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setComprobantePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleSubirComprobante = async () => {
    if (!comprobanteFile || !successData?.id_pedido) return;
    setSubiendoComprobante(true);
    try {
      const formData = new FormData();
      formData.append('comprobante', comprobanteFile);
      await api.post(`/api/simulacion/${successData.id_pedido}/comprobante`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessData(prev => ({ ...prev, comprobanteSubido: true }));
    } catch (err) {
      setDialog({ open: true, type: 'error', title: 'Error al subir comprobante', message: err.response?.data?.message || 'Error al subir comprobante', onConfirm: null });
    } finally {
      setSubiendoComprobante(false);
    }
  };

  const resetAll = () => {
    setCart([]);
    setCartOpen(false);
    setDireccion('');
    setNotas('');
    setSuccessData(null);
    setComprobanteFile(null);
    setComprobantePreview(null);
  };

  if (loading) {
    return (
      <div className="sim-view-loading">
        <div className="spinner" />
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="sim-cliente-content">
      {/* ── Catalog Header ─────────────────────────────── */}
      <div className="sim-catalog-header">
        <h3>Catálogo de Productos</h3>
        <button className="sim-btn-cart-review" onClick={() => setCartOpen(true)}>
          <ShoppingBag size={18} />
          <span>Carrito ({cart.reduce((s, i) => s + i.cantidad, 0)})</span>
        </button>
      </div>

      {successData && !comprobanteFile ? (
        /* ── Success + Upload Comprobante ─────────────── */
        <div className="sim-success">
          <CheckCircle size={64} color="#16a34a" />
          <h2>Pedido Creado Exitosamente</h2>
          <p>Pedido #{successData.id_pedido} generado en modo simulación</p>
          <p className="sim-success-total">Total: ${Number(successData.total || 0).toLocaleString()}</p>

          <div className="sim-bank-info">
            <h4>Datos Bancarios para Transferencia</h4>
            {successData.datos_bancarios?.map((cb, i) => (
              <div key={i} className="sim-bank-card">
                <p><strong>Banco:</strong> {cb.banco}</p>
                <p><strong>Tipo:</strong> {cb.tipo_cuenta}</p>
                <p><strong>Número:</strong> {cb.numero_cuenta}</p>
                <p><strong>Titular:</strong> {cb.titular}</p>
              </div>
            ))}
          </div>

          <div className="sim-upload-section">
            <h4>Subir Comprobante de Pago</h4>
            <div
              className={`sim-dropzone ${dragOver ? 'sim-dropzone--active' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />
              {comprobantePreview ? (
                <img src={comprobantePreview} alt="Preview" className="sim-dropzone-preview" />
              ) : (
                <>
                  <Upload size={24} color="#3B82F6" />
                  <p>Arrastra tu comprobante aquí o haz clic para seleccionarlo</p>
                </>
              )}
            </div>
          </div>

          <div className="sim-success-actions">
            <button className="sim-btn-back" onClick={resetAll}>
              <ArrowLeft size={16} /> Nuevo Pedido
            </button>
          </div>
        </div>
      ) : successData && comprobanteFile ? (
        /* ── Comprobante selected ─────────────────────── */
        <div className="sim-success">
          <FileImage size={64} color="#3B82F6" />
          <h2>Comprobante Seleccionado</h2>
          <div className="sim-comprobante-preview-container">
            <img src={comprobantePreview} alt="Comprobante" className="sim-comprobante-preview" />
          </div>
          <p className="sim-comprobante-name">{comprobanteFile.name}</p>
          <div className="sim-success-actions">
            <button
              className="sim-btn-checkout"
              onClick={handleSubirComprobante}
              disabled={subiendoComprobante}
              style={{ maxWidth: 300, margin: '0 auto' }}
            >
              {subiendoComprobante ? 'Subiendo...' : 'Subir Comprobante'}
            </button>
            <button className="sim-btn-back" onClick={() => { setComprobanteFile(null); setComprobantePreview(null); }}>
              Cambiar archivo
            </button>
          </div>
        </div>
      ) : successData?.comprobanteSubido ? (
        /* ── Comprobante uploaded ──────────────────────── */
        <div className="sim-success">
          <CheckCircle size={64} color="#16a34a" />
          <h2>Comprobante Subido Exitosamente</h2>
          <p>Pedido #{successData.id_pedido} - Pago por verificar</p>
          <p className="sim-success-meta">El administrador revisará el comprobante y aprobará el pago</p>
          <button className="sim-btn-back" onClick={resetAll} style={{ marginTop: 20 }}>
            <ArrowLeft size={16} /> Volver al Catálogo
          </button>
        </div>
      ) : (
        /* ── Catalog Grid ──────────────────────────────── */
        <div className="sim-product-grid">
          {productos.map(prod => {
            const inCart = cart.find(item => item.id_producto === prod.id_producto);
            return (
              <div key={prod.id_producto} className="sim-product-card">
                {prod.imagen_url && (
                  <img src={prod.imagen_url} alt={prod.nombre} className="sim-product-img" />
                )}
                <div className="sim-product-info">
                  {prod.categoria_nombre && (
                    <span className="sim-product-categoria">{prod.categoria_nombre}</span>
                  )}
                  <h4>{prod.nombre}</h4>
                  <p className="sim-product-price">${Number(prod.precio_venta).toLocaleString()}</p>
                  <p className="sim-product-stock">Stock: {prod.stock_actual}</p>
                </div>
                <div className="sim-product-actions">
                  {inCart ? (
                    <div className="sim-qty-controls">
                      <button onClick={() => updateQuantity(prod.id_producto, -1)}><Minus size={14} /></button>
                      <span>{inCart.cantidad}</span>
                      <button onClick={() => updateQuantity(prod.id_producto, 1)}><Plus size={14} /></button>
                    </div>
                  ) : (
                    <button className="sim-btn-add" onClick={() => addToCart(prod)} disabled={prod.stock_actual <= 0}>
                      {prod.stock_actual > 0 ? 'Agregar al carrito' : 'Sin stock'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Cart Drawer ──────────────────────────────── */}
      <div className={`sim-drawer ${cartOpen ? 'sim-drawer--open' : ''}`}>
        <div className="sim-drawer-header">
          <h3>Carrito de Compras</h3>
          <button className="sim-drawer-close" onClick={() => setCartOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="sim-drawer-items">
          {cart.length === 0 ? (
            <div className="sim-drawer-empty">
              <ShoppingBag size={48} />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id_producto} className="sim-drawer-item">
                {item.imagen_url && (
                  <img src={item.imagen_url} alt={item.nombre} className="sim-drawer-item-img" />
                )}
                <div className="sim-drawer-item-info">
                  <span className="sim-drawer-item-name">{item.nombre}</span>
                  <span className="sim-drawer-item-price">${Number(item.precio_venta).toLocaleString()}</span>
                </div>
                <div className="sim-drawer-item-qty">
                  <button onClick={() => updateQuantity(item.id_producto, -1)}><Minus size={12} /></button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => updateQuantity(item.id_producto, 1)}><Plus size={12} /></button>
                </div>
                <div className="sim-drawer-item-subtotal">
                  ${(Number(item.precio_venta) * item.cantidad).toLocaleString()}
                </div>
                <button className="sim-drawer-item-remove" onClick={() => removeFromCart(item.id_producto)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="sim-drawer-footer">
            <div className="sim-checkout-form">
              <label><MapPin size={14} /> Dirección de Entrega *</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ingresa la dirección de entrega"
                className="sim-input"
              />
            </div>

            <div className="sim-checkout-form">
              <label>Notas (opcional)</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas para el pedido..."
                className="sim-input sim-textarea"
                rows={2}
              />
            </div>

            <div className="sim-drawer-total">
              <span>Total</span>
              <strong>${cartTotal.toLocaleString()}</strong>
            </div>

            <button
              className="sim-btn-checkout"
              onClick={handleCheckout}
              disabled={submitting || !direccion.trim()}
            >
              <CreditCard size={18} />
              {submitting ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </div>
        )}
      </div>

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

export default ClienteSimulationView;
