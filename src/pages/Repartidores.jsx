import { useState, useEffect } from 'react';
import api from '../api';
import { MapPin, Eye, Trash2, Plus, Package, ChevronDown, CheckCircle, XCircle, Clock, ArrowLeft, Search, X, Filter } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';
import { ORDER_STATUS, STATUS_LABELS } from '../constants/orderStatuses';
import CustomDialog from '../components/CustomDialog';

const URL_API = "/api/repartidores";

const Repartidores = () => {
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepartidor, setSelectedRepartidor] = useState(null);
  const [pedidosSinAsignar, setPedidosSinAsignar] = useState([]);

  // Modal de Detalle de Pedido
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });
  const [notasPrompt, setNotasPrompt] = useState({ open: false, pedidoId: null, nuevoEstado: null, notas: '' });
  useModalScroll(showPedidoModal);

  // Asignar pedido
  const [selectedPedidoAsignar, setSelectedPedidoAsignar] = useState('');

  // Filtros vista principal
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchRepartidores = async () => {
    setLoading(true);
    try {
      const res = await api.get(URL_API);
      setRepartidores(res.data);
    } catch (err) {
      console.error("Error al cargar repartidores:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPedidosSinAsignar = async () => {
    try {
      const res = await api.get(`${URL_API}/pedidos-sin-asignar`);
      setPedidosSinAsignar(res.data);
    } catch (err) {
      console.error("Error al cargar pedidos sin asignar:", err);
    }
  };

  useEffect(() => {
    if (!selectedRepartidor) {
      fetchRepartidores();
    }
  }, [selectedRepartidor]);

  const verDetalleRepartidor = async (id) => {
    try {
      const res = await api.get(`${URL_API}/${id}`);
      setSelectedRepartidor(res.data);
      fetchPedidosSinAsignar();
    } catch (err) {
      console.error("Error al cargar detalle del repartidor:", err);
      setDialog({ open: true, type: 'error', title: 'Error', message: 'Error al cargar detalle', onConfirm: null });
    }
  };

  const toggleActivo = async (id, currentStatus) => {
    try {
      await api.put(`${URL_API}/${id}/activo`, { activo: !currentStatus });
      if (selectedRepartidor && selectedRepartidor.id_usuario === id) {
        setSelectedRepartidor({ ...selectedRepartidor, activo: !currentStatus });
      }
      fetchRepartidores();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      setDialog({ open: true, type: 'error', title: 'Error', message: 'Error al cambiar el estado del repartidor', onConfirm: null });
    }
  };

  const asignarPedido = async (pedidoId) => {
    if (!pedidoId) return;
    try {
      await api.post(`${URL_API}/${selectedRepartidor.id_usuario}/asignar-pedido`, { pedido_id: pedidoId });
      setDialog({ open: true, type: 'success', title: 'Operación exitosa', message: 'Pedido asignado exitosamente', onConfirm: null });
      setSelectedPedidoAsignar('');
      verDetalleRepartidor(selectedRepartidor.id_usuario);
    } catch (err) {
      console.error("Error al asignar pedido:", err);
      setDialog({ open: true, type: 'error', title: 'Error', message: 'Error al asignar el pedido', onConfirm: null });
    }
  };

  const eliminarRepartidor = (repartidor) => {
    setDialog({
      open: true, type: 'confirm', title: 'Confirmar baja',
      message: `¿Seguro que deseas dar de baja a ${repartidor.nombre}?`,
      onConfirm: async () => {
        setDialog(prev => ({ ...prev, open: false }));
        await toggleActivo(repartidor.id_usuario, repartidor.activo);
      }
    });
  };

  const desasignarPedido = async (pedidoId) => {
    setDialog({ open: true, type: 'confirm', title: 'Confirmar desasignación', message: '¿Seguro que deseas desasignar este pedido del repartidor?', onConfirm: async () => {
      setDialog({ open: false, type: 'confirm', title: '', message: '', onConfirm: null });
      try {
        await api.put(`${URL_API}/pedidos/${pedidoId}/desasignar`);
        setDialog({ open: true, type: 'success', title: 'Operación exitosa', message: 'Pedido desasignado exitosamente', onConfirm: null });
        verDetalleRepartidor(selectedRepartidor.id_usuario);
      } catch (err) {
        console.error("Error al desasignar pedido:", err);
        setDialog({ open: true, type: 'error', title: 'Error', message: 'Error al desasignar el pedido', onConfirm: null });
      }
    }});
  };

  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    setNotasPrompt({ open: true, pedidoId, nuevoEstado, notas: '' });
  };

  const ejecutarCambioEstado = async () => {
    const { pedidoId, nuevoEstado, notas } = notasPrompt;
    setNotasPrompt({ ...notasPrompt, open: false });
    try {
      await api.put(`${URL_API}/pedidos/${pedidoId}/estado`, { estado: nuevoEstado, notas });
      setDialog({ open: true, type: 'success', title: 'Operación exitosa', message: 'Estado del pedido actualizado', onConfirm: null });
      verDetalleRepartidor(selectedRepartidor.id_usuario);
      if (showPedidoModal) {
        setShowPedidoModal(false);
        setSelectedPedido(null);
      }
    } catch (err) {
      console.error("Error al actualizar estado del pedido:", err);
      setDialog({ open: true, type: 'error', title: 'Error', message: 'Error al actualizar estado', onConfirm: null });
    }
  };

  const filteredRepartidores = repartidores.filter(r => {
    const matchSearch = r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      || r.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL'
      || (statusFilter === 'ACTIVE' && r.activo)
      || (statusFilter === 'INACTIVE' && !r.activo);
    return matchSearch && matchStatus;
  });

  const formatFecha = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const getCumplimiento = (est, real) => {
    if (!real) return <span className="repartidor-cumplimiento repartidor-cumplimiento--pending"><Clock size={14} /> Pendiente</span>;
    if (new Date(real) <= new Date(est)) return <span className="repartidor-cumplimiento repartidor-cumplimiento--on-time"><CheckCircle size={14} /> A tiempo</span>;
    return <span className="repartidor-cumplimiento repartidor-cumplimiento--late"><XCircle size={14} /> Tarde</span>;
  };

  // ── VISTA DETALLE ──
  if (selectedRepartidor) {
    const sinPedidos = pedidosSinAsignar.length === 0;
    return (
      <>
      <div className="repartidor-detail-view">
        <button className="repartidor-back-btn" onClick={() => setSelectedRepartidor(null)}>
          <ArrowLeft size={16} /> Volver a Repartidores
        </button>

        <div className="rp-assign-bar">
          <div className="rp-assign-bar-select-wrapper">
            <Package size={16} className="rp-assign-bar-icon" />
            <select
              className="rp-assign-bar-select"
              value={selectedPedidoAsignar}
              onChange={(e) => setSelectedPedidoAsignar(e.target.value)}
              disabled={sinPedidos}
            >
              {sinPedidos ? (
                <option value="">No hay pedidos confirmados pendientes por asignar</option>
              ) : (
                <>
                  <option value="">Seleccione un pedido CONFIRMADO...</option>
                  {pedidosSinAsignar.map(p => (
                    <option key={p.id_pedido} value={p.id_pedido}>
                      Ped. #{p.id_pedido} - {p.cliente?.nombre}
                    </option>
                  ))}
                </>
              )}
            </select>
            <ChevronDown size={14} className="rp-assign-bar-chevron" />
          </div>
          <button className="rp-assign-bar-btn" onClick={() => asignarPedido(selectedPedidoAsignar)} disabled={!selectedPedidoAsignar}>
            <Plus size={16} />
            Asignar
          </button>
        </div>

        <div className="repartidor-card rp-table-card">
          <h3>Pedidos Asignados</h3>
          {selectedRepartidor.pedidos_repartidor?.length === 0 ? (
            <div className="repartidor-empty">No hay pedidos asignados a este repartidor.</div>
          ) : (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Dirección</th>
                    <th>Estado</th>
                    <th>Asignación</th>
                    <th>Est. Entrega</th>
                    <th>Cumplimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRepartidor.pedidos_repartidor.map(p => (
                    <tr key={p.id_pedido}>
                      <td>{p.id_pedido}</td>
                      <td>{p.cliente?.nombre}</td>
                      <td><span className="repartidor-truncate" title={p.direccion_entrega}>{p.direccion_entrega}</span></td>
                      <td><span className="badge-rol">{p.estado}</span></td>
                      <td className="repartidor-fecha-cell">{formatFecha(p.fecha_asignacion)}</td>
                      <td className="repartidor-fecha-cell">{formatFecha(p.fecha_entrega_est)}</td>
                      <td>{getCumplimiento(p.fecha_entrega_est, p.fecha_entrega_real)}</td>
                      <td className="actions-cell">
                        <button className="btn-icon" title="Ver Detalle" onClick={() => { setSelectedPedido(p); setShowPedidoModal(true); }}>
                          <Eye size={18} color="var(--primary)" />
                        </button>
                        {p.estado !== ORDER_STATUS.ENTREGADO && p.estado !== ORDER_STATUS.CANCELADO && (
                          <button className="btn-icon" title="Desasignar" onClick={() => desasignarPedido(p.id_pedido)}>
                            <Trash2 size={18} color="var(--danger)" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Detalle de Pedido (Chasis S) */}
        {showPedidoModal && selectedPedido && (
          <div className="modal-backdrop">
            <div className="modal-box modal-box--sm">
              <h2>Detalle Pedido #{selectedPedido.id_pedido}</h2>
              <div className="rp-modal-body">
                <div className="rp-modal-field">
                  <span className="rp-modal-label">Cliente</span>
                  <span className="rp-modal-value">{selectedPedido.cliente?.nombre}</span>
                </div>
                <div className="rp-modal-field">
                  <span className="rp-modal-label">Dirección</span>
                  <span className="rp-modal-value">{selectedPedido.direccion_entrega}</span>
                </div>
                <div className="rp-modal-field">
                  <span className="rp-modal-label">Notas</span>
                  <span className="rp-modal-value">{selectedPedido.notas_entrega || 'Ninguna'}</span>
                </div>
                <div className="rp-modal-field">
                  <span className="rp-modal-label">Total</span>
                  <span className="rp-modal-value rp-modal-value--total">${Number(selectedPedido.total).toLocaleString()}</span>
                </div>

                <h4 className="rp-modal-subtitle">Productos</h4>
                <ul className="rp-modal-product-list">
                  {selectedPedido.detalle_pedido?.map(dp => (
                    <li key={dp.id_detalle_pedido} className="rp-modal-product-item">
                      <span>{dp.cantidad}x {dp.producto?.nombre}</span>
                      <span>${Number(dp.subtotal).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>

                <h4 className="rp-modal-subtitle">Cambiar Estado</h4>
                <div className="rp-modal-estado-stack">
                  <select id="select-estado-pedido" defaultValue={selectedPedido.estado} className="rp-modal-select">
                    <option value={ORDER_STATUS.ASIGNADO}>{STATUS_LABELS[ORDER_STATUS.ASIGNADO]}</option>
                    <option value={ORDER_STATUS.EN_CAMINO}>{STATUS_LABELS[ORDER_STATUS.EN_CAMINO]}</option>
                    <option value={ORDER_STATUS.ENTREGADO}>{STATUS_LABELS[ORDER_STATUS.ENTREGADO]}</option>
                    <option value={ORDER_STATUS.CANCELADO}>{STATUS_LABELS[ORDER_STATUS.CANCELADO]}</option>
                  </select>
                  <button className="rp-modal-update-btn" onClick={() => cambiarEstadoPedido(selectedPedido.id_pedido, document.getElementById('select-estado-pedido').value)}>
                    Actualizar
                  </button>
                </div>
              </div>

              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => { setShowPedidoModal(false); setSelectedPedido(null); }}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {notasPrompt.open && (
          <div className="modal-backdrop" onClick={() => setNotasPrompt({ ...notasPrompt, open: false })}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
              <h2>Notas adicionales</h2>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>Notas adicionales para este cambio de estado (opcional):</p>
              <textarea
                className="form-input"
                value={notasPrompt.notas}
                onChange={(e) => setNotasPrompt({ ...notasPrompt, notas: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }}
              />
              <div className="modal-btns" style={{ marginTop: '1rem' }}>
                <button className="btn-cancel" onClick={() => setNotasPrompt({ ...notasPrompt, open: false })}>Cancelar</button>
                <button className="btn-save" onClick={ejecutarCambioEstado}>Continuar</button>
              </div>
            </div>
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
    </>
    );
  }

  // ── VISTA PRINCIPAL ──
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', height: '42px', padding: '0 12px', boxSizing: 'border-box' }}>
          <Search size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nombre o email..." style={{ border: 'none', outline: 'none', flex: 1, padding: '0 8px', background: 'transparent', height: '100%', fontSize: '13px', color: '#111827', width: '100%' }} />
          {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}><X size={14} color="#9CA3AF" /></button>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', height: '42px', padding: '0 8px 0 12px', width: '180px', flexShrink: 0, boxSizing: 'border-box' }}>
          <Filter size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ border: 'none', outline: 'none', flex: 1, padding: '0 4px', background: 'transparent', height: '100%', fontSize: '13px', color: '#111827', cursor: 'pointer' }}>
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem' }}>Cargando repartidores...</p>
          </div>
        ) : repartidores.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <MapPin size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
            <h2>No hay repartidores registrados</h2>
          </div>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado Cuenta</th>
                <th>Total Pedidos</th>
                <th>Pedidos Activos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepartidores.map((r) => (
                <tr key={r.id_usuario}>
                  <td>{r.id_usuario}</td>
                  <td>{r.nombre}</td>
                  <td>{r.telefono || 'N/A'}</td>
                  <td>{r.email}</td>
                  <td>
                    <button
                      className={`status-toggle ${r.activo ? 'is-active' : 'is-inactive'}`}
                      onClick={() => toggleActivo(r.id_usuario, r.activo)}
                    >
                      {r.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>{r.total_pedidos}</td>
                  <td>
                    <span className="badge-count" style={{
                      background: r.pedidos_activos > 0 ? '#fef3c7' : 'transparent',
                      color: r.pedidos_activos > 0 ? '#b45309' : 'inherit',
                    }}>
                      {r.pedidos_activos}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="rp-action-btn" onClick={() => verDetalleRepartidor(r.id_usuario)} title="Ver Detalle">
                      <Eye size={14} />
                    </button>
                    <button className="rp-action-btn rp-action-btn--danger" onClick={() => eliminarRepartidor(r)} title="Dar de baja">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </>
  );
};

export default Repartidores;
