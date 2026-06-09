export const ORDER_STATUS = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADO: 'CONFIRMADO',
  EN_REVISION: 'EN_REVISION',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
  ASIGNADO: 'ASIGNADO',
  EN_CAMINO: 'EN_CAMINO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
};

export const FSM_STATUS = {
  DISPONIBLE: 'DISPONIBLE',
  EN_REPARTO: 'EN_REPARTO',
  APROBADO: 'APROBADO',
  EN_REVISION: 'EN_REVISION',
  RECHAZADO: 'RECHAZADO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
};

export const STATUS_LABELS = {
  PENDIENTE: 'PENDIENTE DE PAGO',
  CONFIRMADO: 'CONFIRMADO',
  EN_REVISION: 'EN REVISIÓN',
  APROBADO: 'ACEPTADO',
  RECHAZADO: 'RECHAZADO',
  ASIGNADO: 'ASIGNADO',
  EN_CAMINO: 'EN CAMINO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
  DISPONIBLE: 'DISPONIBLE',
  EN_REPARTO: 'EN REPARTO',
};

// Paleta semantica coherente:
//   Verde  → completado / aprobado / confirmado (ENTREGADO, APROBADO, CONFIRMADO)
//   Rojo   → cancelado / rechazado (CANCELADO, RECHAZADO)
//   Azul   → en proceso / asignado / reparto (ASIGNADO, EN_CAMINO, EN_REPARTO)
//   Teal   → disponible / listo para tomar (DISPONIBLE, CONFIRMADO)
//   Amarillo → pendiente / espera (PENDIENTE)
//   Naranja → requiere revision (EN_REVISION)
export const STATUS_COLORS = {
  PENDIENTE:   { bg: '#fef9c3', color: '#854d0e' },
  CONFIRMADO:  { bg: '#ecfdf5', color: '#065f46' },
  EN_REVISION: { bg: '#fff7ed', color: '#c2410c' },
  APROBADO:    { bg: '#f0fdf4', color: '#166534' },
  RECHAZADO:   { bg: '#fef2f2', color: '#991b1b' },
  ASIGNADO:    { bg: '#eff6ff', color: '#1e40af' },
  EN_CAMINO:   { bg: '#eef2ff', color: '#4338ca' },
  ENTREGADO:   { bg: '#ecfdf5', color: '#065f46' },
  CANCELADO:   { bg: '#fef2f2', color: '#b91c1c' },
  DISPONIBLE:  { bg: '#f0fdfa', color: '#115e59' },
  EN_REPARTO:  { bg: '#eff6ff', color: '#1e40af' },
};

export const TICKET_STATUS_COLORS = {
  PENDIENTE:   { bg: '#fef9c3', color: '#92400e' },
  CONFIRMADO:  { bg: '#ecfdf5', color: '#065f46' },
  EN_REVISION: { bg: '#fff7ed', color: '#c2410c' },
  APROBADO:    { bg: '#f0fdf4', color: '#166534' },
  RECHAZADO:   { bg: '#fef2f2', color: '#991b1b' },
  ASIGNADO:    { bg: '#eff6ff', color: '#1e40af' },
  EN_CAMINO:   { bg: '#eef2ff', color: '#4338ca' },
  ENTREGADO:   { bg: '#ecfdf5', color: '#065f46' },
  CANCELADO:   { bg: '#fef2f2', color: '#b91c1c' },
};

export const STATUS_TRANSLATIONS = {
  es: {
    PENDIENTE: 'Pendiente de pago',
    CONFIRMADO: 'Confirmado',
    EN_REVISION: 'En revisión',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
    ASIGNADO: 'Asignado',
    EN_CAMINO: 'En camino',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
    DISPONIBLE: 'Disponible',
    EN_REPARTO: 'En reparto',
  },
  en: {
    PENDIENTE: 'Pending payment',
    CONFIRMADO: 'Confirmed',
    EN_REVISION: 'Under review',
    APROBADO: 'Approved',
    RECHAZADO: 'Rejected',
    ASIGNADO: 'Assigned',
    EN_CAMINO: 'On the way',
    ENTREGADO: 'Delivered',
    CANCELADO: 'Cancelled',
    DISPONIBLE: 'Available',
    EN_REPARTO: 'In delivery',
  },
};

export const ALL_STATUSES = Object.values(ORDER_STATUS);
