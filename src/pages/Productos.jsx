import { useState, useEffect, useRef } from 'react';
import api from '../api';
import CustomDialog from '../components/ui/CustomDialog';
import { Pencil, Trash2, Package, ShoppingCart, Info, Upload, X, Search, AlertCircle, Filter, Plus, Tags } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useModalScroll } from '../hooks/useModalScroll';

const formatCOP = (valor) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor);

const URL_API        = "/api/v1/productos";
const URL_API_PUBLIC = "/api/v1/productos/publico";
const URL_CATEGORIAS = "/api/v1/categorias";
const URL_PROVEEDORES = "/api/v1/proveedores";

const ProductoImagen = ({ src, alt, style = {}, iconSize = 56 }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#f1f5f9', width: '100%', height: '100%', ...style }}>
        <Package size={iconSize} color="#94a3b8" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', ...style }}
    />
  );
};

const Productos = ({ variant }) => {
  const [productos, setProductos]           = useState([]);
  const [categoriasList, setCategoriasList] = useState([]);
  const [proveedoresList, setProveedoresList] = useState([]);
  const [showModal, setShowModal]           = useState(false);
  const [enEdicion, setEnEdicion]           = useState(false);
  const [loading, setLoading]               = useState(true);
  const [guardando, setGuardando]           = useState(false);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addToCart } = useCart();
  const isAdminView   = variant === 'admin' || !variant;
  useModalScroll(showModal || showDetailModal);

  const [searchTerm, setSearchTerm]     = useState("");
  const [filterEstado, setFilterEstado]  = useState("ALL");
  const [filterCategoria, setFilterCategoria] = useState("ALL");

  const [idProducto, setIdProducto]     = useState(null);
  const [categoriaId, setCategoriaId]   = useState("");
  const [proveedorId, setProveedorId]   = useState("");
  const [nombre, setNombre]             = useState("");
  const [descripcion, setDescripcion]   = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta]   = useState("");
  const [stockActual, setStockActual]   = useState("");
  const [stockMinimo, setStockMinimo]   = useState("");
  const [activo, setActivo]             = useState(1);

  const [fieldErrors, setFieldErrors] = useState({});
  const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;

  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '' });

  const closeDialog = () => setDialog(prev => ({ ...prev, open: false }));

  const [imagenFile, setImagenFile]       = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenUrlActual, setImagenUrlActual] = useState(null);
  const fileInputRef = useRef(null);

  const handleNameKeyDown = (e) => {
    if (e.key.length === 1 && !NAME_REGEX.test(e.key)) e.preventDefault();
  };

  const handleNamePaste = (e) => {
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    if (!NAME_REGEX.test(pasted)) e.preventDefault();
  };

  const handleNumericKeyDown = (e) => {
    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') e.preventDefault();
  };

  const handleIntegerKeyDown = (e) => {
    if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-' || e.key === '.') e.preventDefault();
  };

  const validateField = (field, value) => {
    let error = '';
    if (field === 'nombre' && value.trim().length > 0 && !NAME_REGEX.test(value)) error = 'Solo letras y espacios';
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return error;
  };

  const listar = () => {
    setLoading(true);
    const endpoint = isAdminView ? URL_API : URL_API_PUBLIC;
    api.get(endpoint)
      .then(res => setProductos(res.data))
      .catch(err => console.error("Error al listar productos:", err))
      .finally(() => setLoading(false));
  };

  const listarDependencias = () => {
    if (!isAdminView) return;
    api.get(URL_CATEGORIAS).then(res => setCategoriasList(res.data)).catch(console.error);
    api.get(URL_PROVEEDORES).then(res => setProveedoresList(res.data)).catch(console.error);
  };

  useEffect(() => {
    listar();
    listarDependencias();
  }, [isAdminView]);

  const verDetalles = (p) => {
    setSelectedProduct(p);
    setShowDetailModal(true);
  };

  const limpiarFormulario = () => {
    setCategoriaId(""); setProveedorId(""); setNombre(""); setDescripcion("");
    setPrecioCompra(""); setPrecioVenta(""); setStockActual(""); setStockMinimo("");
    setActivo(1); setEnEdicion(false); setIdProducto(null);
    setImagenFile(null); setImagenPreview(null); setImagenUrlActual(null);
    setFieldErrors({});
    setShowModal(false);
  };

  const abrirRegistro = () => {
    limpiarFormulario();
    const nextId = productos.length > 0 ? Math.max(...productos.map(p => p.id_producto)) + 1 : 1;
    setIdProducto(nextId);
    setShowModal(true);
  };

  const seleccionarProducto = (p) => {
    setIdProducto(p.id_producto);
    setCategoriaId(p.categoria_id || "");
    setProveedorId(p.proveedor_id || "");
    setNombre(p.nombre);
    setDescripcion(p.descripcion || "");
    setPrecioCompra(String(p.precio_compra));
    setPrecioVenta(String(p.precio_venta));
    setStockActual(String(p.stock_actual));
    setStockMinimo(String(p.stock_minimo));
    setActivo(p.activo);
    setImagenFile(null);
    setImagenUrlActual(p.imagen_url || null);
    setImagenPreview(p.imagen_url || null);
    setEnEdicion(true);
    setShowModal(true);
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagenFile(file);
    const blobUrl = URL.createObjectURL(file);
    setImagenPreview(blobUrl);
  };

  const quitarImagen = () => {
    setImagenFile(null);
    setImagenPreview(null);
    setImagenUrlActual(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const guardar = async () => {
    const errNombre = validateField('nombre', nombre);
    if (errNombre) return;

    const errors = [];
    if (!nombre || !nombre.trim()) errors.push('El nombre del producto es obligatorio.');
    if (!categoriaId) errors.push('La categoría es obligatoria.');
    if (parseFloat(precioVenta) < parseFloat(precioCompra)) errors.push('El precio de venta debe ser mayor o igual al precio de compra.');

    if (errors.length > 0) {
      setDialog({ open: true, type: 'validation', title: 'Revisar información', message: '', errors });
      return;
    }

    setGuardando(true);

    const formData = new FormData();
    formData.append('categoria_id',  categoriaId || '');
    formData.append('proveedor_id',  proveedorId || '');
    formData.append('nombre',        nombre);
    formData.append('descripcion',   descripcion || '');
    formData.append('precio_compra', parseFloat(precioCompra));
    formData.append('precio_venta',  parseFloat(precioVenta));
    formData.append('stock_actual',  parseInt(stockActual, 10));
    formData.append('stock_minimo',  parseInt(stockMinimo, 10));
    formData.append('activo',        activo);

    if (imagenFile) {
      formData.append('imagen', imagenFile);
    } else if (imagenUrlActual) {
      formData.append('imagen_url', imagenUrlActual);
    }

    try {
      if (enEdicion) {
        await api.put(`${URL_API}/${idProducto}`, formData);
      } else {
        await api.post(URL_API, formData);
      }
      limpiarFormulario();
      listar();
      setDialog({ open: true, type: 'success', title: 'Operación exitosa', message: 'El registro ha sido almacenado de manera segura en la base de datos y actualizado en los listados generales.' });
    } catch (err) {
      console.error("Error al guardar:", err);
      const status = err.response?.status;
      let errorMsg = err.response?.data?.message || err.message;
      if (status === 409) {
        errorMsg = '⚠️ ' + errorMsg;
      }
      setDialog({ open: true, type: 'error', title: status === 409 ? 'Nombre duplicado' : 'Error en la operación', message: errorMsg });
    } finally {
      setGuardando(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = (id) => {
    setDeleteTarget(id);
    setDialog({ open: true, type: 'confirm', title: 'Confirmar eliminación', message: '¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.' });
  };

  const ejecutarEliminar = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`${URL_API}/${deleteTarget}`);
      listar();
      closeDialog();
      setDeleteTarget(null);
      setDialog({ open: true, type: 'success', title: 'Operación exitosa', message: 'El registro ha sido eliminado correctamente.' });
    } catch (err) {
      console.error("Error al eliminar:", err);
      closeDialog();
      setDeleteTarget(null);
      setDialog({ open: true, type: 'error', title: 'Error en la operación', message: 'No se puede eliminar el producto. Razón: Este elemento se encuentra vinculado activamente a otras transacciones o históricos dentro del sistema. Se recomienda cambiar su estado a "Inactivo" en su lugar.' });
    }
  };

  const filteredProductos = productos.filter(p => {
    if (filterEstado === 'ACTIVE' && !p.activo) return false;
    if (filterEstado === 'INACTIVE' && p.activo) return false;
    if (filterCategoria !== 'ALL' && Number(p.categoria_id) !== Number(filterCategoria)) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (p.nombre && p.nombre.toLowerCase().includes(term))
        || (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(term))
        || (p.proveedor_nombre && p.proveedor_nombre.toLowerCase().includes(term));
  });

  const displayItems = filteredProductos;

  const precioVentaVal = parseFloat(precioVenta);
  const precioCompraVal = parseFloat(precioCompra);
  const precioInvalido = !isNaN(precioVentaVal) && !isNaN(precioCompraVal) && precioCompraVal > 0 && precioVentaVal < precioCompraVal;

  if (!isAdminView) {
    return (
      <div className="storefront-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 className="module-title-table" style={{ margin: 0, fontSize: '1.5rem' }}>Resultados de búsqueda</h1>
          <div className="search-bar-input-wrap" style={{ maxWidth: 320 }}>
            <Search size={16} className="search-bar-icon" />
            <input
              type="text"
              className="search-bar-input"
              placeholder="Buscar por nombre, categoría o proveedor..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); }}
            />
            {searchTerm && (
              <button className="search-bar-clear" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="storefront-list">
          {displayItems.map(p => (
            <div key={p.id_producto} className="product-horizontal-card">
              <div className="product-row-header">
                <h2 className="product-hc-title" style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => verDetalles(p)}>
                  {p.nombre}
                </h2>
              </div>

              <div className="product-body-split">
                <div
                  className="product-hc-left"
                  onClick={() => verDetalles(p)}
                  style={{ cursor: 'pointer', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}
                >
                  <ProductoImagen src={p.imagen_url} alt={p.nombre} iconSize={56} />
                </div>

                <div className="product-hc-center">
                  {p.proveedor_nombre && (
                    <div className="badge-brand" style={{ background: '#e2e8f0', border: 'none' }}>
                      {p.proveedor_nombre}
                    </div>
                  )}
                  <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                    {p.descripcion ? p.descripcion.substring(0, 100) + '...' : 'Sin descripción detallada.'}
                  </p>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Categoría: <strong>{p.categoria_nombre || 'General'}</strong>
                  </div>
                  <button
                    onClick={() => verDetalles(p)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}
                  >
                    <Info size={14} /> Ver ficha técnica
                  </button>
                </div>

                <div className="product-hc-right" style={{ justifyContent: 'center' }}>
                  <div className="pricing-block">
                    <div className="precio-final">{formatCOP(p.precio_venta)}</div>
                  </div>
                  {p.stock_actual > 0 ? (
                    <button className="btn-add-red" onClick={() => addToCart(p)}>
                      <ShoppingCart size={22} />
                    </button>
                  ) : (
                    <button className="btn-add-red" disabled>Agotado</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showDetailModal && selectedProduct && (
          <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
            <div className="modal-box detail-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
              <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>Ficha Técnica del Producto</h2>
                <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '25px', marginTop: '20px' }}>
                <div style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden', minHeight: '200px' }}>
                  <ProductoImagen src={selectedProduct.imagen_url} alt={selectedProduct.nombre} iconSize={100} />
                </div>

                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#0f172a' }}>{selectedProduct.nombre}</h1>
                    {selectedProduct.codigo_serie && (
                      <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>
                        #{selectedProduct.codigo_serie}
                      </div>
                    )}
                    <div style={{ display: 'inline-block', padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '15px' }}>
                      {selectedProduct.categoria_nombre || 'General'}
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px' }}>
                      {formatCOP(selectedProduct.precio_venta)}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>
                      IVA {selectedProduct.iva_porcentaje || '19%'} • Precio con IVA: <strong>{selectedProduct.precio_con_iva ? formatCOP(selectedProduct.precio_con_iva) : ''}</strong>
                    </div>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>Descripción completa</h4>
                    <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>{selectedProduct.descripcion || 'No hay descripción disponible para este artículo.'}</p>
                  </div>
                  <div style={{ padding: '15px', background: '#f1f5f9', borderRadius: '8px' }}>
                    <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', marginBottom: '10px' }}>Información Técnica</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: '#334155' }}>
                      <li style={{ marginBottom: '6px' }}>• <strong>ID de Producto:</strong> #{selectedProduct.id_producto}</li>
                      <li style={{ marginBottom: '6px' }}>• <strong>Disponibilidad:</strong> {selectedProduct.stock_actual} unidades</li>
                      <li style={{ marginBottom: '6px' }}>• <strong>Proveedor:</strong> {selectedProduct.proveedor_nombre || 'No especificado'}</li>
                      <li>• <strong>Garantía:</strong> 6 meses con el fabricante</li>
                      {selectedProduct.ubicacion && (
                        <li style={{ marginBottom: '6px' }}>• <strong>Ubicación:</strong> {selectedProduct.ubicacion}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="modal-btns" style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>Cerrar</button>
                <button
                  className="btn-save"
                  onClick={() => { addToCart(selectedProduct); setShowDetailModal(false); }}
                  disabled={selectedProduct.stock_actual <= 0}
                >
                  {selectedProduct.stock_actual > 0 ? 'Añadir al Carrito' : 'Agotado'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', height: '42px', padding: '0 12px', boxSizing: 'border-box' }}>
          <Search size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nombre, categoría o proveedor..." style={{ border: 'none', outline: 'none', flex: 1, padding: '0 8px', background: 'transparent', height: '100%', fontSize: '13px', color: '#111827', width: '100%' }} />
          {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}><X size={14} color="#9CA3AF" /></button>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', height: '42px', padding: '0 8px 0 12px', width: '180px', flexShrink: 0, boxSizing: 'border-box' }}>
          <Tags size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <select value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)} style={{ border: 'none', outline: 'none', flex: 1, padding: '0 4px', background: 'transparent', height: '100%', fontSize: '13px', color: '#111827', cursor: 'pointer' }}>
            <option value="ALL">Todas las categorías</option>
            {categoriasList.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', height: '42px', padding: '0 8px 0 12px', width: '160px', flexShrink: 0, boxSizing: 'border-box' }}>
          <Filter size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ border: 'none', outline: 'none', flex: 1, padding: '0 4px', background: 'transparent', height: '100%', fontSize: '13px', color: '#111827', cursor: 'pointer' }}>
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
        <button onClick={abrirRegistro} style={{ height: '42px', padding: '0 24px', borderRadius: '9999px', border: 'none', background: '#111827', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
          <Plus size={16} /> Añadir Producto
        </button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem' }}>Cargando datos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Package size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
            <h2>No hay productos registrados</h2>
            <p>Haz clic en "Registrar Producto" para comenzar.</p>
          </div>
        ) : (
          <table className="styled-table" style={{ fontSize: '0.9rem' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th>Stock</th>
                <th>Precio Venta</th>
                <th>IVA</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((p) => (
                <tr key={p.id_producto}>
                  <td>{p.id_producto}</td>
                  <td>
                    <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden' }}>
                      <ProductoImagen src={p.imagen_url} alt={p.nombre} iconSize={24} />
                    </div>
                  </td>
                  <td>
                    <div>{p.nombre}</div>
                    {p.codigo_serie && (
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>
                        {p.codigo_serie}
                      </div>
                    )}
                  </td>
                  <td>{p.categoria_nombre}</td>
                  <td>{p.proveedor_nombre || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Ninguno</span>}</td>
                  <td>
                    <span style={{
                      color: p.stock_actual <= p.stock_minimo ? 'var(--danger)' : 'inherit',
                      fontWeight: p.stock_actual <= p.stock_minimo ? 'bold' : 'normal'
                    }}>
                      {p.stock_actual}
                    </span>
                  </td>
                  <td>{formatCOP(p.precio_venta)}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.iva_porcentaje || '19%'}</span>
                    <br />
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.precio_con_iva ? formatCOP(p.precio_con_iva) : ''}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: p.ubicacion ? '#334155' : '#94a3b8' }}>
                      {p.ubicacion || 'Sin ubicación'}
                    </span>
                  </td>
                  <td>
                    <button className={`status-toggle ${p.activo ? 'is-active' : 'is-inactive'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => seleccionarProducto(p)}>
                      <Pencil size={18} color="var(--primary)" />
                    </button>
                    <button className="btn-icon" onClick={() => confirmDelete(p.id_producto)}>
                      <Trash2 size={18} color="var(--danger)" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {displayItems.length > 20 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          {displayItems.length} registros en total
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '850px', overflowX: 'hidden', boxSizing: 'border-box', padding: '24px' }}>
            <h2 style={{ marginBottom: '24px' }}>{enEdicion ? "Actualizar Producto" : "Nuevo Producto"}</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px 32px',
              boxSizing: 'border-box',
              width: '100%',
            }}>
              {/* ── COLUMNA IZQUIERDA ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box', width: '100%' }}>
                {/* ID + Nombre */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', width: '100%' }}>
                  <div className="input-field" style={{ width: '80px', flexShrink: 0 }}>
                    <label>ID</label>
                    <input type="text" value={idProducto || ''} disabled style={{ background: '#E5E7EB', cursor: 'not-allowed', width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div className="input-field" style={{ flex: 1, minWidth: 0 }}>
                    <label>Nombre del Producto *</label>
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      onKeyDown={handleNameKeyDown}
                      onPaste={handleNamePaste}
                      onBlur={() => validateField('nombre', nombre)}
                      placeholder="Ej: Laptop HP ProBook"
                      style={{ borderColor: fieldErrors.nombre ? '#EF4444' : undefined, borderWidth: fieldErrors.nombre ? '2px' : undefined, width: '100%', boxSizing: 'border-box' }}
                    />
                    {fieldErrors.nombre && (
                      <span style={{ color: '#EF4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <AlertCircle size={14} /> {fieldErrors.nombre}
                      </span>
                    )}
                  </div>
                </div>

                {/* Categoría + Proveedor */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                  <div className="input-field">
                    <label>Categoría *</label>
                    <select value={categoriaId} onChange={(e) => setCategoriaId(Number(e.target.value))} style={{ width: '100%', boxSizing: 'border-box' }}>
                      <option value="" disabled>Seleccione categoría...</option>
                      {categoriasList.map(c => (
                        <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-field">
                    <label>Proveedor</label>
                    <select value={proveedorId} onChange={(e) => setProveedorId(Number(e.target.value))} style={{ width: '100%', boxSizing: 'border-box' }}>
                      <option value="">Ninguno / Sin definir</option>
                      {proveedoresList.map(pr => (
                        <option key={pr.id_proveedor} value={pr.id_proveedor}>{pr.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Precio Compra + Precio Venta */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                  <div className="input-field">
                    <label>Precio Compra</label>
                    <input
                      type="number" step="0.01" min="0"
                      value={precioCompra}
                      onChange={(e) => setPrecioCompra(e.target.value)}
                      onKeyDown={handleNumericKeyDown}
                      placeholder="0.00"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div className="input-field">
                    <label>Precio Venta</label>
                    <input
                      type="number" step="0.01" min="0"
                      value={precioVenta}
                      onChange={(e) => setPrecioVenta(e.target.value)}
                      onKeyDown={handleNumericKeyDown}
                      placeholder="0.00"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        borderColor: precioInvalido ? '#EF4444' : undefined,
                        borderWidth: precioInvalido ? '2px' : undefined,
                      }}
                    />
                    {precioInvalido && (
                      <span style={{ color: '#EF4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <AlertCircle size={14} /> El precio de venta debe ser mayor o igual al de compra
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── COLUMNA DERECHA ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box', width: '100%' }}>
                {/* Imagen Dropzone */}
                <div className="input-field">
                  <label>Imagen del Producto</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden',
                      border: '2px dashed #cbd5e1', flexShrink: 0, background: '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {imagenPreview
                        ? <img src={imagenPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Package size={24} color="#94a3b8" />
                      }
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label
                        htmlFor="input-imagen"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                          fontSize: '0.85rem', color: '#111827', fontWeight: 600,
                          width: 'fit-content'
                        }}
                      >
                        <Upload size={14} />
                        SUBIR IMAGEN
                      </label>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        JPG, PNG o WEBP • Máx. 5MB
                      </span>
                      {imagenPreview && (
                        <button
                          onClick={quitarImagen}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.8rem', padding: 0, width: 'fit-content' }}
                        >
                          <X size={12} /> Quitar imagen
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="input-imagen"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImagenChange}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Stock Actual + Stock Mínimo */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
                  <div className="input-field">
                    <label>Stock Actual</label>
                    <input
                      type="number" min="0" step="1"
                      value={stockActual}
                      onChange={(e) => setStockActual(e.target.value)}
                      onKeyDown={handleIntegerKeyDown}
                      placeholder="0"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div className="input-field">
                    <label>Stock Mínimo</label>
                    <input
                      type="number" min="0" step="1"
                      value={stockMinimo}
                      onChange={(e) => setStockMinimo(e.target.value)}
                      onKeyDown={handleIntegerKeyDown}
                      placeholder="0"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="input-field">
                  <label>Descripción</label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      style={{ width: '100%', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}
                      placeholder="Breve descripción del producto..."
                    />
                </div>

                {/* Estado */}
                <div className="input-field">
                  <label>Estado</label>
                  <select value={activo} onChange={(e) => setActivo(Number(e.target.value))} style={{ width: '100%', boxSizing: 'border-box' }}>
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-btns" style={{ borderTop: '1px solid #E5E7EB', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn-cancel" onClick={limpiarFormulario} disabled={guardando}>Cancelar</button>
              <button
                className="btn-save"
                onClick={guardar}
                disabled={guardando || precioInvalido}
                style={{ opacity: guardando || precioInvalido ? 0.6 : 1 }}
              >
                {guardando ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff', borderWidth: '2px' }} /> Guardando...
                  </span>
                ) : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomDialog
        type={dialog.type}
        open={dialog.open}
        onClose={closeDialog}
        onConfirm={dialog.type === 'confirm' ? ejecutarEliminar : closeDialog}
        title={dialog.title}
        message={dialog.type !== 'validation' ? dialog.message : undefined}
      >
        {dialog.type === 'validation' && dialog.errors && (
          <ul className="cd-error-list">
            {dialog.errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        )}
      </CustomDialog>
    </>
  );
};

export default Productos;
