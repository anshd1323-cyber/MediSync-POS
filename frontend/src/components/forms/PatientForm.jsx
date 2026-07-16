// ============================================================
// PatientForm — registration / edit form
// ============================================================
import { useState } from 'react';
import { GENDERS, BLOOD_GROUPS } from '../../utils/constants';

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  dob: '',
  gender: '',
  address: '',
  bloodGroup: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
};

export default function PatientForm({ initialData, onSubmit, loading, id = 'patient-form' }) {
  const [form, setForm] = useState({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, '')))
      errs.phone = 'Enter a valid 10-digit phone number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = 'Enter a valid email address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.(form);
  };

  return (
    <form onSubmit={handleSubmit} id={id}>
      <div className="form-row form-row-2">
        <div className="form-group">
          <label className="form-label">
            Full Name <span className="required">*</span>
          </label>
          <input
            className={`form-input ${errors.name ? 'error' : ''}`}
            value={form.name}
            onChange={set('name')}
            placeholder="Enter patient name"
            id={`${id}-name`}
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">
            Phone <span className="required">*</span>
          </label>
          <input
            className={`form-input ${errors.phone ? 'error' : ''}`}
            value={form.phone}
            onChange={set('phone')}
            placeholder="10-digit phone number"
            id={`${id}-phone`}
          />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>
      </div>

      <div className="form-row form-row-2">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className={`form-input ${errors.email ? 'error' : ''}`}
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="patient@email.com"
            id={`${id}-email`}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Date of Birth</label>
          <input
            className="form-input"
            type="date"
            value={form.dob}
            onChange={set('dob')}
            id={`${id}-dob`}
          />
        </div>
      </div>

      <div className="form-row form-row-2">
        <div className="form-group">
          <label className="form-label">Gender</label>
          <select className="form-select" value={form.gender} onChange={set('gender')} id={`${id}-gender`}>
            <option value="">Select gender</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Blood Group</label>
          <select className="form-select" value={form.bloodGroup} onChange={set('bloodGroup')} id={`${id}-blood-group`}>
            <option value="">Select blood group</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea
          className="form-textarea"
          value={form.address}
          onChange={set('address')}
          placeholder="Full address"
          rows={2}
          id={`${id}-address`}
        />
      </div>

      <div className="form-row form-row-2">
        <div className="form-group">
          <label className="form-label">Emergency Contact Name</label>
          <input
            className="form-input"
            value={form.emergencyContactName}
            onChange={set('emergencyContactName')}
            placeholder="Contact person name"
            id={`${id}-emergency-name`}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Emergency Contact Phone</label>
          <input
            className="form-input"
            value={form.emergencyContactPhone}
            onChange={set('emergencyContactPhone')}
            placeholder="Contact phone"
            id={`${id}-emergency-phone`}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading} id={`${id}-submit`}>
          {loading ? 'Saving…' : initialData ? 'Update Patient' : 'Register Patient'}
        </button>
      </div>
    </form>
  );
}
