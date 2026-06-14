import { ShoppingBag, Truck, X } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { useAuth } from '../context/AuthContext';

const SimulationToolbar = () => {
  const { enterClientMode, enterRepartidorMode, exitSimulation, activeMode, isSimulating } = useSimulation();
  const { user } = useAuth();

  const isCliente = activeMode === 'cliente';

  if (isSimulating) {
    return (
      <div className={`sim-toolbar sim-toolbar--active ${isCliente ? 'sim-toolbar--cliente' : 'sim-toolbar--repartidor'}`}>
        <div className="sim-toolbar-info">
          <span className="sim-toolbar-badge">{isCliente ? 'CLIENTE' : 'REPARTIDOR'}</span>
          <span className="sim-toolbar-desc">
            MODO SIMULACION ACTIVO: {isCliente ? 'CLIENTE' : 'REPARTIDOR'} | Operador: <strong>{user?.nombre || 'Administrador'}</strong>
          </span>
        </div>
        <button className="sim-toolbar-exit" onClick={exitSimulation}>
          <X size={16} />
          Salir del Modo
        </button>
      </div>
    );
  }

  return (
    <div className="sim-toolbar">
      <div className="sim-toolbar-info">
        <span className="sim-toolbar-label">Modo Simulación</span>
        <span className="sim-toolbar-desc">Operando como: <strong>{user?.nombre || 'Administrador'}</strong></span>
      </div>
      <div className="sim-toolbar-actions">
        <button className="sim-btn sim-btn-cliente" onClick={enterClientMode}>
          <ShoppingBag size={20} />
          <span>Modo Cliente</span>
        </button>
        <button className="sim-btn sim-btn-repartidor" onClick={enterRepartidorMode}>
          <Truck size={20} />
          <span>Modo Repartidor</span>
        </button>
      </div>
    </div>
  );
};

export default SimulationToolbar;
