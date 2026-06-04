import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { connectRepartidorSocket, disconnectSocket } from '../../socket';
import { Bike, MapPin, Phone, AlertTriangle, CheckCircle, XCircle, PackageSearch, MessageSquare } from 'lucide-react';
import { ORDER_STATUS, FSM_STATUS } from '../../constants/orderStatuses';
import ChatModal from '../../components/ChatModal';

const PedidoActivo = () => {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accion, setAccion] = useState(null);
  const [swipeConfirm, setSwipeConfirm] = useState(false);
  const [problemaModal, setProblemaModal] = useState(false);
  const [descripcionProblema, setDescripcionProblema] = useState('');
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  const cargar = useCallback(async () => {
    try {
      const res = await api.get('/api/reparto/activo');
      setPedido(res.data);
    } catch {
      setPedido(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const socket = connectRepartidorSocket(null);
    socket.on('pedido:estado', (data) => {
      if (data.estado === ORDER_STATUS.ENTREGADO || data.estado === ORDER_STATUS.CANCELADO) {
        cargar();
      }
    });
    return () => { disconnectSocket(); };
  }, [cargar]);

  const marcarEnCamino = async () => {
    setAccion('camino');
    try {
      await api.put(`/api/reparto/${pedido.id_pedido}/en-camino`);
      setPedido((prev) => ({ ...prev, estado_fsm: FSM_STATUS.EN_CAMINO, estado_db: ORDER_STATUS.EN_CAMINO }));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setAccion(null);
    }
  };

  const confirmarEntrega = async () => {
    setAccion('entregar');
    try {
      await api.post(`/api/reparto/${pedido.id_pedido}/entregar`);
      setPedido(null);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al confirmar entrega');
    } finally {
      setAccion(null);
    }
  };

  const reportarProblema = async () => {
    if (!descripcionProblema.trim()) return;
    setAccion('problema');
    try {
      const res = await api.post(`/api/reparto/${pedido.id_pedido}/problema`, {
        descripcion: descripcionProblema,
      });
      alert(res.data.message);
      setProblemaModal(false);
      setDescripcionProblema('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al reportar');
    } finally {
      setAccion(null);
    }
  };

  const cancelarPedido = async () => {
    if (!window.confirm('¿Estás seguro de cancelar este pedido?')) return;
    setAccion('cancelar');
    try {
      await api.put(`/api/reparto/${pedido.id_pedido}/cancelar`, { motivo: 'Cancelado por repartidor' });
      setPedido(null);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar');
    } finally {
      setAccion(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
        <p>Cargando pedido activo...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <>
        <header className="main-header">
          <h1>En Reparto</h1>
        </header>
        <div className="empty-state">
          <PackageSearch size={64} />
          <h3>No tienes un pedido activo</h3>
          <p>Ve a pedidos disponibles para tomar uno</p>
          <button className="btn-tomar" onClick={() => navigate('/repartidor/disponibles')} style={{ maxWidth: 300, margin: '1rem auto 0' }}>
            Ver Pedidos Disponibles
          </button>
        </div>
      </>
    );
  }

  const enCamino = pedido.estado_fsm === FSM_STATUS.EN_CAMINO || pedido.estado_db === ORDER_STATUS.EN_CAMINO;

  return (
    <>
      <header className="main-header">
        <h1>Pedido Activo #{pedido.id_pedido}</h1>
        <span className={`badge-${enCamino ? 'camino' : 'reparto'}`}>
          <span className={`status-dot ${enCamino ? 'dot-yellow' : 'dot-green'}`} />
          {enCamino ? 'En camino' : 'Preparando'}
        </span>
      </header>

      <div className="active-delivery">
        <div className="delivery-progress">
          <div className="progress-steps">
            <div className={`progress-step ${!enCamino ? 'active' : 'done'}`}>
              <div className="step-dot" />
              <span>Tomado</span>
            </div>
            <div className={`progress-step ${enCamino ? 'active' : ''} ${pedido.estado_fsm === FSM_STATUS.ENTREGADO ? 'done' : ''}`}>
              <div className="step-dot" />
              <span>En camino</span>
            </div>
            <div className="progress-step">
              <div className="step-dot" />
              <span>Entregado</span>
            </div>
          </div>
        </div>

        <div className="delivery-card cliente-info">
          <h3>Cliente</h3>
          <div className="delivery-info-row">
            <MapPin size={18} />
            <div>
              <strong>Dirección</strong>
              <p>{pedido.direccion || 'No especificada'}</p>
            </div>
          </div>
          <div className="delivery-info-row">
            <Phone size={18} />
            <div>
              <strong>Teléfono</strong>
              <p>{pedido.telefono || 'No disponible'}</p>
            </div>
          </div>
        </div>

        <div className="delivery-card items-card">
          <h3>Productos ({pedido.items?.length || 0})</h3>
          <div className="delivery-items">
            {pedido.items?.map((item, i) => (
              <div key={i} className="delivery-item">
                {item.imagen && <img src={item.imagen} alt="" className="delivery-item-img" />}
                <div className="delivery-item-info">
                  <span className="delivery-item-name">{item.nombre}</span>
                  <span className="delivery-item-qty">x{item.cantidad}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="delivery-total">
            <span>Total</span>
            <strong>${Number(pedido.total).toLocaleString()}</strong>
          </div>
        </div>

        <div className="delivery-actions">
          {!enCamino ? (
            <button
              className="btn-cta btn-cta-camino"
              onClick={marcarEnCamino}
              disabled={accion === 'camino'}
            >
              <Bike size={20} />
              {accion === 'camino' ? 'Actualizando...' : 'En Camino al Destino'}
            </button>
          ) : (
            <>
              {!swipeConfirm ? (
                <button
                  className="btn-cta btn-cta-entregar"
                  onClick={() => setSwipeConfirm(true)}
                >
                  <CheckCircle size={20} />
                  Confirmar Entrega
                </button>
              ) : (
                <div className="swipe-confirm">
                  <p>¿Confirmar entrega?</p>
                  <div className="swipe-confirm-actions">
                    <button
                      className="btn-swiped"
                      onClick={confirmarEntrega}
                      disabled={accion === 'entregar'}
                    >
                      {accion === 'entregar' ? 'Confirmando...' : 'Sí, entregado'}
                    </button>
                    <button
                      className="btn-cancel-action"
                      onClick={() => setSwipeConfirm(false)}
                    >
                      Volver
                    </button>
                  </div>
                </div>
              )}

              <div className="delivery-problem-actions">
                <button
                  className="btn-problema"
                  onClick={() => setProblemaModal(true)}
                >
                  <AlertTriangle size={16} />
                  Reportar problema
                </button>
                <button
                  className="btn-chat-repartidor"
                  onClick={() => setShowChat(true)}
                  title="Chatear con el administrador"
                >
                  <MessageSquare size={16} />
                  Chat
                </button>
                <button
                  className="btn-cancelar-entrega"
                  onClick={cancelarPedido}
                  disabled={accion === 'cancelar'}
                >
                  <XCircle size={16} />
                  {accion === 'cancelar' ? 'Cancelando...' : 'Cancelar pedido'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {problemaModal && (
        <div className="modal-backdrop" onClick={() => setProblemaModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Reportar problema</h2>
            <p className="modal-desc">Describe el problema con la entrega</p>
            <textarea
              className="form-input"
              placeholder="Ej: El cliente no responde..."
              value={descripcionProblema}
              onChange={(e) => setDescripcionProblema(e.target.value)}
              rows={4}
            />
            <p className="modal-advice">Si no se resuelve en 5 minutos, se cancelará automáticamente.</p>
            <div className="modal-actions">
              <button className="btn-cancel-action" onClick={() => setProblemaModal(false)}>
                Cancelar
              </button>
              <button
                className="btn-save"
                onClick={reportarProblema}
                disabled={!descripcionProblema.trim() || accion === 'problema'}
              >
                {accion === 'problema' ? 'Enviando...' : 'Reportar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showChat && pedido && (
        <ChatModal
          pedidoId={pedido.id_pedido}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};

export default PedidoActivo;
