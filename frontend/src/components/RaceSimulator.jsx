import React, { useState, useEffect } from 'react';
import { Database, Zap, Lock, XCircle, CheckCircle } from 'lucide-react';

export function RaceSimulator() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [statusA, setStatusA] = useState('IDLE'); // IDLE, RUNNING, ACQUIRED
  const [statusB, setStatusB] = useState('IDLE'); // IDLE, RUNNING, BLOCKED
  const [progressA, setProgressA] = useState(0);
  const [progressB, setProgressB] = useState(0);

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setStatusA('RUNNING');
    setStatusB('RUNNING');
    setProgressA(0);
    setProgressB(0);

    // Animate progress
    const startTime = Date.now();
    const duration = 1500; // 1.5 seconds

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      let p = Math.min((elapsed / duration) * 100, 100);
      
      setProgressA(p);
      setProgressB(p * 0.95); // B is slightly slower

      if (p < 100) {
        requestAnimationFrame(animate);
      } else {
        // Resolve race condition
        setStatusA('ACQUIRED');
        setStatusB('BLOCKED');
        setTimeout(() => setIsSimulating(false), 500);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const resetSimulation = () => {
    setStatusA('IDLE');
    setStatusB('IDLE');
    setProgressA(0);
    setProgressB(0);
  };

  return (
    <div style={{
      background: 'var(--color-bg)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      marginTop: '32px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Database size={20} style={{ color: 'var(--color-primary)' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>Database Concurrency Simulator</h3>
      </div>

      {/* Target Database Slot */}
      <div style={{ 
        background: 'var(--color-white)', 
        border: '2px dashed var(--color-border)',
        borderColor: statusA === 'ACQUIRED' ? 'var(--color-success)' : 'var(--color-border)',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        marginBottom: '24px',
        transition: 'border-color 0.3s ease'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          Target Row Lock
        </div>
        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text)' }}>
          [Slot: 10:15 AM - Dr. Evans]
        </div>
      </div>

      {/* Process Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        
        {/* Request A */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
            <span style={{ color: 'var(--color-text)' }}>Request A (User Booking From App)</span>
            <span style={{ 
              color: statusA === 'ACQUIRED' ? 'var(--color-success)' : 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              {statusA === 'ACQUIRED' && <CheckCircle size={14} />}
              {statusA === 'ACQUIRED' ? '[ACQUIRED LOCK] -> Status: 200 OK (Booking Confirmed)' : statusA === 'RUNNING' ? 'Running...' : 'Idle'}
            </span>
          </div>
          <div style={{ height: '8px', background: 'var(--color-border-light)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${progressA}%`, 
              background: statusA === 'ACQUIRED' ? 'var(--color-success)' : 'var(--color-primary)',
              transition: 'background 0.3s ease'
            }} />
          </div>
        </div>

        {/* Request B */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
            <span style={{ color: 'var(--color-text)' }}>Request B (User Booking From Web)</span>
            <span style={{ 
              color: statusB === 'BLOCKED' ? 'var(--color-danger)' : 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              {statusB === 'BLOCKED' && <XCircle size={14} />}
              {statusB === 'BLOCKED' ? '[BLOCKING: QUEUED] -> Status: 409 Conflict (Transaction Safely Rolled Back)' : statusB === 'RUNNING' ? 'Running...' : 'Idle'}
            </span>
          </div>
          <div style={{ height: '8px', background: 'var(--color-border-light)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${progressB}%`, 
              background: statusB === 'BLOCKED' ? 'var(--color-danger)' : 'var(--color-primary)',
              transition: 'background 0.3s ease'
            }} />
          </div>
        </div>

      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button 
          onClick={startSimulation}
          disabled={isSimulating || statusA === 'ACQUIRED'}
          className="btn btn-primary"
          style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px', borderRadius: '8px' }}
        >
          <Zap size={16} />
          Simulate Simultaneous Collision
        </button>
        {(statusA === 'ACQUIRED' || statusB === 'BLOCKED') && (
          <button 
            onClick={resetSimulation}
            className="btn btn-outline"
            style={{ padding: '12px 24px', borderRadius: '8px', background: 'var(--color-white)' }}
          >
            Reset
          </button>
        )}
      </div>

      {(statusA === 'ACQUIRED') && (
        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--color-primary-light)', borderRadius: '8px', fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', gap: '8px' }}>
          <Lock size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            <strong>Transaction Safely Serialized:</strong> Sequelize <code>LOCK UPDATE</code> physically prevented double-booking by ensuring Request B queued until Request A's transaction completed.
          </p>
        </div>
      )}
    </div>
  );
}
