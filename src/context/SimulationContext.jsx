import { createContext, useContext, useState, useCallback } from 'react';

const SimulationContext = createContext();
export const useSimulation = () => useContext(SimulationContext);

export const SimulationProvider = ({ children }) => {
  const [activeMode, setActiveMode] = useState(null); // 'cliente' | 'repartidor' | null

  const enterClientMode = useCallback(() => setActiveMode('cliente'), []);
  const enterRepartidorMode = useCallback(() => setActiveMode('repartidor'), []);
  const exitSimulation = useCallback(() => setActiveMode(null), []);

  const isSimulating = activeMode !== null;

  return (
    <SimulationContext.Provider value={{
      activeMode,
      isSimulating,
      enterClientMode,
      enterRepartidorMode,
      exitSimulation
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export default SimulationContext;
