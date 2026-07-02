import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { Package, CheckCircle, Clock, Bike, MapPin, TrendingUp } from 'lucide-react';

const InicioRepartidor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [repartidorRes, statsRes] = await Promise.all([
          api.get(`/api/v1/repartidores/${user?.id_usuario}`).catch(() => ({ data: null })),
          api.get('/api/v1/reparto/stats').catch(() => ({ data: { disponibles: 0, activo: 0, entregados: 0, cancelados: 0 } })),
        ]);
        setDatos(repartidorRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id_usuario) cargar();
    else setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        <div className="spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  const quickActions = [
    {
      icon: Package,
      label: 'Pedidos Disponibles',
      desc: `${stats?.disponibles || 0} pedidos esperando`,
      color: '#22c55e',
      route: '/repartidor/disponibles',
    },
    {
      icon: Bike,
      label: 'En Reparto',
      desc: stats?.activo > 0 ? 'Tienes un pedido activo' : 'Sin pedido activo',
      color: '#f59e0b',
      route: '/repartidor/activo',
    },
    {
      icon: Clock,
      label: 'Historial',
      desc: `${(stats?.entregados || 0) + (stats?.cancelados || 0)} pedidos completados`,
      color: '#6366f1',
      route: '/repartidor/historial',
    },
    {
      icon: TrendingUp,
      label: 'Estadísticas',
      desc: `${stats?.entregados || 0} entregados · ${stats?.cancelados || 0} cancelados`,
      color: '#3b82f6',
      route: '/repartidor/historial',
    },
  ];

  return (
    <>
      <header className="main-header">
        <h1>Bienvenido, {user?.nombre || 'Repartidor'}</h1>
      </header>

      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { Icon: Package, label: 'Disponibles', value: stats?.disponibles || 0, color: '#22c55e' },
            { Icon: Bike, label: 'En reparto', value: stats?.activo || 0, color: '#f59e0b' },
            { Icon: CheckCircle, label: 'Entregados', value: stats?.entregados || 0, color: '#10b981' },
            { Icon: MapPin, label: 'Cancelados', value: stats?.cancelados || 0, color: '#ef4444' },
          ].map(({ Icon, label, value, color }) => (
            <div key={label} className="modal-box" style={{
              margin: 0, position: 'relative', transform: 'none',
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                backgroundColor: color + '20', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Icon size={24} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="quick-actions-grid">
          {quickActions.map(({ icon: Icon, label, desc, color, route }) => (
            <div
              key={label}
              className="quick-action-card"
              onClick={() => navigate(route)}
              role="button"
              tabIndex={0}
            >
              <div className="quick-action-icon" style={{ backgroundColor: color + '20', color }}>
                <Icon size={24} />
              </div>
              <div className="quick-action-info">
                <strong>{label}</strong>
                <span>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default InicioRepartidor;
