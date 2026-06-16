import React from 'react';
import { X, CheckCircle, Package } from 'lucide-react';
import api from '../../../api';

const ModalDetallePedido = ({ pedido, tipo, alCerrar, alActualizar }) => {
  if (!pedido) return null;

  const manejarAceptar = async () => {
    try {
      await api.post(`/api/reparto/pedidos/${pedido.id_pedido}/aceptar`);
      alert("Pedido aceptado con éxito");
      alActualizar();
      alCerrar();
    } catch (error) {
      if (error.response?.status === 409) {
        alert("El pedido ya fue tomado por otro repartidor o no está disponible.");
        alActualizar();
        alCerrar();
      } else {
        alert("Ocurrió un error al aceptar el pedido.");
      }
    }
  };

  const manejarEntregar = async () => {
    if (window.confirm("¿Estás seguro de que deseas confirmar la entrega de este pedido?")) {
      try {
        await api.post(`/api/reparto/pedidos/${pedido.id_pedido}/entregar`);
        alert("Entrega confirmada con éxito");
        alActualizar();
        alCerrar();
      } catch (error) {
        alert("Ocurrió un error al confirmar la entrega.");
      }
    }
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold">Detalle del Pedido #{pedido.id_pedido}</h5>
            <button type="button" className="btn-close" onClick={alCerrar} aria-label="Close"></button>
          </div>
          
          <div className="modal-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <h6 className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '0.8rem' }}>Información del Cliente</h6>
                <p className="mb-1"><strong>Nombre:</strong> {pedido.usuario?.nombre}</p>
                <p className="mb-1"><strong>Teléfono:</strong> {pedido.usuario?.telefono || 'N/A'}</p>
                <p className="mb-0"><strong>Dirección:</strong> {pedido.direccion_entrega || pedido.usuario?.direccion}</p>
              </div>
              <div className="col-md-6 border-start">
                <h6 className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '0.8rem' }}>Detalles del Pago</h6>
                <p className="mb-1"><strong>Subtotal:</strong> ${pedido.subtotal}</p>
                <p className="mb-1"><strong>Impuestos:</strong> ${pedido.impuesto}</p>
                <p className="mb-0 fs-5"><strong>Total:</strong> <span className="text-success fw-bold">${pedido.total}</span></p>
              </div>
            </div>

            <h6 className="text-muted fw-bold text-uppercase mb-3" style={{ fontSize: '0.8rem' }}>Productos</h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th className="text-center">Cant.</th>
                    <th className="text-end">Precio Unit.</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.detalle_pedido?.map(detalle => (
                    <tr key={detalle.id_detalle_pedido}>
                      <td>{detalle.producto?.nombre}</td>
                      <td className="text-center">{detalle.cantidad}</td>
                      <td className="text-end">${detalle.precio_unitario}</td>
                      <td className="text-end fw-bold">${detalle.subtotal}</td>
                    </tr>
                  ))}
                  {(!pedido.detalle_pedido || pedido.detalle_pedido.length === 0) && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">No hay detalles de productos disponibles</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {pedido.notas_entrega && (
              <div className="alert alert-warning mt-3 mb-0">
                <strong>Notas de Entrega:</strong> {pedido.notas_entrega}
              </div>
            )}
          </div>
          
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary" onClick={alCerrar}>Cerrar</button>
            {tipo === 'disponible' ? (
              <button type="button" className="btn btn-primary d-flex align-items-center" onClick={manejarAceptar}>
                <Package size={18} className="me-2" />
                Aceptar Pedido
              </button>
            ) : (
              <button type="button" className="btn btn-success d-flex align-items-center" onClick={manejarEntregar}>
                <CheckCircle size={18} className="me-2" />
                Confirmar Entrega
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetallePedido;
