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
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
  ASIGNADO: 'ASIGNADO',
  EN_CAMINO: 'EN CAMINO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
  DISPONIBLE: 'DISPONIBLE',
  EN_REPARTO: 'EN REPARTO',
};

export const STATUS_COLORS = {
  PENDIENTE: { bg: '#fef9c3', color: '#854d0e' },
  CONFIRMADO: { bg: '#f0fdf4', color: '#166534' },
  EN_REVISION: { bg: '#fefce8', color: '#92400e' },
  APROBADO: { bg: '#f0fdf4', color: '#166534' },
  RECHAZADO: { bg: '#fef2f2', color: '#991b1b' },
  ASIGNADO: { bg: '#eff6ff', color: '#1e40af' },
  EN_CAMINO: { bg: '#fff7ed', color: '#c2410c' },
  ENTREGADO: { bg: '#dbeafe', color: '#1e3a8a' },
  CANCELADO: { bg: '#fee2e2', color: '#b91c1c' },
  DISPONIBLE: { bg: '#f0fdf4', color: '#166534' },
  EN_REPARTO: { bg: '#fef9c3', color: '#854d0e' },
};

export const TICKET_STATUS_COLORS = {
  PENDIENTE: { bg: '#fef3c7', color: '#b45309' },
  CONFIRMADO: { bg: '#dcfce7', color: '#15803d' },
  EN_REVISION: { bg: '#fefce8', color: '#92400e' },
  APROBADO: { bg: '#dcfce7', color: '#15803d' },
  RECHAZADO: { bg: '#fee2e2', color: '#b91c1c' },
  ASIGNADO: { bg: '#eff6ff', color: '#1e40af' },
  EN_CAMINO: { bg: '#fff7ed', color: '#c2410c' },
  ENTREGADO: { bg: '#dbeafe', color: '#1e3a8a' },
  CANCELADO: { bg: '#fee2e2', color: '#b91c1c' },
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
