import React from 'react';

const Ayuda = () => {
  return (
    <div className="module-container">
      <div className="module-header">
        <h1 className="module-title-table">Centro de Ayuda</h1>
      </div>
      <div className="module-content">
        <p>Bienvenido al centro de ayuda. Aquí resolveremos tus dudas frecuentes.</p>
        <ul>
          <li><strong>¿Cómo comprar?</strong> Agrega productos al carrito y procede al pedido. Si eres invitado, se te pedirá iniciar sesión.</li>
          <li><strong>¿Tiempos de entrega?</strong> Nuestro tiempo estimado es de 3 a 5 días hábiles.</li>
        </ul>
      </div>
    </div>
  );
};

export default Ayuda;
