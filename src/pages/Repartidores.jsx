import { useState, useEffect } from 'react';
import api from '../api';
import { MapPin, Eye, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';
import { ORDER_STATUS, STATUS_LABELS } from '../constants/orderStatuses';
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
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, INACTIVE

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
    if (notas === null) return; // cancelado
    try {
      await api.put(`${URL_API}/pedidos/${pedidoId}/estado`, { estado: nuevoEstado, notas });
      alert("Estado del pedido actualizado");
      verDetalleRepartidor(selectedRepartidor.id_usuario);
      if (showPedidoModal) {
          // close modal if open
          setShowPedidoModal(false);
          setSelectedPedido(null);
      }
    } catch (err) {
      console.error("Error al actualizar estado del pedido:", err);
      alert("Error al actualizar estado");
    }
  };

  const filteredRepartidores = repartidores.filter(r => {
    const matchSearch = r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        r.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || 
                        (statusFilter === 'ACTIVE' && r.activo) || 
                        (statusFilter === 'INACTIVE' && !r.activo);
    return matchSearch && matchStatus;
  });

  const getCumplimiento = (est, real) => {
    if (!real) return <span style={{color: 'orange'}}><Clock size={16}/> Pendiente</span>;
    if (new Date(real) <= new Date(est)) return <span style={{color: 'green'}}><CheckCircle size={16}/> A tiempo</span>;
    return <span style={{color: 'red'}}><XCircle size={16}/> Tarde</span>;
  };

  if (selectedRepartidor) {
    return (
      <div className="repartidor-detail-view">
        <button className="btn-cancel" onClick={() => setSelectedRepartidor(null)} style={{ marginBottom: '1rem' }}>
          &larr; Volver a Repartidores
        </button>
        
        <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* SECCIÓN 1: Datos Personales */}
          <div className="data-card" style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3>Datos del Repartidor</h3>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <p><strong>Nombre:</strong> {selectedRepartidor.nombre}</p>
              <p><strong>Email:</strong> {selectedRepartidor.email}</p>
              <p><strong>Teléfono:</strong> {selectedRepartidor.telefono || 'N/A'}</p>
              <p><strong>Documento:</strong> {selectedRepartidor.numero_documento || 'N/A'}</p>
              <p><strong>Dirección:</strong> {selectedRepartidor.direccion || 'N/A'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <strong>Estado de Cuenta:</strong> 
                <button 
                  className={`status-toggle ${selectedRepartidor.activo ? 'is-active' : 'is-inactive'}`}
                  onClick={() => toggleActivo(selectedRepartidor.id_usuario, selectedRepartidor.activo)}
                >
                  {selectedRepartidor.activo ? 'Activo' : 'Inactivo'}
                </button>
              </div>
            </div>

            <hr style={{ margin: '2rem 0', borderColor: 'var(--border)' }} />
            
            <h4>Asignar Nuevo Pedido</h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <select id="select-pedido-asignar" style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <option value="">Seleccione un pedido CONFIRMADO...</option>
                {pedidosSinAsignar.map(p => (
                  <option key={p.id_pedido} value={p.id_pedido}>
                    Ped. #{p.id_pedido} - {p.cliente.nombre}
                  </option>
                ))}
              </select>
              <button className="btn-save" onClick={() => {
                const select = document.getElementById('select-pedido-asignar');
                if (select.value) asignarPedido(select.value);
              }}>
                Asignar
              </button>
            </div>
          </div>

          {/* SECCIÓN 2: Tabla de Pedidos Asignados */}
          <div className="data-card" style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3>Pedidos Asignados</h3>
            <div className="table-wrapper" style={{ marginTop: '1rem' }}>
              {selectedRepartidor.pedidos_repartidor.length === 0 ? (
                <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>No hay pedidos asignados.</p>
              ) : (
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
                        <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.direccion_entrega}>
                          {p.direccion_entrega}
                        </td>
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
              )}
            </div>
          </div>
        </div>

        {/* Modal Detalle de Pedido */}
        {showPedidoModal && selectedPedido && (
          <div className="modal-backdrop">
            <div className="modal-box" style={{ maxWidth: '800px', width: '90%' }}>
              <h2>Detalle Pedido #{selectedPedido.id_pedido}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
                <div>
                  <h4>Información General</h4>
                  <p><strong>Cliente:</strong> {selectedPedido.cliente?.nombre}</p>
                  <p><strong>Dirección:</strong> {selectedPedido.direccion_entrega}</p>
                  <p><strong>Notas:</strong> {selectedPedido.notas_entrega || 'Ninguna'}</p>
                  <p><strong>Total Pedido:</strong> ${Number(selectedPedido.total).toLocaleString()}</p>
                  
                  <h4 style={{ marginTop: '1.5rem' }}>Productos</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {selectedPedido.detalle_pedido.map(dp => (
                      <li key={dp.id_detalle_pedido} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                        {dp.cantidad}x {dp.producto?.nombre} - ${Number(dp.subtotal).toLocaleString()}
                      </li>
                    ))}
                  </ul>

                  <h4 style={{ marginTop: '1.5rem' }}>Cambiar Estado</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <select id="select-estado-pedido" defaultValue={selectedPedido.estado} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px' }}>
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
                
                <div>
                  <h4>Historial de Seguimiento</h4>
                  {selectedPedido.seguimiento && selectedPedido.seguimiento.length > 0 ? (
                    <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '1rem' }}>
                      {selectedPedido.seguimiento.map(seg => (
                        <div key={seg.id_seguimiento} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                            {new Date(seg.fecha).toLocaleString()} por {seg.usuario?.nombre}
                          </div>
                          <div>
                            <strong>{seg.estado_anterior || 'CREACIÓN'} &rarr; {seg.estado_nuevo}</strong>
                          </div>
                          {seg.notas && <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontStyle: 'italic' }}>"{seg.notas}"</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-light)' }}>No hay historial registrado.</p>
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

  // VISTA PRINCIPAL
  return (
    <>
      <div className="top-action-bar">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <MapPin size={28} color="var(--primary)"/> Módulo de Repartidores
        </h2>
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar por nombre o email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="search-select" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
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
                    <span style={{ 
                      background: r.pedidos_activos > 0 ? 'var(--warning-light, #fef3c7)' : 'transparent',
                      color: r.pedidos_activos > 0 ? 'var(--warning-dark, #b45309)' : 'inherit',
                      padding: '2px 8px', borderRadius: '12px', fontWeight: r.pedidos_activos > 0 ? 'bold' : 'normal'
                    }}>
                      {r.pedidos_activos}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-add-record" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => verDetalleRepartidor(r.id_usuario)}>
                      Ver Detalle
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
