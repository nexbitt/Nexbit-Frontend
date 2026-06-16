import { useState, useEffect } from 'react';
import api from '../api';
import { MapPin, Eye, CheckCircle, XCircle, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';
import { ORDER_STATUS, STATUS_LABELS } from '../constants/orderStatuses';
import SearchBar from '../components/SearchBar';

const URL_API = "/api/repartidores";

const Repartidores = () => {
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepartidor, setSelectedRepartidor] = useState(null);
  const [pedidosSinAsignar, setPedidosSinAsignar] = useState([]);

  // Modal de Detalle de Pedido
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showPedidoModal, setShowPedidoModal] = useState(false);
  useModalScroll(showPedidoModal);

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
      alert("Error al cargar detalle");
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
      alert("Error al cambiar el estado del repartidor");
    }
  };

  const asignarPedido = async (pedidoId) => {
    if (!pedidoId) return;
    try {
      await api.post(`${URL_API}/${selectedRepartidor.id_usuario}/asignar-pedido`, { pedido_id: pedidoId });
      alert("Pedido asignado exitosamente");
      verDetalleRepartidor(selectedRepartidor.id_usuario);
    } catch (err) {
      console.error("Error al asignar pedido:", err);
      alert("Error al asignar el pedido");
    }
  };

  const desasignarPedido = async (pedidoId) => {
    if (!window.confirm("¿Seguro que deseas desasignar este pedido del repartidor?")) return;
    try {
      await api.put(`${URL_API}/pedidos/${pedidoId}/desasignar`);
      alert("Pedido desasignado exitosamente");
      verDetalleRepartidor(selectedRepartidor.id_usuario);
    } catch (err) {
      console.error("Error al desasignar pedido:", err);
      alert("Error al desasignar el pedido");
    }
  };

  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    const notas = prompt("Notas adicionales para este cambio de estado (opcional):");
    if (notas === null) return;
    try {
      await api.put(`${URL_API}/pedidos/${pedidoId}/estado`, { estado: nuevoEstado, notas });
      alert("Estado del pedido actualizado");
      verDetalleRepartidor(selectedRepartidor.id_usuario);
      if (showPedidoModal) {
        setShowPedidoModal(false);
        setSelectedPedido(null);
      }
    } catch (err) {
      console.error("Error al actualizar estado del pedido:", err);
      alert("Error al actualizar estado");
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

  const getCumplimiento = (est, real) => {
    if (!real) return <span className="repartidor-cumplimiento repartidor-cumplimiento--pending"><Clock size={14} /> Pendiente</span>;
    if (new Date(real) <= new Date(est)) return <span className="repartidor-cumplimiento repartidor-cumplimiento--on-time"><CheckCircle size={14} /> A tiempo</span>;
    return <span className="repartidor-cumplimiento repartidor-cumplimiento--late"><XCircle size={14} /> Tarde</span>;
  };

  // ── VISTA DETALLE ──
  if (selectedRepartidor) {
    return (
      <div className="repartidor-detail-view">
        <button className="repartidor-back-btn" onClick={() => setSelectedRepartidor(null)}>
          <ArrowLeft size={16} /> Volver a Repartidores
        </button>

        <div className="repartidor-grid">
          {/* Tarjeta: Datos del Repartidor */}
          <div className="repartidor-card">
            <h3>Datos del Repartidor</h3>
            <div className="repartidor-info">
              <div className="repartidor-info-row">
                <span className="repartidor-info-label">Nombre</span>
                <span className="repartidor-info-value">{selectedRepartidor.nombre}</span>
              </div>
              <div className="repartidor-info-row">
                <span className="repartidor-info-label">Email</span>
                <span className="repartidor-info-value">{selectedRepartidor.email}</span>
              </div>
              <div className="repartidor-info-row">
                <span className="repartidor-info-label">Teléfono</span>
                <span className="repartidor-info-value">{selectedRepartidor.telefono || 'N/A'}</span>
              </div>
              <div className="repartidor-info-row">
                <span className="repartidor-info-label">Documento</span>
                <span className="repartidor-info-value">{selectedRepartidor.numero_documento || 'N/A'}</span>
              </div>
              <div className="repartidor-info-row">
                <span className="repartidor-info-label">Dirección</span>
                <span className="repartidor-info-value">{selectedRepartidor.direccion || 'N/A'}</span>
              </div>
            </div>

            <div className="repartidor-status-row">
              <strong>Estado de Cuenta</strong>
              <button
                className={`status-toggle ${selectedRepartidor.activo ? 'is-active' : 'is-inactive'}`}
                onClick={() => toggleActivo(selectedRepartidor.id_usuario, selectedRepartidor.activo)}
              >
                {selectedRepartidor.activo ? 'Activo' : 'Inactivo'}
              </button>
            </div>

            <div className="repartidor-assign-section">
              <h4>Asignar Nuevo Pedido</h4>
              <div className="repartidor-assign-row">
                <select id="select-pedido-asignar">
                  <option value="">Seleccione un pedido CONFIRMADO...</option>
                  {pedidosSinAsignar.map(p => (
                    <option key={p.id_pedido} value={p.id_pedido}>
                      Ped. #{p.id_pedido} - {p.cliente?.nombre}
                    </option>
                  ))}
                </select>
                <button className="btn-save" onClick={() => {
                  const sel = document.getElementById('select-pedido-asignar');
                  if (sel.value) asignarPedido(sel.value);
                }}>
                  Asignar
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta: Pedidos Asignados */}
          <div className="repartidor-card">
            <h3>Pedidos Asignados</h3>
            {selectedRepartidor.pedidos_repartidor?.length === 0 ? (
              <div className="repartidor-empty">No hay pedidos asignados a este repartidor.</div>
            ) : (
              <div className="table-wrapper" style={{ marginTop: '1rem' }}>
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
                        <td>{p.fecha_asignacion ? new Date(p.fecha_asignacion).toLocaleString() : 'N/A'}</td>
                        <td>{p.fecha_entrega_est ? new Date(p.fecha_entrega_est).toLocaleString() : 'N/A'}</td>
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
        </div>

        {/* Modal Detalle de Pedido */}
        {showPedidoModal && selectedPedido && (
          <div className="modal-backdrop">
            <div className="modal-box" style={{ maxWidth: '800px', width: '90%' }}>
              <h2>Detalle Pedido #{selectedPedido.id_pedido}</h2>
              <div className="repartidor-modal-grid">
                <div className="repartidor-modal-section">
                  <h4>Información General</h4>
                  <p><strong>Cliente:</strong> {selectedPedido.cliente?.nombre}</p>
                  <p><strong>Dirección:</strong> {selectedPedido.direccion_entrega}</p>
                  <p><strong>Notas:</strong> {selectedPedido.notas_entrega || 'Ninguna'}</p>
                  <p><strong>Total Pedido:</strong> ${Number(selectedPedido.total).toLocaleString()}</p>

                  <h4>Productos</h4>
                  <ul className="repartidor-product-list">
                    {selectedPedido.detalle_pedido?.map(dp => (
                      <li key={dp.id_detalle_pedido} className="repartidor-product-item">
                        {dp.cantidad}x {dp.producto?.nombre} — ${Number(dp.subtotal).toLocaleString()}
                      </li>
                    ))}
                  </ul>

                  <h4>Cambiar Estado</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <select id="select-estado-pedido" defaultValue={selectedPedido.estado} className="repartidor-estado-select">
                      <option value={ORDER_STATUS.ASIGNADO}>{STATUS_LABELS[ORDER_STATUS.ASIGNADO]}</option>
                      <option value={ORDER_STATUS.EN_CAMINO}>{STATUS_LABELS[ORDER_STATUS.EN_CAMINO]}</option>
                      <option value={ORDER_STATUS.ENTREGADO}>{STATUS_LABELS[ORDER_STATUS.ENTREGADO]}</option>
                      <option value={ORDER_STATUS.CANCELADO}>{STATUS_LABELS[ORDER_STATUS.CANCELADO]}</option>
                    </select>
                    <button className="btn-save" onClick={() => cambiarEstadoPedido(selectedPedido.id_pedido, document.getElementById('select-estado-pedido').value)}>
                      Actualizar
                    </button>
                  </div>
                </div>

                <div className="repartidor-modal-section">
                  <h4>Historial de Seguimiento</h4>
                  {selectedPedido.seguimiento && selectedPedido.seguimiento.length > 0 ? (
                    <div className="repartidor-timeline">
                      {selectedPedido.seguimiento.map(seg => (
                        <div key={seg.id_seguimiento} className="repartidor-timeline-item">
                          <div className="repartidor-timeline-date">
                            {new Date(seg.fecha).toLocaleString()} por {seg.usuario?.nombre}
                          </div>
                          <div className="repartidor-timeline-transition">
                            {seg.estado_anterior || 'CREACIÓN'} &rarr; {seg.estado_nuevo}
                          </div>
                          {seg.notas && <div className="repartidor-timeline-notes">"{seg.notas}"</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#94a3b8' }}>No hay historial registrado.</p>
                  )}
                </div>
              </div>

              <div className="modal-btns" style={{ marginTop: '2rem' }}>
                <button className="btn-cancel" onClick={() => { setShowPedidoModal(false); setSelectedPedido(null); }}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── VISTA PRINCIPAL ──
  return (
    <>
      <div className="top-action-bar">
        <h2 className="module-title-table" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <MapPin size={24} color="var(--primary)" /> Repartidores
        </h2>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por nombre o email..."
          filters={[
            { key: 'estado', label: 'Todos los estados', options: [
              { value: 'ACTIVE', label: 'Activos' },
              { value: 'INACTIVE', label: 'Inactivos' }
            ]}
          ]}
          filterValues={{ estado: statusFilter }}
          onFilterChange={(key, val) => setStatusFilter(val)}
          onClear={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
        />
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
                    <button className="btn-primary-sm" onClick={() => verDetalleRepartidor(r.id_usuario)}>
                      <Eye size={16} /> Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Repartidores;
