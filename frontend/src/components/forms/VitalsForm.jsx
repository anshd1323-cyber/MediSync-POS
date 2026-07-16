// ============================================================
// VitalsForm — quick vitals entry in compact grid
// ============================================================
import { useState } from 'react';
import { Activity } from 'lucide-react';

const EMPTY = {
  bpSystolic: '',
  bpDiastolic: '',
  pulse: '',
  temperature: '',
  weight: '',
  height: '',
  spo2: '',
};

export default function VitalsForm({ initialData, onSubmit, loading, id = 'vitals-form' }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialData });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      bloodPressure: form.bpSystolic && form.bpDiastolic ? `${form.bpSystolic}/${form.bpDiastolic}` : '',
      pulse: form.pulse ? Number(form.pulse) : null,
      temperature: form.temperature ? Number(form.temperature) : null,
      weight: form.weight ? Number(form.weight) : null,
      height: form.height ? Number(form.height) : null,
      spo2: form.spo2 ? Number(form.spo2) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} id={id}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Activity size={18} style={{ color: 'var(--color-primary)' }} />
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Patient Vitals</span>
      </div>

      <div className="form-row form-row-3">
        <div className="form-group">
          <label className="form-label">BP Systolic (mmHg)</label>
          <input
            className="form-input"
            type="number"
            value={form.bpSystolic}
            onChange={set('bpSystolic')}
            placeholder="120"
            id={`${id}-bp-sys`}
          />
        </div>
        <div className="form-group">
          <label className="form-label">BP Diastolic (mmHg)</label>
          <input
            className="form-input"
            type="number"
            value={form.bpDiastolic}
            onChange={set('bpDiastolic')}
            placeholder="80"
            id={`${id}-bp-dia`}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Pulse (bpm)</label>
          <input
            className="form-input"
            type="number"
            value={form.pulse}
            onChange={set('pulse')}
            placeholder="72"
            id={`${id}-pulse`}
          />
        </div>
      </div>

      <div className="form-row form-row-4">
        <div className="form-group">
          <label className="form-label">Temp (°F)</label>
          <input
            className="form-input"
            type="number"
            step="0.1"
            value={form.temperature}
            onChange={set('temperature')}
            placeholder="98.6"
            id={`${id}-temp`}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Weight (kg)</label>
          <input
            className="form-input"
            type="number"
            step="0.1"
            value={form.weight}
            onChange={set('weight')}
            placeholder="70"
            id={`${id}-weight`}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Height (cm)</label>
          <input
            className="form-input"
            type="number"
            value={form.height}
            onChange={set('height')}
            placeholder="170"
            id={`${id}-height`}
          />
        </div>
        <div className="form-group">
          <label className="form-label">SpO₂ (%)</label>
          <input
            className="form-input"
            type="number"
            value={form.spo2}
            onChange={set('spo2')}
            placeholder="98"
            id={`${id}-spo2`}
          />
        </div>
      </div>

      <div className="form-actions" style={{ borderTop: 'none', paddingTop: 8 }}>
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading} id={`${id}-submit`}>
          {loading ? 'Saving…' : 'Save Vitals'}
        </button>
      </div>
    </form>
  );
}
