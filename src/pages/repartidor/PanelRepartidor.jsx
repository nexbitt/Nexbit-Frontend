import React, { useState, useEffect } from 'react';
import ListaPedidos from './componentes/ListaPedidos';
import ModalDetallePedido from './componentes/ModalDetallePedido';
import api from '../../api';
import { RefreshCw } from 'lucide-react';

const PanelRepartidor = () => {
  const [pedidosDisponibles, setPedidosDisponibles] = useState([]);
  const [misPedidos, setMisPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [tipoModal, setTipoModal] = useState('disponible');

  const obtenerPedidos = async () => {
    setCargando(true);
    try {
      const res = await api.get('/api/reparto/pedidos');
      setPedidosDisponibles(res.data.available || []);
      setMisPedidos(res.data.active || []);
    } catch (error) {
      console.error("Error al obtener los pedidos del repartidor", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPedidos();
    // Actualizar pedidos cada 30 segundos
    const intervalo = setInterval(() => {
      obtenerPedidos();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const abrirModal = (pedido, tipo) => {
    setPedidoSeleccionado(pedido);
    setTipoModal(tipo);
  };

  const cerrarModal = () => {
    setPedidoSeleccionado(null);
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold text-dark mb-0">Panel de Reparto</h1>
        <button 
          onClick={obtenerPedidos} 
          className="btn btn-primary d-flex align-items-center"
          disabled={cargando}
        >
          <RefreshCw size={18} className={`me-2 ${cargando ? 'spin' : ''}`} style={cargando ? { animation: 'spin 1s linear infinite' } : {}}/>
          Actualizar
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-2">
              <h4 className="h5 fw-bold text-primary mb-0 d-flex align-items-center">
                <span className="badge bg-primary rounded-pill me-2">{pedidosDisponibles.length}</span>
                Pedidos Disponibles
              </h4>
              <p className="text-muted small mb-0 mt-1">Pedidos esperando por un repartidor</p>
            </div>
            <div className="card-body bg-light rounded-bottom">
              {cargando && pedidosDisponibles.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <ListaPedidos 
                  pedidos={pedidosDisponibles} 
                  tipo="disponible" 
                  alVer={(pedido) => abrirModal(pedido, 'disponible')} 
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-2">
              <h4 className="h5 fw-bold text-success mb-0 d-flex align-items-center">
                <span className="badge bg-success rounded-pill me-2">{misPedidos.length}</span>
                Mis Pedidos (En Camino)
              </h4>
              <p className="text-muted small mb-0 mt-1">Pedidos que has aceptado y debes entregar</p>
            </div>
            <div className="card-body bg-light rounded-bottom">
              {cargando && misPedidos.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <ListaPedidos 
                  pedidos={misPedidos} 
                  tipo="activo" 
                  alVer={(pedido) => abrirModal(pedido, 'activo')} 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {pedidoSeleccionado && (
        <ModalDetallePedido
          pedido={pedidoSeleccionado}
          tipo={tipoModal}
          alCerrar={cerrarModal}
          alActualizar={obtenerPedidos}
        />
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default PanelRepartidor;
