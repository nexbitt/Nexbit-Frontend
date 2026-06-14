import { useState, useEffect, useCallback } from 'react';
import { Bike, MapPin, Phone, DollarSign, Clock, Package, CheckCircle, ChevronDown, ChevronUp, User, Truck } from 'lucide-react';
import api from '../api';

const RepartidorSimulationView = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(null);
  const [accion, setAccion] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [vistaRuta, setVistaRuta] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const res = await api.get('/api/simulacion/pedidos/disponibles');
      setPedidos(res.data);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); const i = setInterval(cargar, 15000); return () => clearInterval(i); }, [cargar]);

  const actualizarEstado = async (id, estado) => {
    setAccion(`${id}-${estado}`);
    try {
      await api.put(`/api/simulacion/${id}/estado`, { estado });
      setPedidos(prev => prev.map(p =>
        p.id_pedido === id ? { ...p, estado } : p
      ));
      if (estado === 'ENTREGADO' && vistaRuta === id) {
        setVistaRuta(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setAccion(null);
    }
  };

  const filteredPedidos = pedidos.filter(p => {
    if (filter === 'disponibles') return p.estado === 'APROBADO';
    if (filter === 'asignados') return p.estado === 'ASIGNADO' || p.estado === 'EN_CAMINO';
    return true;
  });

  if (loading) {
    return (
      <div className="sim-view-loading">
        <div className="spinner" />
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="sim-repartidor-content">
      <div className="sim-repartidor-header">
        <h3>Panel de Repartidor (Simulación)</h3>
        <div className="sim-repartidor-filters">
          <button className={`sim-filter-btn ${filter === 'todos' ? 'active' : ''}`} onClick={() => setFilter('todos')}>
            Todos ({pedidos.length})
          </button>
          <button className={`sim-filter-btn ${filter === 'disponibles' ? 'active' : ''}`} onClick={() => setFilter('disponibles')}>
            Disponibles ({pedidos.filter(p => p.estado === 'APROBADO').length})
          </button>
          <button className={`sim-filter-btn ${filter === 'asignados' ? 'active' : ''}`} onClick={() => setFilter('asignados')}>
            En Ruta ({pedidos.filter(p => p.estado === 'ASIGNADO' || p.estado === 'EN_CAMINO').length})
          </button>
        </div>
      </div>

      {vistaRuta && (() => {
        const pedido = pedidos.find(p => p.id_pedido === vistaRuta);
        if (!pedido) return null;
        const enCamino = pedido.estado === 'EN_CAMINO';
        return (
          <div className="sim-ruta-view">
            <button className="sim-btn-back" onClick={() => setVistaRuta(null)}>
              <ChevronDown size={16} /> Volver a la lista
            </button>
            <div className="sim-ruta-card">
              <div className="sim-ruta-header">
                <div className="sim-ruta-avatar">
                  <Truck size={24} color="#2563EB" />
                </div>
                <div>
                  <h4>Pedido #{pedido.id_pedido}</h4>
                  <span className="sim-ruta-cliente"><User size={12} /> {pedido.cliente}</span>
                </div>
                <span className={`sim-estado-badge sim-estado-${pedido.estado.toLowerCase()}`}>
                  {pedido.estado === 'APROBADO' ? 'PREPARADO' : pedido.estado === 'EN_CAMINO' ? 'EN RUTA' : pedido.estado}
                </span>
              </div>

              <div className="sim-ruta-body">
                <div className="sim-ruta-info-row">
                  <MapPin size={16} />
                  <div>
                    <strong>Destino</strong>
                    <p>{pedido.direccion || 'No especificada'}</p>
                  </div>
                </div>
                <div className="sim-ruta-info-row">
                  <Phone size={16} />
                  <div>
                    <strong>Cliente</strong>
                    <p>{pedido.telefono || 'No disponible'}</p>
                  </div>
                </div>
                <div className="sim-ruta-info-row">
                  <DollarSign size={16} />
                  <div>
                    <strong>Total</strong>
                    <p>${Number(pedido.total).toLocaleString()}</p>
                  </div>
                </div>

                <div className="sim-ruta-items">
                  <strong>Productos ({pedido.items?.length || 0})</strong>
                  {pedido.items?.map((item, i) => (
                    <div key={i} className="sim-ruta-item">
                      {item.imagen && <img src={item.imagen} alt="" className="sim-ruta-item-img" />}
                      <span>{item.nombre} <strong>x{item.cantidad}</strong></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sim-ruta-actions">
                {!enCamino ? (
                  <button
                    className="sim-ruta-btn sim-ruta-btn-iniciar"
                    onClick={() => actualizarEstado(pedido.id_pedido, 'EN_CAMINO')}
                    disabled={accion === `${pedido.id_pedido}-EN_CAMINO`}
                  >
                    <Bike size={20} />
                    {accion === `${pedido.id_pedido}-EN_CAMINO` ? 'Iniciando...' : 'Iniciar Ruta'}
                  </button>
                ) : (
                  <button
                    className="sim-ruta-btn sim-ruta-btn-entregar"
                    onClick={() => actualizarEstado(pedido.id_pedido, 'ENTREGADO')}
                    disabled={accion === `${pedido.id_pedido}-ENTREGADO`}
                  >
                    <CheckCircle size={20} />
                    {accion === `${pedido.id_pedido}-ENTREGADO` ? 'Confirmando...' : 'Confirmar Entrega'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {!vistaRuta && (
        <div className="sim-orders-feed">
          {filteredPedidos.length === 0 ? (
            <div className="sim-empty-state">
              <Package size={48} />
              <h3>No hay pedidos disponibles</h3>
              <p>Los nuevos pedidos aparecerán aquí automáticamente</p>
            </div>
          ) : (
            filteredPedidos.map(p => (
              <div
                key={p.id_pedido}
                className="sim-ruta-row"
                onClick={() => setVistaRuta(p.id_pedido)}
              >
                <div className="sim-ruta-row-avatar">
                  <Truck size={18} color="#2563EB" />
                </div>
                <div className="sim-ruta-row-info">
                  <span className="sim-ruta-row-title">Pedido #{p.id_pedido}</span>
                  <span className="sim-ruta-row-dest">
                    <MapPin size={11} /> {p.direccion || 'Sin dirección'}
                  </span>
                  <span className="sim-ruta-row-cliente">
                    <User size={11} /> {p.cliente}
                  </span>
                </div>
                <div className="sim-ruta-row-right">
                  <span className="sim-ruta-row-price">${Number(p.total).toLocaleString()}</span>
                  <span className={`sim-estado-badge sim-estado-${p.estado.toLowerCase()}`}>
                    {p.estado === 'APROBADO' ? 'LISTO' : p.estado === 'EN_CAMINO' ? 'RUTA' : p.estado}
                  </span>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const ChevronRight = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default RepartidorSimulationView;
