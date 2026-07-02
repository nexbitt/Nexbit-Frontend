import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Lock, ArrowLeft } from 'lucide-react';
import api from '../api';

const STEP_EMAIL = 1;
const STEP_OTP = 2;
const STEP_PASSWORD = 3;

const EyeIcon = ({ size = 20, color = '#64748B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ size = 20, color = '#64748B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ForgotPassword = () => {
  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [fading, setFading] = useState(false);

  const otpRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const transitionTo = useCallback((nextStep) => {
    setFading(true);
    setTimeout(() => {
      setStep(nextStep);
      setFading(false);
    }, 150);
  }, []);

  const renderSpinner = () => (
    <div style={{
      width: 18, height: 18,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto'
    }} />
  );

  // ── Step 1: Request OTP ──────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Ingresa tu correo electrónico.'); return; }
    setLoading(true);
    try {
      await api.post('/api/v1/auth/recover-password', { email });
      setCountdown(60);
      transitionTo(STEP_OTP);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al enviar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/api/v1/auth/recover-password', { email });
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al reenviar el código.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (data.length === 6) {
      setOtp(data.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault?.();
    setError('');
    const code = otp.join('');
    if (code.length !== 6) { setError('Ingresa el código completo de 6 dígitos.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/api/v1/auth/verify-otp', { email, code });
      setResetToken(res.data.data?.token || '');
      transitionTo(STEP_PASSWORD);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Código incorrecto o expirado.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      await api.post('/api/v1/auth/reset-password', {
        email, token: resetToken, newPassword: password
      });
      setSuccess('Contraseña actualizada correctamente.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────
  const renderIconCircle = (bg, icon) => (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      backgroundColor: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', margin: '0 auto 1.25rem'
    }}>
      {icon}
    </div>
  );

  const inputStyle = (hasError) => ({
    width: '100%', height: 44, borderRadius: 8,
    backgroundColor: '#F9FAFB', border: hasError ? '2px solid #EF4444' : '1px solid #D1D5DB',
    padding: '0 14px', fontSize: 14, color: '#111827',
    outline: 'none', boxSizing: 'border-box'
  });

  const inputFocus = (e) => {
    e.target.style.border = '2px solid #10B981';
    e.target.style.backgroundColor = '#fff';
  };

  const inputBlur = (e) => {
    e.target.style.border = '1px solid #D1D5DB';
    e.target.style.backgroundColor = '#F9FAFB';
  };

  const primaryBtnStyle = (disabled) => ({
    width: '100%', height: 44, borderRadius: 8,
    backgroundColor: disabled ? '#E2E8F0' : '#10B981',
    color: disabled ? '#94A3B8' : '#fff',
    border: 'none', fontSize: 14, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  });

  const primaryBtnHover = (e) => {
    if (e.target.disabled) return;
    e.target.style.backgroundColor = '#059669';
  };

  const primaryBtnLeave = (e) => {
    if (e.target.disabled) return;
    e.target.style.backgroundColor = '#10B981';
  };

  const stepContent = () => {
    if (success) return null;

    switch (step) {
      // ────────── STEP 1: Email ──────────
      case STEP_EMAIL:
        return (
          <>
            {renderIconCircle('#E6F4EA', <KeyRound size={24} color="#10B981" />)}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, textAlign: 'center' }}>
              Recuperar contraseña
            </h2>
            <p style={{
              fontSize: 14, color: '#64748B', textAlign: 'center',
              margin: '0.5rem 0 1.75rem', lineHeight: '1.5'
            }}>
              Introduce tu correo electrónico institucional para enviarte un código de verificación de un solo uso.
            </p>

            <form onSubmit={handleSendOtp}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 600,
                  color: '#374151', marginBottom: 6
                }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@remate.com"
                  style={inputStyle()}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={primaryBtnStyle(loading)}
                onMouseEnter={primaryBtnHover}
                onMouseLeave={primaryBtnLeave}
              >
                {loading ? renderSpinner() : 'Enviar código de verificación'}
              </button>
            </form>
          </>
        );

      // ────────── STEP 2: OTP ──────────
      case STEP_OTP:
        return (
          <>
            {renderIconCircle('#E0F2FE', <Mail size={24} color="#0284C7" />)}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, textAlign: 'center' }}>
              Verifica tu correo
            </h2>
            <p style={{
              fontSize: 14, color: '#64748B', textAlign: 'center',
              margin: '0.5rem 0 1.75rem', lineHeight: '1.5'
            }}>
              Hemos enviado un código de 6 dígitos a <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div style={{
                display: 'flex', justifyContent: 'center', gap: 12,
                marginBottom: '1.75rem'
              }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    style={{
                      width: 48, height: 56, borderRadius: 8,
                      backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB',
                      textAlign: 'center', fontSize: 22, fontWeight: 700,
                      color: '#111827', outline: 'none', boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.border = '2px solid #10B981';
                      e.target.style.backgroundColor = '#fff';
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '1px solid #D1D5DB';
                      e.target.style.backgroundColor = '#F9FAFB';
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={primaryBtnStyle(loading)}
                onMouseEnter={primaryBtnHover}
                onMouseLeave={primaryBtnLeave}
              >
                {loading ? renderSpinner() : 'Verificar Código'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: '1.25rem' }}>
              ¿No recibiste el código?{' '}
              {countdown > 0 ? (
                <span style={{ color: '#94A3B8' }}>Reenviar en {countdown}s</span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={{
                    background: 'none', border: 'none', color: '#10B981',
                    fontWeight: 600, fontSize: 13,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline', padding: 0
                  }}
                >
                  Reenviar
                </button>
              )}
            </p>
          </>
        );

      // ────────── STEP 3: New Password ──────────
      case STEP_PASSWORD:
        return (
          <>
            {renderIconCircle('#E6F4EA', <Lock size={24} color="#10B981" />)}
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0, textAlign: 'center' }}>
              Nueva contraseña
            </h2>
            <p style={{
              fontSize: 14, color: '#64748B', textAlign: 'center',
              margin: '0.5rem 0 1.75rem', lineHeight: '1.5'
            }}>
              Elige una contraseña fuerte de al menos 8 caracteres para asegurar tu cuenta.
            </p>

            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '1rem', position: 'relative' }}>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 600,
                  color: '#374151', marginBottom: 6
                }}>
                  Nueva contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%', height: 44, borderRadius: 8,
                      backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB',
                      padding: '0 40px 0 14px', fontSize: 14, color: '#111827',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: 4,
                      display: 'flex', alignItems: 'center'
                    }}
                    tabIndex={-1}
                  >
                    {showPassword
                      ? <EyeOffIcon size={20} color="#64748B" />
                      : <EyeIcon size={20} color="#64748B" />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <label style={{
                  display: 'block', fontSize: 13, fontWeight: 600,
                  color: '#374151', marginBottom: 6
                }}>
                  Confirmar contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%', height: 44, borderRadius: 8,
                      backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB',
                      padding: '0 40px 0 14px', fontSize: 14, color: '#111827',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    style={{
                      position: 'absolute', right: 10, top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: 4,
                      display: 'flex', alignItems: 'center'
                    }}
                    tabIndex={-1}
                  >
                    {showConfirm
                      ? <EyeOffIcon size={20} color="#64748B" />
                      : <EyeIcon size={20} color="#64748B" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={primaryBtnStyle(loading)}
                onMouseEnter={primaryBtnHover}
                onMouseLeave={primaryBtnLeave}
              >
                {loading ? renderSpinner() : 'Actualizar contraseña'}
              </button>
            </form>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', backgroundColor: '#F8FAFC',
      padding: '1rem'
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ width: '100%', maxWidth: 440, marginBottom: '0.75rem' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} />
          Volver al inicio de sesión
        </Link>
      </div>

      <div style={{
        width: '100%', maxWidth: 440,
        backgroundColor: '#fff', borderRadius: 16,
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        padding: '2.5rem',
        boxSizing: 'border-box',
        transition: 'opacity 0.15s',
        opacity: fading ? 0 : 1
      }}>
        {success && (
          <div style={{
            backgroundColor: '#D1FAE5', color: '#065F46',
            padding: '0.75rem 1rem', borderRadius: 8, textAlign: 'center',
            fontSize: 14, fontWeight: 600
          }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2', color: '#B91C1C',
            padding: '0.75rem 1rem', borderRadius: 8,
            marginBottom: '1.25rem', textAlign: 'center', fontSize: 13
          }}>
            {error}
          </div>
        )}

        {!success && stepContent()}
      </div>
    </div>
  );
};

export default ForgotPassword;
