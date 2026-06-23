import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Clock, ChevronRight } from 'lucide-react';
import api from '../../api';
import { FSM_STATUS } from '../../constants/orderStatuses';

const ActiveBanner = ({ repartidorId }) => {
  const [activo, setActivo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkActivo = async () => {
      try {
        const res = await api.get('/api/reparto/activo');
        setActivo(res.data);
      } catch {
        setActivo(null);
      }
    };
    checkActivo();
    const interval = setInterval(checkActivo, 15000);
    return () => clearInterval(interval);
  }, [repartidorId]);

  if (!activo) return null;

  const tiempoEstimado = activo.estado_fsm === FSM_STATUS.EN_CAMINO
    ? 'En camino al destino'
    : 'Preparando entrega';

  return (
    <div
      className="active-banner"
      onClick={() => navigate('/repartidor/activo')}
      role="button"
      tabIndex={0}
    >
      <div className="active-banner-pulse" />
      <div className="active-banner-content">
        <div className="active-banner-icon">
          <Bike size={22} />
        </div>
        <div className="active-banner-info">
          <div className="active-banner-title">Pedido Activo #{activo.id_pedido}</div>
          <div className="active-banner-subtitle">
            <Clock size={14} />
            <span>{tiempoEstimado}</span>
          </div>
        </div>
        <div className="active-banner-eta">
          <span className={`status-dot ${activo.estado_fsm === FSM_STATUS.EN_CAMINO ? 'dot-blue' : 'dot-green'}`} />
        </div>
        <ChevronRight size={20} className="active-banner-arrow" />
      </div>
    </div>
  );
};

export default ActiveBanner;
