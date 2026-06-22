import { Truck, X } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { useAuth } from '../context/AuthContext';

const SimulationToolbar = () => {
  const { enterRepartidorMode, exitSimulation, activeMode, isSimulating } = useSimulation();
  const { user } = useAuth();

  if (isSimulating) {
    return (
      <div className="sim-toolbar sim-toolbar--active sim-toolbar--repartidor">
        <div className="sim-toolbar-info">
          <span className="sim-toolbar-badge">REPARTIDOR</span>
          <span className="sim-toolbar-desc">
            MODO SIMULACION ACTIVO: REPARTIDOR | Operador: <strong>{user?.nombre || 'Administrador'}</strong>
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
        <button className="sim-btn sim-btn-repartidor" onClick={enterRepartidorMode}>
          <Truck size={20} />
          <span>Modo Repartidor</span>
        </button>
      </div>
    </div>
  );
};

export default SimulationToolbar;
