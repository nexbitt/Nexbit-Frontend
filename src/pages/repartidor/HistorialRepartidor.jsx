import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { connectRepartidorSocket, disconnectSocket } from '../../socket';
import { CheckCircle, XCircle, Clock, ChevronRight, Loader } from 'lucide-react';

const FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'entregados', label: 'Entregados' },
  { key: 'cancelados', label: 'Cancelados' },
];

const HistorialRepartidor = () => {
  const [historial, setHistorial] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const cargar = useCallback(async () => {
    try {
      const res = await api.get(`/api/reparto/historial?filtro=${filtro}`);
      setHistorial(res.data);
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    cargar();
    const socket = connectRepartidorSocket(null);
    socket.on('pedido:estado', (data) => {
      if (data.estado === 'ENTREGADO' || data.estado === 'CANCELADO') {
        cargar();
      }
    });
    return () => { disconnectSocket(); };
  }, [cargar]);

  if (loading) {
    return (
      <div className="page-loading">
        <Loader size={32} className="spinner" />
        <p>Cargando historial...</p>
      </div>
    );
  }

  const entregados = historial.filter((p) => p.estado_fsm === 'ENTREGADO').length;
  const cancelados = historial.filter((p) => p.estado_fsm === 'CANCELADO').length;

  return (
    <>
      <header className="main-header">
        <h1>Historial</h1>
        {historial.length > 0 && (
          <div className="historial-stats">
            <span className="stat-entregados"><span className="status-dot dot-blue"></span> {entregados} entregados</span>
            <span className="stat-cancelados"><span className="status-dot dot-red"></span> {cancelados} cancelados</span>
          </div>
        )}
      </header>

      {historial.length === 0 && filtro === 'todos' ? (
        <div className="empty-state">
          <Clock size={48} />
          <h3>Sin historial aún</h3>
          <p>Completa tu primera entrega para ver el historial</p>
        </div>
      ) : (
        <>
          <div className="historial-filtros">
            {FILTROS.map((f) => (
              <button
                key={f.key}
                className={`chip ${filtro === f.key ? 'chip--active' : ''}`}
                onClick={() => { setFiltro(f.key); setLoading(true); }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {historial.length === 0 ? (
            <div className="empty-state">
              <PackageEmpty />
              <p>No hay pedidos {filtro === 'entregados' ? 'entregados' : 'cancelados'}</p>
            </div>
          ) : (
            <div className="historial-list">
              {historial.map((p) => (
                <div key={p.id_pedido} className={`historial-card ${p.estado_fsm === 'ENTREGADO' ? 'card-entregado' : 'card-cancelado'}`}>
                  <div className="historial-card-left">
                    <div className="historial-card-icon">
                      {p.estado_fsm === 'ENTREGADO' ? (
                        <CheckCircle size={24} className="icon-entregado" />
                      ) : (
                        <XCircle size={24} className="icon-cancelado" />
                      )}
                    </div>
                    <div className="historial-card-info">
                      <h3>Pedido #{p.id_pedido}</h3>
                      <p className="historial-card-client">{p.cliente}</p>
                      <div className="historial-card-meta">
                        <span>${Number(p.total).toLocaleString()}</span>
                        <span>{p.items?.length || 0} productos</span>
                        {p.fecha_entrega && (
                          <span className="historial-date">
                            {new Date(p.fecha_entrega).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="historial-arrow" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
};

const PackageEmpty = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export default HistorialRepartidor;
