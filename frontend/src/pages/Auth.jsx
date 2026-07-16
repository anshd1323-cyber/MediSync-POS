import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { Mail, Lock, User, Briefcase, Award, ShieldAlert, Activity } from 'lucide-react';

export function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('token', data.data.token);
      setUser(data.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div 
          className="auth-logo" 
          style={{ cursor: 'pointer', marginBottom: '24px' }} 
          onClick={() => navigate('/')}
        >
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--color-primary)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '22px',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)'
          }}>
            +
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>MediSync</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your clinical workspace</p>
        </div>

        {error && (
          <div className="auth-error">
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <Mail size={16} />
              </span>
              <input
                className="form-input"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ paddingLeft: '38px', height: '42px' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}>
                <Lock size={16} />
              </span>
              <input
                className="form-input"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: '38px', height: '42px' }}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', height: '42px', fontSize: '15px', fontWeight: '600' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <span
              style={{
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
              onClick={() => navigate('/register')}
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Register({ setUser }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('PATIENT');
  const [form, setForm] = useState({ name: '', email: '', password: '', specialization: '', yearsOfExperience: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, role };
      if (role === 'PATIENT') {
        delete payload.specialization;
        delete payload.yearsOfExperience;
      } else {
        payload.yearsOfExperience = Number(payload.yearsOfExperience);
      }
      
      const { data } = await authAPI.register(payload);
      localStorage.setItem('token', data.data.token);
      setUser(data.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isDoctor = role === 'DOCTOR';

  return (
    <div className="auth-page" style={{ padding: '40px 16px' }}>
      <div 
        className={`auth-card ${isDoctor ? 'wide' : ''}`} 
        style={{ 
          transition: 'max-width var(--transition-slow), width var(--transition-slow)',
          margin: '0 auto'
        }}
      >
        <div 
          className="auth-logo" 
          style={{ cursor: 'pointer', marginBottom: '24px' }} 
          onClick={() => navigate('/')}
        >
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--color-primary)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '22px',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)'
          }}>
            +
          </div>
          <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>MediSync</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Join our connected clinical workspace</p>
        </div>

        {error && (
          <div className="auth-error">
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '28px',
          background: 'var(--color-bg-alt)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--color-border)'
        }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: role === 'PATIENT' ? 'var(--color-white)' : 'transparent',
              color: role === 'PATIENT' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: role === 'PATIENT' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
            onClick={() => setRole('PATIENT')}
          >
            <Activity size={16} />
            Patient Portal
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: role === 'DOCTOR' ? 'var(--color-white)' : 'transparent',
              color: role === 'DOCTOR' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: role === 'DOCTOR' ? 'var(--shadow-sm)' : 'none',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
            onClick={() => setRole('DOCTOR')}
          >
            <Briefcase size={16} />
            Provider Portal
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: isDoctor ? 'grid' : 'flex', 
            gridTemplateColumns: isDoctor ? '1fr 1fr' : 'none', 
            flexDirection: 'column',
            gap: isDoctor ? '16px' : '0' 
          }}>
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <User size={16} />
                </span>
                <input
                  className="form-input"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={{ paddingLeft: '38px', height: '42px' }}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <Mail size={16} />
                </span>
                <input
                  className="form-input"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={{ paddingLeft: '38px', height: '42px' }}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div style={{ 
            display: isDoctor ? 'grid' : 'flex', 
            gridTemplateColumns: isDoctor ? '1fr 1fr' : 'none', 
            flexDirection: 'column',
            gap: isDoctor ? '16px' : '0' 
          }}>
            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}>
                  <Lock size={16} />
                </span>
                <input
                  className="form-input"
                  name="password"
                  type="password"
                  required
                  minLength="6"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ paddingLeft: '38px', height: '42px' }}
                  disabled={loading}
                />
              </div>
            </div>

            {isDoctor && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Specialization <span className="required">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}>
                      <Briefcase size={16} />
                    </span>
                    <input
                      className="form-input"
                      name="specialization"
                      type="text"
                      required
                      value={form.specialization}
                      onChange={handleChange}
                      placeholder="Cardiology"
                      style={{ paddingLeft: '38px', height: '42px' }}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Experience <span className="required">*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}>
                      <Award size={16} />
                    </span>
                    <input
                      className="form-input"
                      name="yearsOfExperience"
                      type="number"
                      min="0"
                      required
                      value={form.yearsOfExperience}
                      onChange={handleChange}
                      placeholder="Yrs"
                      style={{ paddingLeft: '38px', height: '42px' }}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              marginTop: '12px', 
              padding: '12px', 
              height: '42px', 
              fontSize: '15px', 
              fontWeight: '600' 
            }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <span 
              style={{ 
                color: 'var(--color-primary)', 
                cursor: 'pointer', 
                fontWeight: 600,
                textDecoration: 'underline'
              }} 
              onClick={() => navigate('/login')}
            >
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
