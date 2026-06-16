/**
 * @file ToggleRow.jsx
 * @description Componente reutilizable de fila con toggle switch.
 * Usado en Perfil.jsx y PerfilRepartidor.jsx.
 */
const ToggleRow = ({ Icon, label, sub, value, onChange, noBorder = false }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    ...(noBorder ? {} : { borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' })
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Icon size={20} color="#475569" />
      <div>
        <h4 style={{ margin: 0, fontSize: '1rem' }}>{label}</h4>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{sub}</span>
      </div>
    </div>
    <button
      onClick={onChange}
      style={{
        width: '45px', height: '24px', borderRadius: '12px', border: 'none',
        cursor: 'pointer', position: 'relative', transition: 'background-color 0.3s',
        backgroundColor: value ? 'var(--primary)' : '#cbd5e1'
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
        position: 'absolute', top: '2px',
        left: value ? '23px' : '2px', transition: 'left 0.3s'
      }} />
    </button>
  </div>
);

export default ToggleRow;
