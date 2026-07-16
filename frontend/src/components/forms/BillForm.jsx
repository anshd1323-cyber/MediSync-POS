// ============================================================
// BillForm — line-item billing with auto-calculations
// ============================================================
import { useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BILL_ITEM_TYPES, PAYMENT_MODES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const EMPTY_ITEM = { description: '', type: 'CONSULTATION', qty: 1, unitPrice: '' };

export default function BillForm({ onSubmit, loading, id = 'bill-form' }) {
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [discount, setDiscount] = useState('');
  const [taxPercent, setTaxPercent] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [errors, setErrors] = useState({});

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0),
    [items],
  );

  const discountAmt = Number(discount) || 0;
  const taxAmt = ((subtotal - discountAmt) * (Number(taxPercent) || 0)) / 100;
  const total = subtotal - discountAmt + taxAmt;

  const validate = () => {
    const errs = {};
    items.forEach((it, i) => {
      if (!it.description.trim()) errs[`item-${i}-desc`] = 'Description required';
      if (!it.unitPrice || Number(it.unitPrice) <= 0) errs[`item-${i}-price`] = 'Enter valid price';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.({
      items: items.map((it) => ({
        ...it,
        qty: Number(it.qty),
        unitPrice: Number(it.unitPrice),
        amount: Number(it.qty) * Number(it.unitPrice),
      })),
      subtotal,
      discount: discountAmt,
      tax: taxAmt,
      total,
      paymentMode,
    });
  };

  return (
    <form onSubmit={handleSubmit} id={id}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>Line Items</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={addItem} id={`${id}-add-item`}>
            <Plus size={14} /> Add Item
          </button>
        </div>

        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 140px 70px 100px 100px 40px',
            gap: 8,
            marginBottom: 8,
            padding: '0 4px',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>Description</span>
          <span>Type</span>
          <span>Qty</span>
          <span>Unit Price</span>
          <span>Amount</span>
          <span />
        </div>

        {items.map((item, i) => {
          const amount = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 140px 70px 100px 100px 40px',
                gap: 8,
                marginBottom: 8,
                alignItems: 'start',
              }}
            >
              <div>
                <input
                  className={`form-input ${errors[`item-${i}-desc`] ? 'error' : ''}`}
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                  placeholder="Item description"
                  id={`${id}-item-${i}-desc`}
                />
              </div>
              <select
                className="form-select"
                value={item.type}
                onChange={(e) => updateItem(i, 'type', e.target.value)}
                id={`${id}-item-${i}-type`}
              >
                {BILL_ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                className="form-input"
                type="number"
                min="1"
                value={item.qty}
                onChange={(e) => updateItem(i, 'qty', e.target.value)}
                id={`${id}-item-${i}-qty`}
              />
              <div>
                <input
                  className={`form-input ${errors[`item-${i}-price`] ? 'error' : ''}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, 'unitPrice', e.target.value)}
                  placeholder="₹"
                  id={`${id}-item-${i}-price`}
                />
              </div>
              <div style={{ padding: '8px 0', fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
                {formatCurrency(amount)}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => removeItem(i)}
                disabled={items.length <= 1}
                style={{ color: 'var(--color-danger)' }}
                id={`${id}-remove-item-${i}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div
        style={{
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div className="form-row form-row-3" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Discount (₹)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
              id={`${id}-discount`}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tax (%)</label>
            <input
              className="form-input"
              type="number"
              min="0"
              max="100"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              placeholder="0"
              id={`${id}-tax`}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Mode</label>
            <select
              className="form-select"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              id={`${id}-payment-mode`}
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--font-size-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmt > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
              <span>Discount</span>
              <span>- {formatCurrency(discountAmt)}</span>
            </div>
          )}
          {taxAmt > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Tax ({taxPercent}%)</span>
              <span>{formatCurrency(taxAmt)}</span>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: 'var(--font-size-lg)',
              borderTop: '2px solid var(--color-border)',
              paddingTop: 8,
              marginTop: 4,
            }}
          >
            <span>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading} id={`${id}-submit`}>
          {loading ? 'Saving…' : 'Save & Print Receipt'}
        </button>
      </div>
    </form>
  );
}
