import { useState, useEffect, useRef } from 'react';
import api from '../../api';
import CustomDialog from './CustomDialog';
import { Plus, X, Trash2, MapPin, FileText, Upload, Loader2, ChevronDown, User, Package } from 'lucide-react';

const INPUT_WRAP = {
  display: 'flex', alignItems: 'center', background: '#F9FAFB',
  border: '1px solid #E5E7EB', borderRadius: '8px', height: '42px',
  padding: '0 12px', boxSizing: 'border-box'
};

const INPUT_INNER = {
  border: 'none', outline: 'none', flex: 1, padding: '0 8px',
  background: 'transparent', width: '100%', height: '100%', fontSize: '13px', color: '#111827'
};

const LABEL_STYLE = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '6px' };

const AdminCheckoutModal = ({ open, onClose, onSuccess }) => {
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  const [cart, setCart] = useState([]);
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedPublicId, setUploadedPublicId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      api.get('/api/v1/usuarios?rol=Cliente').then(res => setClients(res.data || [])).catch(() => {});
      api.get('/api/v1/productos?activo=true').then(res => setProducts(res.data || [])).catch(() => {});
    }
  }, [open]);

  const filteredClients = clients.filter(c =>
    c.nombre?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.numero_documento && c.numero_documento.includes(clientSearch))
  );

  const handleClientSearch = (value) => {
    setClientSearch(value);
    setSelectedClient(null);
    setClientDropdownOpen(true);
  };

  const handleClientFocus = () => setClientDropdownOpen(true);
  const handleClientBlur = () => setTimeout(() => setClientDropdownOpen(false), 200);

  const selectClient = (client) => {
    setSelectedClient(client);
    setClientSearch(client.nombre);
    setClientDropdownOpen(false);
  };

  const filteredProducts = products.filter(p =>
    p.nombre?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleProductSearch = (value) => {
    setProductSearch(value);
    setProductDropdownOpen(true);
  };

  const handleProductFocus = () => setProductDropdownOpen(true);
  const handleProductBlur = () => setTimeout(() => setProductDropdownOpen(false), 200);

  const addToCart = (product) => {
    const existing = cart.find(c => c.producto_id === product.id_producto);
    if (existing) {
      setCart(cart.map(c => c.producto_id === product.id_producto ? { ...c, cantidad: c.cantidad + 1 } : c));
    } else {
      setCart([...cart, {
        producto_id: product.id_producto,
        nombre: product.nombre,
        precio_venta: product.precio_venta,
        cantidad: 1
      }]);
    }
    setProductSearch('');
    setProductDropdownOpen(false);
  };

  const updateQuantity = (productoId, cantidad) => {
    if (cantidad < 1) return;
    setCart(cart.map(c => c.producto_id === productoId ? { ...c, cantidad } : c));
  };

  const removeFromCart = (productoId) => {
    setCart(cart.filter(c => c.producto_id !== productoId));
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setPreview(URL.createObjectURL(selectedFile));
    setUploading(true);
    const formData = new FormData();
    formData.append('imagen', selectedFile);
    try {
      const res = await api.post('/api/v1/uploads/cloudinary', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data?.url) {
        setUploadedUrl(res.data.url);
        setUploadedPublicId(res.data.public_id || '');
      }
    } catch (err) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setDialog({ open: true, type: 'error', title: 'Error al subir', message: err.response?.data?.message || 'Error al subir el comprobante', onConfirm: null });
    } finally { setUploading(false); }
  };

  const removeFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null); setUploadedUrl(''); setUploadedPublicId('');
  };

  const handleSubmit = async () => {
    if (!selectedClient) {
      setDialog({ open: true, type: 'validation', title: 'Cliente requerido', message: 'Seleccione un cliente antes de crear el pedido.', onConfirm: null });
      return;
    }
    if (cart.length === 0) {
      setDialog({ open: true, type: 'validation', title: 'Carrito vacío', message: 'Agregue al menos un producto al carrito.', onConfirm: null });
      return;
    }
    setSubmitting(true);
    const payload = {
      usuario_id: selectedClient.id_usuario,
      direccion_entrega: direccion,
      notas_entrega: notas,
      comprobante_pago_url: uploadedUrl,
      comprobante_pago_public_id: uploadedPublicId,
      productos: cart.map(c => ({ producto_id: c.producto_id, cantidad: c.cantidad }))
    };
    try {
      await api.post('/api/v1/pedidos', payload);
      if (onSuccess) onSuccess();
      setDialog({ open: true, type: 'success', title: 'Pedido creado', message: 'Pedido creado correctamente.', onConfirm: () => {
        setDialog(prev => ({ ...prev, open: false }));
        internalCleanup();
        onClose();
      }});
    } catch (err) {
      setDialog({ open: true, type: 'error', title: 'Error al crear', message: err.response?.data?.message || 'Error al crear el pedido', onConfirm: null });
    } finally { setSubmitting(false); }
  };

  const internalCleanup = () => {
    if (preview) URL.revokeObjectURL(preview);
    setClientSearch(''); setSelectedClient(null); setDireccion(''); setNotas('');
    setPreview(null); setUploadedUrl(''); setUploadedPublicId('');
    setCart([]); setProductSearch(''); setSubmitting(false);
  };

  const handleClose = () => {
    if (uploadedPublicId) api.delete(`/api/v1/uploads/cloudinary/${uploadedPublicId}`).catch(() => {});
    internalCleanup();
    onClose();
  };

  const subtotal = cart.reduce((sum, c) => sum + Number(c.precio_venta) * c.cantidad, 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  if (!open) return null;

  const dropdownStyle = (open) => ({
    position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
    border: '1px solid #E5E7EB', borderRadius: '12px', zIndex: 50,
    maxHeight: '220px', overflowY: 'auto',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
  });

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)', zIndex: 99998,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }} onClick={handleClose}>
        <div style={{
          background: '#fff', borderRadius: '16px', width: '850px', maxWidth: '100%',
          maxHeight: '90vh', overflowY: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid #E5E7EB' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              Nuevo Pedido — Administrador
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px',
            padding: '24px 28px', overflowY: 'auto', overflowX: 'hidden', flex: 1
          }}>
            {/* ─── LEFT COLUMN ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ position: 'relative' }}>
                <label style={LABEL_STYLE}>Buscar Cliente *</label>
                <div style={INPUT_WRAP}>
                  <User size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Seleccionar un cliente..."
                    value={clientSearch}
                    onChange={e => handleClientSearch(e.target.value)}
                    onFocus={handleClientFocus}
                    onBlur={handleClientBlur}
                    style={{ ...INPUT_INNER, color: selectedClient ? '#111827' : undefined }}
                  />
                  {selectedClient ? (
                    <X size={14} color="#9CA3AF" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => { setSelectedClient(null); setClientSearch(''); setClientDropdownOpen(false); }} />
                  ) : (
                    <ChevronDown size={14} color="#9CA3AF" style={{ flexShrink: 0, transform: clientDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                  )}
                </div>
                {clientDropdownOpen && filteredClients.length > 0 && (
                  <div style={dropdownStyle(clientDropdownOpen)}>
                    {filteredClients.map(c => (
                      <div
                        key={c.id_usuario}
                        onClick={() => selectClient(c)}
                        style={{ height: '40px', padding: '0 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box', fontSize: '13px' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontWeight: 500, color: '#111827' }}>{c.nombre}</span>
                        <span style={{ fontSize: '11px', color: '#6B7280' }}>{c.numero_documento}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label style={LABEL_STYLE}>Dirección de Entrega</label>
                <div style={INPUT_WRAP}>
                  <MapPin size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Dirección..."
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    style={INPUT_INNER}
                  />
                </div>
              </div>

              <div>
                <label style={LABEL_STYLE}>Notas de Entrega</label>
                <div style={{ display: 'flex', alignItems: 'flex-start', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px 12px' }}>
                  <FileText size={14} color="#9CA3AF" style={{ marginTop: '5px', flexShrink: 0 }} />
                  <textarea
                    placeholder="Instrucciones de entrega..."
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    rows={3}
                    style={{ border: 'none', outline: 'none', flex: 1, padding: '4px 8px', background: 'transparent', resize: 'vertical', fontFamily: 'inherit', width: '100%', fontSize: '13px', color: '#111827' }}
                  />
                </div>
              </div>

              <div>
                <label style={LABEL_STYLE}>Comprobante de Pago</label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} style={{ display: 'none' }} />
                {!preview ? (
                  <div
                    style={{ border: '2px dashed #D1D5DB', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#F9FAFB' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={28} color="#9CA3AF" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>Haz clic para subir el comprobante</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                      <img src={preview} alt="Preview" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                      {uploading && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
                          <Loader2 size={16} style={{ animation: 'admin-spin 1s linear infinite' }} />
                        </div>
                      )}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 16px', background: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                      Subir
                    </button>
                    <button onClick={removeFile} style={{ padding: '8px', background: '#fff', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ─── RIGHT COLUMN ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ position: 'relative' }}>
                <label style={LABEL_STYLE}>Agregar Producto</label>
                <div style={INPUT_WRAP}>
                  <Package size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Elegir un producto de la lista..."
                    value={productSearch}
                    onChange={e => handleProductSearch(e.target.value)}
                    onFocus={handleProductFocus}
                    onBlur={handleProductBlur}
                    style={INPUT_INNER}
                  />
                  <ChevronDown size={14} color="#9CA3AF" style={{ flexShrink: 0, transform: productDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                </div>
                {productDropdownOpen && filteredProducts.length > 0 && (
                  <div style={dropdownStyle(productDropdownOpen)}>
                    {filteredProducts.map(p => {
                      const isOutOfStock = Number(p.stock_actual) === 0;
                      return (
                        <div
                          key={p.id_producto}
                          onClick={() => !isOutOfStock && addToCart(p)}
                          style={{
                            height: '40px', padding: '0 12px', cursor: isOutOfStock ? 'default' : 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box', fontSize: '13px',
                            pointerEvents: isOutOfStock ? 'none' : 'auto', opacity: isOutOfStock ? 0.5 : 1
                          }}
                          onMouseEnter={e => !isOutOfStock && (e.currentTarget.style.background = '#f3f4f6')}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <span style={{ fontWeight: 500, color: '#111827' }}>
                            {p.nombre} {isOutOfStock && <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 600 }}>[Agotado]</span>}
                          </span>
                          <span style={{ fontSize: '11px', color: '#6B7280' }}>
                            ${Number(p.precio_venta).toFixed(2)} (Stock: {p.stock_actual})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label style={LABEL_STYLE}>Detalle de la Transacción</label>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                  {cart.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>No hay productos agregados</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          <th style={{ padding: '8px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Producto</th>
                          <th style={{ padding: '8px', textAlign: 'center', fontWeight: 600, color: '#374151', width: '50px' }}>Cant</th>
                          <th style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: '#374151', width: '65px' }}>P. Unit</th>
                          <th style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: '#374151', width: '65px' }}>Subtotal</th>
                          <th style={{ padding: '8px', width: '30px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map(c => (
                          <tr key={c.producto_id} style={{ borderTop: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '8px' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px', display: 'inline-block' }}>{c.nombre}</span>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <input type="number" min="1" step="1" value={c.cantidad}
                                onChange={e => updateQuantity(c.producto_id, parseInt(e.target.value) || 1)}
                                style={{ width: '44px', padding: '2px 4px', textAlign: 'center', border: '1px solid #E5E7EB', borderRadius: '4px', fontSize: '13px', color: '#111827' }}
                              />
                            </td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>${Number(c.precio_venta).toFixed(2)}</td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>${(Number(c.precio_venta) * c.cantidad).toFixed(2)}</td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <button onClick={() => removeFromCart(c.producto_id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '16px', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280', fontSize: '13px' }}>Subtotal</span>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280', fontSize: '13px' }}>IVA (19%)</span>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>${iva.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E5E7EB', padding: '16px 28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={handleClose} style={{
              height: '42px', padding: '0 24px', borderRadius: '24px', border: '1px solid #D1D5DB',
              background: '#fff', color: '#111827', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s'
            }}>Cancelar</button>
            <button onClick={handleSubmit} disabled={submitting} style={{
              height: '42px', padding: '0 24px', borderRadius: '24px', border: 'none',
              background: submitting ? '#6B7280' : '#111827', color: '#fff', fontSize: '13px',
              fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s'
            }}>
              {submitting && <Loader2 size={16} style={{ animation: 'admin-spin 1s linear infinite' }} />}
              {submitting ? 'Creando...' : 'Crear Pedido'}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes admin-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <CustomDialog
        type={dialog.type}
        open={dialog.open}
        onClose={() => setDialog(prev => ({ ...prev, open: false }))}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
      />
    </>
  );
};

export default AdminCheckoutModal;
