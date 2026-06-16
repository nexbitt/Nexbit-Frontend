// ============================================================
// PASO 7: frontend/src/pages/Productos.jsx  (REEMPLAZAR COMPLETO)
// Cambios:
//  - Estado `imagenFile` y `imagenPreview` para manejar la imagen
//  - guardar() usa FormData en vez de JSON (necesario para enviar archivos)
//  - Vista cliente muestra <img> real con fallback al ícono Package
//  - Modal de administrador incluye campo para subir/cambiar imagen
// ============================================================

/**
 * @file Productos.jsx
 * @description Vista del catálogo de productos. Soporta modos Admin, Cliente e Invitado.
 * Gestiona la visualización, creación y edición de productos con soporte para imágenes.
 */
import { useState, useEffect } from 'react';
import api from '../api';
import SearchBar from '../components/SearchBar';
import { Pencil, Trash2, Package, ShoppingCart, Info, Upload, X, Search, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useModalScroll } from '../hooks/useModalScroll';

const formatCOP = (valor) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor);

const URL_API        = "/api/productos";
const URL_API_PUBLIC = "/api/productos/publico";
const URL_CATEGORIAS = "/api/categorias";
const URL_PROVEEDORES = "/api/proveedores";

// ── Componente de imagen con fallback al ícono ───────────────
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

  // Ficha técnica (RF005)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { addToCart } = useCart();
  const isAdminView   = variant === 'admin' || !variant;
  useModalScroll(showModal || showDetailModal);

  // Búsqueda y filtros
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterEstado, setFilterEstado] = useState("ALL");
  

  // Campos del formulario
  const [idProducto, setIdProducto]     = useState(null);
  const [categoriaId, setCategoriaId]   = useState("");
  const [proveedorId, setProveedorId]   = useState("");
  const [nombre, setNombre]             = useState("");
  const [descripcion, setDescripcion]   = useState("");
  const [precioCompra, setPrecioCompra] = useState(0);
  const [precioVenta, setPrecioVenta]   = useState(0);
  const [stockActual, setStockActual]   = useState(0);
  const [stockMinimo, setStockMinimo]   = useState(0);
  const [activo, setActivo]             = useState(1);

  const [fieldErrors, setFieldErrors] = useState({});
  const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/;

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

  // ── NUEVO: estados para la imagen ───────────────────────────
  const [imagenFile, setImagenFile]       = useState(null);    // Archivo seleccionado
  const [imagenPreview, setImagenPreview] = useState(null);    // URL previa (blob o cloudinary)
  const [imagenUrlActual, setImagenUrlActual] = useState(null); // URL ya guardada en BD

  const listar = () => {
    setLoading(true);
    // Invitados y clientes usan el endpoint público (sin token)
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
    setPrecioCompra(0); setPrecioVenta(0); setStockActual(0); setStockMinimo(0);
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
    setPrecioCompra(p.precio_compra);
    setPrecioVenta(p.precio_venta);
    setStockActual(p.stock_actual);
    setStockMinimo(p.stock_minimo);
    setActivo(p.activo);
    // ── NUEVO: cargar imagen actual ──────────────────────────
    setImagenFile(null);
    setImagenUrlActual(p.imagen_url || null);
    setImagenPreview(p.imagen_url || null);
    // ─────────────────────────────────────────────────────────
    setEnEdicion(true);
    setShowModal(true);
  };

  // ── NUEVO: handler para selección de archivo ─────────────
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagenFile(file);
    // Mostrar preview local antes de subir
    const blobUrl = URL.createObjectURL(file);
    setImagenPreview(blobUrl);
  };

  const quitarImagen = () => {
    setImagenFile(null);
    setImagenPreview(null);
    setImagenUrlActual(null);
  };

  // ── NUEVO: guardar usa FormData para enviar el archivo ───
  const guardar = async () => {
    const errNombre = validateField('nombre', nombre);
    if (errNombre) return;

    if (!nombre || !categoriaId) {
      alert("El nombre y la categoría son obligatorios");
      return;
    }

    setGuardando(true);

    // FormData permite enviar texto + archivo en la misma petición
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
      // Si hay un archivo nuevo, adjuntarlo con el campo "imagen"
      // (debe coincidir con upload.single('imagen') en la ruta)
      formData.append('imagen', imagenFile);
    } else if (imagenUrlActual) {
      // Si no cambió la imagen, mandar la URL actual para que no se borre
      formData.append('imagen_url', imagenUrlActual);
    }
    // Si no hay imagen y tampoco URL actual, no se manda nada → imagen_url queda null

    try {
      if (enEdicion) {
        await api.put(`${URL_API}/${idProducto}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert("Producto actualizado correctamente.");
      } else {
        await api.post(URL_API, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert("Producto creado con éxito.");
      }
      limpiarFormulario();
      listar();
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al guardar: " + (err.response?.data?.message || err.message));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = (id) => {
    if (window.confirm("¿Confirmar eliminación de este registro?")) {
      api.delete(`${URL_API}/${id}`)
        .then(() => listar())
        .catch(err => {
          console.error("Error al eliminar:", err);
          alert("No se puede eliminar el producto. Detalle: " + (err.response?.data?.error || err.message));
        });
    }
  };

  const filteredProductos = productos.filter(p => {
    if (filterEstado === 'ACTIVE' && !p.activo) return false;
    if (filterEstado === 'INACTIVE' && p.activo) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (p.nombre && p.nombre.toLowerCase().includes(term))
        || (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(term))
        || (p.proveedor_nombre && p.proveedor_nombre.toLowerCase().includes(term));
  });

  const displayItems = filteredProductos;

  // ── VISTA CLIENTE / INVITADO ─────────────────────────────
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
                {/* ── Imagen real o ícono de fallback ── */}
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

        {/* MODAL FICHA TÉCNICA (RF005) */}
        {showDetailModal && selectedProduct && (
          <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
            <div className="modal-box detail-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
              <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>Ficha Técnica del Producto</h2>
                <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '25px', marginTop: '20px' }}>
                {/* ── Imagen grande en la ficha técnica ── */}
                <div style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden', minHeight: '200px' }}>
                  <ProductoImagen src={selectedProduct.imagen_url} alt={selectedProduct.nombre} iconSize={100} />
                </div>

                <div>
                  <h1 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#0f172a' }}>{selectedProduct.nombre}</h1>
                  <div style={{ display: 'inline-block', padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '15px' }}>
                    {selectedProduct.categoria_nombre || 'General'}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px' }}>
                    {formatCOP(selectedProduct.precio_venta)}
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

  // ── VISTA ADMINISTRADOR ──────────────────────────────────
  return (
    <>
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>Añadir Producto</button>
        <SearchBar
          value={searchTerm}
          onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
          placeholder="Buscar por nombre, categoría o proveedor..."
          filters={[
            { key: 'estado', label: 'Todos los estados', options: [
              { value: 'ACTIVE', label: 'Activos' },
              { value: 'INACTIVE', label: 'Inactivos' }
            ]}
          ]}
          filterValues={{ estado: filterEstado }}
          onFilterChange={(key, val) => setFilterEstado(val)}
          onClear={() => { setSearchTerm(''); setFilterEstado('ALL'); setCurrentPage(1); }}
        />
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
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((p) => (
                <tr key={p.id_producto}>
                  <td>{p.id_producto}</td>
                  {/* ── Thumbnail de imagen en la tabla ── */}
                  <td>
                    <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden' }}>
                      <ProductoImagen src={p.imagen_url} alt={p.nombre} iconSize={24} />
                    </div>
                  </td>
                  <td>{p.nombre}</td>
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
                    <button className={`status-toggle ${p.activo ? 'is-active' : 'is-inactive'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => seleccionarProducto(p)}>
                      <Pencil size={18} color="var(--primary)" />
                    </button>
                    <button className="btn-icon" onClick={() => eliminar(p.id_producto)}>
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

      {/* ── MODAL ADMINISTRADOR ─────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '620px' }}>
            <h2>{enEdicion ? "Actualizar Producto" : "Nuevo Producto"}</h2>
            <div className="form-grid">
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>ID</label>
                <input type="text" value={idProducto || ''} disabled style={{ background: 'var(--border)', cursor: 'not-allowed' }} />
              </div>
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>Nombre del Producto *</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  onPaste={handleNamePaste}
                  onBlur={() => validateField('nombre', nombre)}
                  style={{ borderColor: fieldErrors.nombre ? '#EF4444' : undefined, borderWidth: fieldErrors.nombre ? '2px' : undefined }}
                />
                {fieldErrors.nombre && (
                  <span style={{ color: '#EF4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <AlertCircle size={14} /> {fieldErrors.nombre}
                  </span>
                )}
              </div>

              <div className="input-field">
                <label>Categoría *</label>
                <select value={categoriaId} onChange={(e) => setCategoriaId(Number(e.target.value))}>
                  <option value="" disabled>Seleccione categoría...</option>
                  {categoriasList.map(c => (
                    <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="input-field">
                <label>Proveedor</label>
                <select value={proveedorId} onChange={(e) => setProveedorId(Number(e.target.value))}>
                  <option value="">Ninguno / Sin definir</option>
                  {proveedoresList.map(pr => (
                    <option key={pr.id_proveedor} value={pr.id_proveedor}>{pr.nombre}</option>
                  ))}
                </select>
              </div>

              {/* ── NUEVO: Campo de imagen ──────────────────── */}
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>Imagen del Producto</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Preview */}
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden',
                    border: '2px dashed #cbd5e1', flexShrink: 0, background: '#f8fafc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {imagenPreview
                      ? <img src={imagenPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Package size={36} color="#94a3b8" />
                    }
                  </div>

                  {/* Controles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <label
                      htmlFor="input-imagen"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1',
                        background: '#f8fafc', fontSize: '0.85rem', color: '#475569',
                        width: 'fit-content'
                      }}
                    >
                      <Upload size={16} />
                      {imagenPreview ? 'Cambiar imagen' : 'Subir imagen'}
                    </label>
                    <input
                      id="input-imagen"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImagenChange}
                      style={{ display: 'none' }}
                    />
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                      JPG, PNG o WEBP · Máx. 5MB
                    </p>
                    {imagenPreview && (
                      <button
                        onClick={quitarImagen}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          background: 'none', border: 'none', color: 'var(--danger)',
                          cursor: 'pointer', fontSize: '0.82rem', padding: 0
                        }}
                      >
                        <X size={14} /> Quitar imagen
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* ─────────────────────────────────────────────── */}

              <div className="input-field">
                <label>Precio Compra</label>
                <input type="number" step="0.01" min="0" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} onKeyDown={handleNumericKeyDown} />
              </div>

              <div className="input-field">
                <label>Precio Venta</label>
                <input type="number" step="0.01" min="0" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} onKeyDown={handleNumericKeyDown} />
              </div>

              <div className="input-field">
                <label>Stock Actual</label>
                <input type="number" min="0" value={stockActual} onChange={(e) => setStockActual(e.target.value)} onKeyDown={handleIntegerKeyDown} />
              </div>

              <div className="input-field">
                <label>Stock Mínimo</label>
                <input type="number" min="0" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} onKeyDown={handleIntegerKeyDown} />
              </div>

              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>Estado</label>
                <select value={activo} onChange={(e) => setActivo(Number(e.target.value))}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="modal-btns">
              <button className="btn-cancel" onClick={limpiarFormulario} disabled={guardando}>Cancelar</button>
              <button className="btn-save" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Productos;
