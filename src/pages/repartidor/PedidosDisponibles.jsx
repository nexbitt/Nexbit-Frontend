import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../api';
import { Package, MapPin, DollarSign, Clock, ChevronDown, ChevronUp, Zap, Loader, AlertTriangle, User, X, MessageSquare } from 'lucide-react';
import ChatModal from '../../components/features/ChatModal';
import CustomDialog from '../../components/ui/CustomDialog';

const PedidosDisponibles = () => {
  const [disponibles, setDisponibles] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(null);
  const [tomando, setTomando] = useState(null);
  const [alertaModal, setAlertaModal] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatPedidoId, setChatPedidoId] = useState(null);
  const [dialog, setDialog] = useState({ open: false, type: 'success', title: '', message: '', onConfirm: null });
  const navigate = useNavigate();

  const cargar = useCallback(async () => {
    try {
      const [pedidosRes, zonasRes] = await Promise.all([
        api.get('/api/reparto/disponibles'),
        api.get('/api/reparto/zonas-calientes').catch(() => ({ data: [] })),
      ]);
      setDisponibles(pedidosRes.data);
      setZonas(zonasRes.data);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); const i = setInterval(cargar, 20000); return () => clearInterval(i); }, [cargar]);

  // Escuchar en tiempo real nuevos pedidos disponibles
  useEffect(() => {
    const socket = io('http://127.0.0.1:3000', {
      query: { userRole: 'Repartidor' },
      withCredentials: true,
    });
    socket.on('pedido:disponible-nuevo', () => {
      cargar();
    });
    return () => { socket.disconnect(); };
  }, [cargar]);

  const tomarPedido = async (id) => {
    setTomando(id);
    try {
      await api.post(`/api/reparto/${id}/tomar`);
      navigate('/repartidor/activo');
    } catch (err) {
      setDialog({ open: true, type: 'error', title: 'Error', message: err.response?.data?.error || 'Error al tomar el pedido', onConfirm: null });
      cargar();
    } finally {
      setTomando(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Loader size={32} className="spinner" />
        <p>Buscando pedidos disponibles...</p>
      </div>
    );
  }

  return (
    <>
      <header className="main-header">
        <h1>Pedidos Disponibles</h1>
        <span className="badge-available">{disponibles.length} pedidos</span>
      </header>

      {zonas.length > 0 && (
        <div className="zones-bar">
          <Zap size={16} />
          <span>Zonas con alta demanda:</span>
          {zonas.slice(0, 2).map((z) => (
            <span key={z.zona} className="zone-chip">
              {z.zona} ({z.probabilidad}%)
            </span>
          ))}
        </div>
      )}

      <div className="orders-feed">
        {disponibles.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No hay pedidos disponibles</h3>
            <p>Los nuevos pedidos aparecerán aquí automáticamente</p>
            {zonas.length > 0 && (
              <div className="zones-suggestion">
                <p>Sugerencia:</p>
                {zonas.map((z) => (
                  <div key={z.zona} className="zone-card">
                    <strong>{z.zona}</strong>
                    <span>{z.probabilidad}% probabilidad de pedidos</span>
                    <div className="zone-bar-bg">
                      <div className="zone-bar-fill" style={{ width: `${z.probabilidad}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          disponibles.map((p) => (
            <div
              key={p.id_pedido}
              className={`order-card ${expandido === p.id_pedido ? 'order-card--expanded' : ''}`}
            >
              <div className="order-card-header" onClick={() => setExpandido(expandido === p.id_pedido ? null : p.id_pedido)}>
                <div className="order-card-left">
                  <div className="order-card-badge">
                    <span className="status-dot dot-green" />
                    Disponible
                    {p.alerta && (
                      <button
                        className="alerta-badge-btn"
                        onClick={(e) => { e.stopPropagation(); setAlertaModal(p.alerta); }}
                        title="Ver motivo"
                      >
                        <AlertTriangle size={12} />
                      </button>
                    )}
                  </div>
                  <h3>Pedido #{p.id_pedido}</h3>
                  <span className="order-card-cliente"><User size={12} /> {p.cliente}</span>
                </div>
                <div className="order-card-right">
                  <span className="order-card-price">${Number(p.total).toLocaleString()}</span>
                  {expandido === p.id_pedido ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              <div className="order-card-preview">
                <MapPin size={14} />
                <span>{p.direccion || 'Sin dirección'}</span>
              </div>

              {p.alerta && (
                <div className="order-card-alerta" onClick={() => setAlertaModal(p.alerta)}>
                  <AlertTriangle size={14} />
                  <span>{p.alerta.motivo.length > 60 ? p.alerta.motivo.slice(0, 60) + '...' : p.alerta.motivo}</span>
                </div>
              )}

              {expandido === p.id_pedido && (
                <div className="order-card-body">
                  <div className="order-card-detail-row">
                    <MapPin size={16} />
                    <div>
                      <strong>Dirección de entrega</strong>
                      <p>{p.direccion || 'No especificada'}</p>
                    </div>
                  </div>
                  <div className="order-card-detail-row">
                    <DollarSign size={16} />
                    <div>
                      <strong>Total del pedido</strong>
                      <p>${Number(p.total).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="order-card-detail-row">
                    <Clock size={16} />
                    <div>
                      <strong>Fecha</strong>
                      <p>{new Date(p.fecha).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="order-card-items">
                    <strong>Productos ({p.items?.length || 0})</strong>
                    <div className="order-card-items-grid">
                      {p.items?.map((item, i) => (
                        <div key={i} className="order-card-item">
                          {item.imagen && <img src={item.imagen} alt="" className="order-card-item-img" />}
                          <div className="order-card-item-info">
                            <span>{item.nombre}</span>
                            <span className="order-card-item-qty">x{item.cantidad}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn-tomar"
                      onClick={() => tomarPedido(p.id_pedido)}
                      disabled={tomando === p.id_pedido}
                      style={{ flex: 1 }}
                    >
                      {tomando === p.id_pedido ? (
                        <>Tomando pedido...</>
                      ) : (
                        <>Tomar Pedido</>
                      )}
                    </button>
                    <button
                      className="btn-chat-repartidor"
                      onClick={() => { setChatPedidoId(p.id_pedido); setShowChat(true); }}
                      title="Chatear con el administrador"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
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
          </div>
        </div>
      )}

      {showChat && chatPedidoId && (
        <ChatModal
          pedidoId={chatPedidoId}
          onClose={() => { setShowChat(false); setChatPedidoId(null); }}
        />
      )}

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

export default PedidosDisponibles;
