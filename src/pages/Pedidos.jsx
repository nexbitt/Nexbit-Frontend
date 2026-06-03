/**
 * @file Pedidos.jsx
 * @description Gestión de pedidos para Administradores y Clientes.
 * Incluye visualización de detalles, generación de tickets y gestión de estados.
 */
import { useState, useEffect } from 'react';
import api from '../api';
import { Pencil, Trash2, ShoppingCart, Download, Eye, X, Package, AlertTriangle, Upload, CheckCircle, XCircle, AlertCircle, FileImage, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModalScroll } from '../hooks/useModalScroll';
import ChatModal from '../components/ChatModal';

const URL_API = "/api/pedidos";
const URL_USUARIOS = "/api/usuarios";

const Pedidos = ({ variant }) => {
  const [pedidos, setPedidos] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [enEdicion, setEnEdicion] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal de detalle de pedido
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  // Upload comprobante
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadPedidoId, setUploadPedidoId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  // Admin: chat con cliente
  const [showChat, setShowChat] = useState(false);
  const [chatPedidoId, setChatPedidoId] = useState(null);

  // Admin: comentarios en modal detalle
  const [adminComment, setAdminComment] = useState('');
  const [commentSending, setCommentSending] = useState(false);

  const navigate = useNavigate();
  const isAdminView = variant === 'admin' || !variant;
  const isGuestView = variant === 'guest';
  useModalScroll(showModal || showDetailModal || showUploadModal);

  // Paginación y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("usuario_nombre");
  const [currentPage, setCurrentPage] = useState(1);
  const [alertaModal, setAlertaModal] = useState(null);
  const itemsPerPage = 5;

  // Campos del formulario
  const [idPedido, setIdPedido] = useState(null);
  const [usuarioId, setUsuarioId] = useState("");
  const [total, setTotal] = useState(0);
  const [estado, setEstado] = useState('PENDIENTE');

  const listar = () => {
    setLoading(true);
    api.get(URL_API)
      .then(res => setPedidos(res.data))
      .catch(err => console.error("Error al listar pedidos:", err))
      .finally(() => setLoading(false));
  };

  const listarUsuarios = () => {
    if (!isAdminView) return;
    api.get(URL_USUARIOS)
      .then(res => setUsuariosList(res.data))
      .catch(err => console.error("Error al listar usuarios:", err));
  };

  // ── Ver detalles de un pedido en modal ──────────────────────────
  const verDetalles = async (pedidoId) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      const res = await api.get(`${URL_API}/${pedidoId}/ticket`);
      setPedidoDetalle(res.data);
    } catch (err) {
      console.error('Error cargando detalles:', err);
      alert('No se pudieron cargar los detalles del pedido.');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // --- LÓGICA RF011: Cancelación para el Cliente ---
  const cancelarMiPedido = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
      try {
        await api.put(`${URL_API}/${id}/cancelar`);
        listar(); // Refrescamos la lista automáticamente
        alert("Pedido cancelado correctamente.");
      } catch (err) {
        alert(err.response?.data?.message || "Error al cancelar");
      }
    }
  };

  const limpiarFormulario = () => {
    setUsuarioId(""); setTotal(0); setEstado('PENDIENTE');
    setEnEdicion(false); setIdPedido(null);
    setShowModal(false);
  };

  const abrirRegistro = () => {
    limpiarFormulario();
    const nextId = pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id_pedido)) + 1 : 1;
    setIdPedido(nextId);
    setShowModal(true);
  };

  const seleccionarPedido = (p) => {
    setIdPedido(p.id_pedido);
    setUsuarioId(p.usuario_id);
    setTotal(p.total);
    setEstado(p.estado);
    setEnEdicion(true);
    setShowModal(true);
  };

  const guardar = () => {
    const datos = {
      usuario_id: usuarioId,
      total: parseFloat(total),
      estado
    };

    if (!usuarioId && !enEdicion) {
      alert("El usuario es obligatorio para crear un pedido");
      return;
    }

    if (enEdicion) {
      api.put(`${URL_API}/${idPedido}`, datos)
        .then(() => {
          limpiarFormulario();
          listar();
          alert("Pedido actualizado correctamente.");
        })
        .catch(err => {
          console.error("Error interno:", err);
          alert("Error al actualizar: " + (err.response?.data?.message || err.message));
        });
    } else {
      api.post(URL_API, datos)
        .then(() => {
          limpiarFormulario();
          listar();
          alert("Pedido creado con éxito.");
        })
        .catch(err => {
          console.error("Error interno:", err);
          alert("Error al crear: " + (err.response?.data?.message || err.message));
        });
    }
  };

  const eliminar = (id) => {
    if (window.confirm("¿Confirmar eliminación de este registro?")) {
      api.delete(`${URL_API}/${id}`)
        .then(() => listar())
        .catch(err => {
          console.error("Error al eliminar:", err);
          alert("No se puede eliminar el pedido. Es posible que tenga facturas relacionadas.\nDetalle: " + (err.response?.data?.error || err.message));
        });
    }
  };

  // --- Subir comprobante ---
  const abrirUpload = (pedidoId) => {
    setUploadPedidoId(pedidoId);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadError('');
    setShowUploadModal(true);
  };

  const handleUploadFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selected.type)) {
      setUploadError('Solo se permiten imágenes JPG o PNG');
      return;
    }
    if (selected.size > 3 * 1024 * 1024) {
      setUploadError('La imagen no debe superar los 3MB');
      return;
    }
    setUploadError('');
    setUploadFile(selected);
    setUploadPreview(URL.createObjectURL(selected));
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !uploadPedidoId) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('comprobante', uploadFile);
      await api.post(`${URL_API}/${uploadPedidoId}/subir-comprobante`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      listar();
      alert('Comprobante enviado con éxito. El administrador lo revisará.');
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Error al subir comprobante');
    } finally {
      setUploading(false);
    }
  };

  const aprobarPago = async (pedidoId) => {
    if (!window.confirm('¿Aprobar el pago de este pedido?')) return;
    setActionLoading(true);
    try {
      await api.put(`${URL_API}/${pedidoId}/aprobar-pago`);
      listar();
      alert('Pago aprobado. Pedido disponible para repartidor.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al aprobar pago');
    } finally {
      setActionLoading(false);
    }
  };

  const enviarComentarioAdmin = async () => {
    if (!adminComment.trim() || !pedidoDetalle) return;
    setCommentSending(true);
    try {
      await api.put(`${URL_API}/${pedidoDetalle.id_pedido}/enviar-comentario`, { comentario: adminComment.trim() });
      setAdminComment('');
      alert('Comentario enviado correctamente.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al enviar comentario');
    } finally {
      setCommentSending(false);
    }
  };

  const rechazarPago = async (pedidoId) => {
    const motivo = window.prompt('Motivo del rechazo:');
    if (!motivo) return;
    setActionLoading(true);
    try {
      await api.put(`${URL_API}/${pedidoId}/rechazar-pago`, { motivo });
      listar();
      alert('Pago rechazado.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al rechazar pago');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    listar();
    listarUsuarios();
  }, [isAdminView]);

  const descargarTicket = async (pedidoId) => {
    try {
      const res = await api.get(`${URL_API}/${pedidoId}/ticket`);
      const pedido = res.data;
      const detalles = pedido.detalles || [];

      const filasProductos = detalles.length > 0
        ? detalles.map(d => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${d.producto_nombre}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${d.cantidad}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">$${Number(d.precio_unitario).toLocaleString()}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">$${Number(d.subtotal).toLocaleString()}</td>
          </tr>
        `).join('')
        : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#94a3b8;">Este pedido no tiene productos detallados</td></tr>`;

      const ticketHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8"/>
          <title>Factura Comercial - #${pedido.id_pedido}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #e2e8f0; padding: 40px 20px; color: #1e293b; }
            .ticket { max-width: 800px; margin: 0 auto; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
            .ticket-header { padding: 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; }
            .company-info .brand { font-size: 2rem; font-weight: 800; color: #0f172a; letter-spacing: -1px; margin-bottom: 8px; }
            .company-info .details { font-size: 0.85rem; color: #64748b; line-height: 1.6; }
            .invoice-details { text-align: right; }
            .invoice-details .title { font-size: 1.5rem; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
            .invoice-details .order-id { font-size: 1rem; color: #64748b; font-weight: 500; }
            .ticket-body { padding: 40px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .info-box { background: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .info-box h3 { font-size: 0.85rem; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 12px; letter-spacing: 1px; }
            .info-box p { font-size: 0.95rem; color: #0f172a; font-weight: 500; margin-bottom: 4px; }
            .info-box .light { color: #64748b; font-weight: 400; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            thead th { background: #0f172a; color: #fff; padding: 16px; font-size: 0.85rem; text-transform: uppercase; font-weight: 600; text-align: left; letter-spacing: 1px; }
            thead th:nth-child(2), thead th:nth-child(3), thead th:nth-child(4) { text-align: center; }
            thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
            tbody td { padding: 16px; font-size: 0.95rem; color: #334155; border-bottom: 1px solid #e2e8f0; }
            tbody tr:nth-child(even) { background: #f8fafc; }
            .total-section { display: flex; justify-content: flex-end; }
            .total-box { width: 300px; background: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .total-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
            .total-row.final { border-top: 2px solid #cbd5e1; padding-top: 16px; margin-top: 8px; }
            .total-row .label { font-size: 0.9rem; font-weight: 600; color: #64748b; }
            .total-row.final .label { font-size: 1.2rem; font-weight: 800; color: #0f172a; }
            .total-row .amount { font-size: 1rem; font-weight: 600; color: #334155; }
            .total-row.final .amount { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
            .ticket-footer { text-align: center; padding: 32px 40px; background: #0f172a; color: #fff; }
            .ticket-footer p { font-size: 0.9rem; margin-bottom: 8px; opacity: 0.9; }
            .ticket-footer .doc-info { font-size: 0.8rem; opacity: 0.6; }
            .status-badge { display: inline-block; padding: 6px 16px; border-radius: 4px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 12px; }
            .status-pendiente { background: #fef3c7; color: #b45309; }
            .status-pagado { background: #dcfce7; color: #15803d; }
            .status-entregado { background: #dbeafe; color: #1e3a8a; }
            .status-cancelado { background: #fee2e2; color: #b91c1c; }
            @media print {
              body { background: #fff; padding: 0; }
              .ticket { box-shadow: none; border: none; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div style="text-align:center;margin-bottom:24px;" class="no-print">
            <button onclick="window.print()" style="padding:14px 40px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-size:1.1rem;letter-spacing:0.5px;transition:background 0.2s; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">
              Imprimir Factura
            </button>
          </div>
          <div class="ticket">
            <div class="ticket-header">
              <div class="company-info">
                <div class="brand">RematesPaisa</div>
                <div class="details">
                  NIT: 900.123.456-7<br/>
                  Calle Falsa 123, Medellín, Colombia<br/>
                  Tel: +57 (4) 123 4567<br/>
                  soporte@rematespaisa.com
                </div>
              </div>
              <div class="invoice-details">
                <div class="title">Factura</div>
                <div class="order-id">Nº ${String(pedido.id_pedido).padStart(6, '0')}</div>
                <div class="status-badge status-${pedido.estado?.toLowerCase() || 'pendiente'}">
                  ${pedido.estado || 'PENDIENTE'}
                </div>
              </div>
            </div>
            <div class="ticket-body">
              <div class="info-grid">
                <div class="info-box">
                  <h3>Facturar A</h3>
                  <p>${pedido.usuario_nombre || 'N/A'}</p>
                  <p class="light">Documento: ${pedido.numero_documento || 'N/A'}</p>
                  ${pedido.direccion ? `<p class="light">Dirección: ${pedido.direccion}</p>` : ''}
                </div>
                <div class="info-box">
                  <h3>Detalles de Emisión</h3>
                  <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span class="light">Fecha:</span>
                    <span>${new Date(pedido.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span class="light">Moneda:</span>
                    <span>COP (Pesos Colombianos)</span>
                  </div>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Cant.</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasProductos}
                </tbody>
              </table>
              <div class="total-section">
                <div class="total-box">
                  <div class="total-row">
                    <span class="label">Subtotal</span>
                    <span class="amount">$${Number(pedido.total).toLocaleString()}</span>
                  </div>
                  <div class="total-row">
                    <span class="label">Impuestos (IVA 0%)</span>
                    <span class="amount">$0</span>
                  </div>
                  <div class="total-row final">
                    <span class="label">Total a Pagar</span>
                    <span class="amount">$${Number(pedido.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="ticket-footer">
              <p>Gracias por tu compra en RematesPaisa. ¡Vuelve pronto!</p>
              <div class="doc-info">
                Documento generado el ${new Date().toLocaleString('es-CO')}
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const ventanaTicket = window.open('', '_blank', 'width=600,height=800');
      if (ventanaTicket) {
        ventanaTicket.document.write(ticketHTML);
        ventanaTicket.document.close();
      } else {
        alert('Por favor permite ventanas emergentes para descargar el ticket.');
      }

    } catch (err) {
      console.error("Error al generar ticket:", err);
      alert("No se pudo generar el ticket de compra. " + (err.response?.data?.message || err.message));
    }
  };

  // ── Filtrado y paginación ──
  const filteredPedidos = pedidos.filter(p => {
    if (!isAdminView) {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || p.usuario_id !== user.id_usuario) return false;
    }

    if (!searchTerm) return true;
    const value = p[searchField];
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);
  const currentItems = filteredPedidos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Vista: Invitado ──
  if (isGuestView) {
    return (
      <div className="module-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <ShoppingCart size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
        <h2>Debe registrarse o iniciar sesión para completar el pedido</h2>
        <button onClick={() => navigate('/login')} style={{ marginTop: '20px', padding: '12px 24px', background: 'var(--primary)', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Iniciar Sesión / Registrarse
        </button>
      </div>
    );
  }

  // ── Vista: Cliente (Mis Pedidos) ──
  if (!isAdminView) {
    return (
      <>
        <div className="module-container">
          <div className="module-header" style={{marginBottom: '2rem'}}>
          <h1 className="module-title-table" style={{fontSize: '2rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.03em'}}>Mis Pedidos</h1>
        </div>
        
        <div className="module-content">
          {currentItems.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon-wrap">
                <ShoppingCart size={32} color="#9ca3af" />
              </div>
              <h3>Aún no tienes pedidos</h3>
              <p>Cuando realices una compra, aparecerá aquí para que puedas hacerle seguimiento.</p>
            </div>
          ) : (
            <div className="orders-grid">
              {currentItems.map((p) => (
                <div className="order-card" key={p.id_pedido}>
                  <div className="order-header">
                    <span className="order-id">#{p.id_pedido}</span>
                    <span className={`order-status status-${p.estado?.toLowerCase() || 'pendiente'}`}>
                      {p.estado === 'PENDIENTE' ? 'PENDIENTE DE PAGO' : p.estado === 'EN_REVISION' ? 'EN REVISIÓN' : p.estado}
                    </span>
                  </div>
                  
                  <div className="order-body">
                    <div className="order-info-row">
                      <span className="order-info-label">Fecha de orden</span>
                      <span className="order-info-value">{new Date(p.fecha).toLocaleDateString()}</span>
                    </div>
                    <div className="order-info-row order-total-row">
                      <span className="order-info-label">Total a pagar</span>
                      <span className="order-total-value">${Number(p.total).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      className="btn-order-action btn-download"
                      onClick={() => verDetalles(p.id_pedido)}
                      style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}
                    >
                      <Eye size={16} /> Ver Detalles
                    </button>

                    <button
                      className="btn-order-action btn-download"
                      onClick={() => descargarTicket(p.id_pedido)}
                    >
                      <Download size={16} /> Ticket
                    </button>

                    {p.estado === 'PENDIENTE' && (
                      <>
                        <button
                          className="btn-order-action"
                          onClick={() => abrirUpload(p.id_pedido)}
                          style={{ background: '#fefce8', color: '#92400e', border: '1px solid #fde68a' }}
                        >
                          <Upload size={16} /> Subir Comprobante
                        </button>
                        <button
                          className="btn-order-action btn-cancel-order"
                          onClick={() => cancelarMiPedido(p.id_pedido)}
                        >
                          <Trash2 size={16} /> Cancelar
                        </button>
                      </>
                    )}
                    {p.estado === 'EN_REVISION' && (
                      <span style={{ padding: '6px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600, background: '#fefce8', color: '#92400e', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <AlertCircle size={14} /> En revisión
                      </span>
                    )}
                    {p.estado === 'RECHAZADO' && (
                      <button
                        className="btn-order-action"
                        onClick={() => abrirUpload(p.id_pedido)}
                        style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}
                      >
                        <Upload size={16} /> Reintentar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination-bar">
              <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Anterior</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button key={num} className={`page-btn ${currentPage === num ? 'active' : ''}`} onClick={() => setCurrentPage(num)}>{num}</button>
              ))}
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Siguiente</button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL DETALLE DE PEDIDO ─────────────────────────────── */}
      {showDetailModal && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div
            className="modal-box"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>
                {pedidoDetalle ? `Pedido #${String(pedidoDetalle.id_pedido).padStart(6, '0')}` : 'Cargando...'}
              </h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {pedidoDetalle && (
                  <button
                    onClick={() => { setShowDetailModal(false); descargarTicket(pedidoDetalle.id_pedido); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <Download size={15} /> Descargar Ticket
                  </button>
                )}
                <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>
                  <X size={22} />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Cargando detalles...</div>
            ) : pedidoDetalle ? (
              <>
                {/* Info general */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Cliente</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{pedidoDetalle.usuario_nombre || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Estado</div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                      background: pedidoDetalle.estado === 'PENDIENTE' ? '#fffbeb' : pedidoDetalle.estado === 'CANCELADO' ? '#fef2f2' : '#f0fdf4',
                      color: pedidoDetalle.estado === 'PENDIENTE' ? '#b45309' : pedidoDetalle.estado === 'CANCELADO' ? '#b91c1c' : '#15803d'
                    }}>{pedidoDetalle.estado}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Fecha</div>
                    <div style={{ fontWeight: 500, color: '#334155' }}>{new Date(pedidoDetalle.fecha_pedido || pedidoDetalle.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Total</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>${Number(pedidoDetalle.total).toLocaleString()}</div>
                  </div>
                </div>

                {/* Productos del pedido con imágenes */}
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px' }}>Productos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(pedidoDetalle.detalles || []).length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sin productos detallados.</p>
                  ) : (
                    (pedidoDetalle.detalles || []).map(d => (
                      <div key={d.id_detalle_pedido} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                        {/* Imagen del producto */}
                        <div style={{ width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <OrderProductImg src={d.imagen_url} alt={d.producto_nombre} />
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{d.producto_nombre}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Cantidad: <strong>{d.cantidad}</strong></div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Precio unitario: <strong>${Number(d.precio_unitario).toLocaleString()}</strong></div>
                        </div>
                        {/* Subtotal */}
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', textAlign: 'right', flexShrink: 0 }}>
                          ${Number(d.subtotal).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
      {/* ── MODAL SUBIR COMPROBANTE ───────────────────────────── */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={20} /> Subir comprobante
              </h2>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={22} />
              </button>
            </div>

            {!uploadPreview ? (
              <div
                style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', cursor: 'pointer', background: '#fafbfc' }}
                onClick={() => document.getElementById('upload-comprobante-input').click()}
              >
                <FileImage size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
                <p style={{ color: '#64748b', marginBottom: 8 }}>Selecciona la imagen del comprobante</p>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>JPG o PNG · Máximo 3MB</p>
                <input
                  id="upload-comprobante-input"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleUploadFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                  <img src={uploadPreview} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: 250, borderRadius: 8, border: '1px solid var(--border)' }} />
                  <button
                    onClick={() => { setUploadFile(null); setUploadPreview(null); setUploadError(''); }}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={16} color="white" />
                  </button>
                </div>
                <button
                  className="btn-checkout-red"
                  onClick={handleUploadSubmit}
                  disabled={uploading}
                  style={{ opacity: uploading ? 0.7 : 1, width: '100%' }}
                >
                  {uploading ? 'Subiendo...' : 'Enviar Comprobante'}
                </button>
              </div>
            )}

            {uploadError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', marginTop: 12, fontSize: '0.9rem' }}>
                <AlertCircle size={16} /> {uploadError}
              </div>
            )}
          </div>
        </div>
      )}
      </>
    );
  }

  // ── Vista: Admin ──
  return (
    <>
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>Añadir Pedido</button>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <select
            className="search-select"
            value={searchField}
            onChange={(e) => { setSearchField(e.target.value); setCurrentPage(1); }}
          >
            <option value="usuario_nombre">Cliente/Usuario</option>
            <option value="id_pedido">ID Pedido</option>
            <option value="estado">Estado</option>
          </select>
          <button className="btn-search-ok" onClick={() => setCurrentPage(1)}>OK</button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem' }}>Cargando datos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <ShoppingCart size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
            <h2>No hay pedidos registrados</h2>
            <p>Haz clic en "Añadir Pedido" para comenzar.</p>
          </div>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente / Usuario</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
                <th>Ticket</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((p) => (
                <tr key={p.id_pedido}>
                  <td>
                    {p.id_pedido}
                    {p.alerta && (
                      <span className="admin-alerta-icon" title={p.alerta.motivo}>
                        <AlertTriangle size={14} />
                      </span>
                    )}
                  </td>
                  <td>{p.usuario_nombre || p.usuario_id}</td>
                  <td>${Number(p.total).toLocaleString()}</td>
                  <td>
                    <span className={`badge-fsm ${p.fsm_estado?.toLowerCase() || ''}`}>
                      {p.alerta && (
                        <span className="badge-alerta-wrapper">
                          <AlertTriangle size={12} />
                        </span>
                      )}
                      <span className={`status-dot 
                        ${p.fsm_estado === 'DISPONIBLE' ? 'dot-green' : ''}
                        ${p.fsm_estado === 'EN_REPARTO' ? 'dot-yellow' : ''}
                        ${p.fsm_estado === 'ENTREGADO' ? 'dot-blue' : ''}
                        ${p.fsm_estado === 'CANCELADO' ? 'dot-red' : ''}
                      `} />
                      {p.estado === 'PENDIENTE' ? 'PENDIENTE DE PAGO' : p.fsm_estado || p.estado}
                    </span>
                  </td>
                  <td>{new Date(p.fecha).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    {p.alerta && (
                      <button
                        className="btn-icon btn-alerta"
                        onClick={() => setAlertaModal(p.alerta)}
                        title="Ver problema"
                      >
                        <AlertTriangle size={18} color="#dc2626" />
                      </button>
                    )}
                    <button className="btn-icon" onClick={() => seleccionarPedido(p)} title="Editar">
                      <Pencil size={18} color="var(--primary)" />
                    </button>
                    <button className="btn-icon" onClick={() => eliminar(p.id_pedido)} title="Eliminar">
                      <Trash2 size={18} color="var(--danger)" />
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => verDetalles(p.id_pedido)}
                      title="Ver Detalles"
                    >
                      <Eye size={18} color="var(--primary)" />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => descargarTicket(p.id_pedido)}
                      title="Descargar Ticket"
                    >
                      <Download size={18} color="var(--primary)" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination-bar">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              className={`page-btn ${currentPage === num ? 'active' : ''}`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2>{enEdicion ? "Actualizar Pedido" : "Nuevo Pedido"}</h2>
            <div className="form-grid">
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>ID</label>
                <input type="text" value={idPedido || ''} disabled style={{ background: 'var(--border)', cursor: 'not-allowed' }} />
              </div>

              {!enEdicion && (
                <div className="input-field" style={{ gridColumn: 'span 2' }}>
                  <label>Cliente / Usuario *</label>
                  <select value={usuarioId} onChange={(e) => setUsuarioId(Number(e.target.value))}>
                    <option value="" disabled>Seleccione un usuario...</option>
                    {usuariosList.map(u => (
                      <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} - {u.numero_documento}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="input-field">
                <label>Total</label>
                <input type="number" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} />
              </div>

              <div className="input-field">
                <label>Estado</label>
                <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="PAGADO">PAGADO</option>
                  <option value="ENTREGADO">ENTREGADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

            </div>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={limpiarFormulario}>Cancelar</button>
              <button className="btn-save" onClick={guardar}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

        {/* ── MODAL DETALLE DE PEDIDO (ADMIN) ───────────────────────── */}
      {showDetailModal && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div
            className="modal-box"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>
                {pedidoDetalle ? `Pedido #${String(pedidoDetalle.id_pedido).padStart(6, '0')}` : 'Cargando...'}
              </h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {pedidoDetalle && pedidoDetalle.estado === 'EN_REVISION' && pedidoDetalle.comprobante_pago_url ? (
                  <button
                    onClick={() => window.open(pedidoDetalle.comprobante_pago_url, '_blank')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#92400e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <Eye size={15} /> Revisar Pago
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowDetailModal(false); descargarTicket(pedidoDetalle?.id_pedido); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <Download size={15} /> Descargar Ticket
                  </button>
                )}
                {pedidoDetalle && pedidoDetalle.estado === 'EN_REVISION' && (
                  <button
                    onClick={() => { setChatPedidoId(pedidoDetalle.id_pedido); setShowChat(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <MessageSquare size={15} /> Chat
                  </button>
                )}
                <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>
                  <X size={22} />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Cargando detalles...</div>
            ) : pedidoDetalle ? (
              <>
                {/* Info general */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Cliente</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{pedidoDetalle.usuario_nombre || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Estado</div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                      background: pedidoDetalle.estado === 'PENDIENTE' ? '#fffbeb' : pedidoDetalle.estado === 'CANCELADO' ? '#fef2f2' : pedidoDetalle.estado === 'EN_REVISION' ? '#fefce8' : pedidoDetalle.estado === 'RECHAZADO' ? '#fef2f2' : '#f0fdf4',
                      color: pedidoDetalle.estado === 'PENDIENTE' ? '#b45309' : pedidoDetalle.estado === 'CANCELADO' ? '#b91c1c' : pedidoDetalle.estado === 'EN_REVISION' ? '#92400e' : pedidoDetalle.estado === 'RECHAZADO' ? '#991b1b' : '#15803d'
                    }}>{pedidoDetalle.estado === 'PENDIENTE' ? 'PENDIENTE DE PAGO' : pedidoDetalle.estado === 'EN_REVISION' ? 'EN REVISIÓN' : pedidoDetalle.estado}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Fecha</div>
                    <div style={{ fontWeight: 500, color: '#334155' }}>{new Date(pedidoDetalle.fecha_pedido || pedidoDetalle.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Total</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>${Number(pedidoDetalle.total).toLocaleString()}</div>
                  </div>
                </div>

                {/* Comprobante de pago */}
                {pedidoDetalle.comprobante_pago_url && (
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>Comprobante de Pago</h3>
                    <img
                      src={pedidoDetalle.comprobante_pago_url}
                      alt="Comprobante de pago"
                      style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }}
                      onClick={() => window.open(pedidoDetalle.comprobante_pago_url, '_blank')}
                    />
                  </div>
                )}

                {pedidoDetalle.motivo_rechazo && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12, marginBottom: 20 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b', marginBottom: 4 }}>Motivo de rechazo:</div>
                    <div style={{ color: '#991b1b', fontSize: '0.9rem' }}>{pedidoDetalle.motivo_rechazo}</div>
                  </div>
                )}

                {/* Productos */}
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px' }}>Productos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 24 }}>
                  {(pedidoDetalle.detalles || []).length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sin productos detallados.</p>
                  ) : (
                    (pedidoDetalle.detalles || []).map(d => (
                      <div key={d.id_detalle_pedido} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <OrderProductImg src={d.imagen_url} alt={d.producto_nombre} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{d.producto_nombre}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Cantidad: <strong>{d.cantidad}</strong></div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Precio unitario: <strong>${Number(d.precio_unitario).toLocaleString()}</strong></div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', textAlign: 'right', flexShrink: 0 }}>
                          ${Number(d.subtotal).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* ── Auditoría de Pago ─────────────────────────── */}
                {pedidoDetalle.estado === 'EN_REVISION' && (
                  <div style={{ borderTop: '2px solid var(--border)', paddingTop: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
                      Auditoría de Pago
                    </h3>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                        Observaciones / Retroalimentación
                      </label>
                      <textarea
                        value={adminComment}
                        onChange={e => setAdminComment(e.target.value)}
                        placeholder="Ingrese observaciones, retroalimentación o motivo de rechazo..."
                        rows={3}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        onClick={async () => {
                          await aprobarPago(pedidoDetalle.id_pedido);
                          setShowDetailModal(false);
                        }}
                        disabled={actionLoading}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', background: '#15803d', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', opacity: actionLoading ? 0.7 : 1, minWidth: 120 }}
                      >
                        <CheckCircle size={16} /> Aceptar Pedido
                      </button>
                      <button
                        onClick={async () => {
                          const motivo = adminComment.trim() || 'Pago rechazado';
                          setActionLoading(true);
                          try {
                            await api.put(`${URL_API}/${pedidoDetalle.id_pedido}/rechazar-pago`, { motivo });
                            setShowDetailModal(false);
                            listar();
                            alert('Pago rechazado.');
                          } catch (err) {
                            alert(err.response?.data?.message || 'Error al rechazar pago');
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        disabled={actionLoading}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', opacity: actionLoading ? 0.7 : 1, minWidth: 120 }}
                      >
                        <XCircle size={16} /> Cancelar Pedido
                      </button>
                      <button
                        onClick={() => { setChatPedidoId(pedidoDetalle.id_pedido); setShowChat(true); }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', minWidth: 120 }}
                      >
                        <MessageSquare size={16} /> Chat con Cliente
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {alertaModal && (
        <div className="modal-backdrop" onClick={() => setAlertaModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <AlertTriangle size={20} color="#dc2626" />
                Motivo de alerta
              </h2>
              <button onClick={() => setAlertaModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: '#334155', lineHeight: 1.6, margin: 0 }}>{alertaModal.motivo}</p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 12 }}>
              {new Date(alertaModal.fecha).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {showChat && chatPedidoId && (
        <ChatModal
          pedidoId={chatPedidoId}
          onClose={() => { setShowChat(false); setChatPedidoId(null); }}
        />
      )}
    </>
  );
};

// Componente de imagen para detalles de pedido (con fallback)
const OrderProductImg = ({ src, alt }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <Package size={32} color="#94a3b8" />;
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

export default Pedidos;