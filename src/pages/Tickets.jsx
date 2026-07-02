import { useState, useEffect } from 'react';
import api from '../api';
import { Receipt, FileDown } from 'lucide-react';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/facturas')
      .then(response => {
        setTickets(response.data.data || response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al recuperar facturas:", error);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
          Tickets / Facturas
        </h2>
        <p style={{ fontSize: '13px', color: '#8E8E93', marginTop: '4px' }}>
          {tickets.length} registros encontrados
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <div className="spinner" />
          <p style={{ marginTop: '1rem' }}>Cargando facturas...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
          <Receipt size={64} style={{ color: '#4F46E5', opacity: 0.5, marginBottom: '1.5rem' }} />
          <h2>No hay facturas registradas</h2>
          <p>Las facturas se generan automáticamente al crear pedidos.</p>
        </div>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket.id_factura}
            style={{
              width: '100%',
              background: '#fff',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              boxSizing: 'border-box',
            }}
          >
            {/* Bloque Izquierdo: Icono circular */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Receipt size={16} color="#4F46E5" />
            </div>

            {/* Bloque Central */}
            <div style={{ flex: 1, marginLeft: '12px', minWidth: 0 }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#111827',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {ticket.numero_factura || `Factura #${ticket.id_factura}`}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#8E8E93',
                  marginTop: '2px',
                }}
              >
                Total: ${Number(ticket.total || 0).toLocaleString('es-CO')} · Pedido #{ticket.pedido_id}
              </div>
            </div>

            {/* Bloque Derecho: Botón descarga */}
            <button
              title="Descargar PDF"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #E5E7EB',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                padding: 0,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              onClick={() => {/* TODO: descargar PDF */}}
            >
              <FileDown size={16} color="#111827" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default Tickets;