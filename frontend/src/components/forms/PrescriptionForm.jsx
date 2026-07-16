// ============================================================
// PrescriptionForm — dynamic medicine list + notes
// ============================================================
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FREQUENCIES, DURATION_UNITS } from '../../utils/constants';

const EMPTY_MED = { name: '', dosage: '', frequency: 'BD', duration: '', durationUnit: 'days', instructions: '' };

export default function PrescriptionForm({ initialData, onSubmit, loading, id = 'rx-form' }) {
  const [medicines, setMedicines] = useState(
    initialData?.medicines?.length ? initialData.medicines : [{ ...EMPTY_MED }],
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [errors, setErrors] = useState({});

  const updateMed = (index, field, value) => {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMedicine = () => setMedicines((prev) => [...prev, { ...EMPTY_MED }]);

  const removeMedicine = (index) => {
    if (medicines.length <= 1) return;
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    medicines.forEach((m, i) => {
      if (!m.name.trim()) errs[`med-${i}-name`] = 'Medicine name required';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.({ medicines, notes });
  };

  return (
    <form onSubmit={handleSubmit} id={id}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Medicines</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={addMedicine} id={`${id}-add-med`}>
            <Plus size={14} /> Add Medicine
          </button>
        </div>

        {medicines.map((med, i) => (
          <div
            key={i}
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                Medicine #{i + 1}
              </span>
              {medicines.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeMedicine(i)}
                  style={{ color: 'var(--color-danger)' }}
                  id={`${id}-remove-med-${i}`}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Name <span className="required">*</span></label>
                <input
                  className={`form-input ${errors[`med-${i}-name`] ? 'error' : ''}`}
                  value={med.name}
                  onChange={(e) => updateMed(i, 'name', e.target.value)}
                  placeholder="Medicine name"
                  id={`${id}-med-${i}-name`}
                />
                {errors[`med-${i}-name`] && <div className="form-error">{errors[`med-${i}-name`]}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Dosage</label>
                <input
                  className="form-input"
                  value={med.dosage}
                  onChange={(e) => updateMed(i, 'dosage', e.target.value)}
                  placeholder="e.g. 500mg"
                  id={`${id}-med-${i}-dosage`}
                />
              </div>
            </div>
            <div className="form-row form-row-3">
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select
                  className="form-select"
                  value={med.frequency}
                  onChange={(e) => updateMed(i, 'frequency', e.target.value)}
                  id={`${id}-med-${i}-freq`}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-input"
                    type="number"
                    value={med.duration}
                    onChange={(e) => updateMed(i, 'duration', e.target.value)}
                    placeholder="5"
                    style={{ flex: 1 }}
                    id={`${id}-med-${i}-dur`}
                  />
                  <select
                    className="form-select"
                    value={med.durationUnit}
                    onChange={(e) => updateMed(i, 'durationUnit', e.target.value)}
                    style={{ width: 100 }}
                    id={`${id}-med-${i}-dur-unit`}
                  >
                    {DURATION_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <input
                  className="form-input"
                  value={med.instructions}
                  onChange={(e) => updateMed(i, 'instructions', e.target.value)}
                  placeholder="After food"
                  id={`${id}-med-${i}-instr`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-group">
        <label className="form-label">General Notes / Advice</label>
        <textarea
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Dietary advice, follow-up instructions, etc."
          rows={3}
          id={`${id}-notes`}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading} id={`${id}-submit`}>
          {loading ? 'Saving…' : 'Save Prescription'}
        </button>
      </div>
    </form>
  );
}
