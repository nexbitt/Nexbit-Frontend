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

// Paleta semantica — 11 hues únicos, ninguno se repite
export const STATUS_COLORS = {
  PENDIENTE:   { bg: '#fef3c7', color: '#92400e' },
  CONFIRMADO:  { bg: '#e0f2fe', color: '#0369a1' },
  EN_REVISION: { bg: '#ffedd5', color: '#c2410c' },
  APROBADO:    { bg: '#d1fae5', color: '#065f46' },
  RECHAZADO:   { bg: '#fee2e2', color: '#dc2626' },
  ASIGNADO:    { bg: '#dbeafe', color: '#1d4ed8' },
  EN_CAMINO:   { bg: '#ede9fe', color: '#6d28d9' },
  ENTREGADO:   { bg: '#ccfbf1', color: '#0f766e' },
  CANCELADO:   { bg: '#ffe4e6', color: '#be123c' },
  DISPONIBLE:  { bg: '#cffafe', color: '#0891b2' },
  EN_REPARTO:  { bg: '#e0e7ff', color: '#4338ca' },
};

export const TICKET_STATUS_COLORS = {
  PENDIENTE:   { bg: '#fef3c7', color: '#92400e' },
  CONFIRMADO:  { bg: '#e0f2fe', color: '#0369a1' },
  EN_REVISION: { bg: '#ffedd5', color: '#c2410c' },
  APROBADO:    { bg: '#d1fae5', color: '#065f46' },
  RECHAZADO:   { bg: '#fee2e2', color: '#dc2626' },
  ASIGNADO:    { bg: '#dbeafe', color: '#1d4ed8' },
  EN_CAMINO:   { bg: '#ede9fe', color: '#6d28d9' },
  ENTREGADO:   { bg: '#ccfbf1', color: '#0f766e' },
  CANCELADO:   { bg: '#ffe4e6', color: '#be123c' },
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
