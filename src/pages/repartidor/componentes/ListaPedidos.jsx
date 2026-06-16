import React from 'react';
import TarjetaPedido from './TarjetaPedido';

const ListaPedidos = ({ pedidos, tipo, alVer }) => {
  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="alert alert-info text-center" role="alert">
        No hay pedidos en esta sección.
      </div>
    );
  }

  return (
    <div className="order-list">
      {pedidos.map((pedido) => (
        <TarjetaPedido key={pedido.id_pedido} pedido={pedido} alVer={alVer} />
      ))}
    </div>
  );
};

export default ListaPedidos;
