import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { POSCheckout } from './POSCheckout';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CreditCard, 
  Coins, 
  UserCheck, 
  DollarSign, 
  Activity, 
  ShieldAlert,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

const POS_SERVICES = [
  { id: 'srv_1', name: 'General Practitioner Consultation', price: 15.00, category: 'Consult' },
  { id: 'srv_2', name: 'Specialist Consultation', price: 50.00, category: 'Consult' },
  { id: 'srv_3', name: 'Complete Blood Count (CBC) Panel', price: 35.00, category: 'Labs' },
  { id: 'srv_4', name: 'Rapid COVID/Flu Swab Test', price: 25.00, category: 'Labs' },
  { id: 'srv_5', name: '12-Lead Electrocardiogram (ECG)', price: 45.00, category: 'Diagnostics' },
  { id: 'srv_6', name: 'X-Ray Imaging & Report', price: 75.00, category: 'Diagnostics' },
  { id: 'srv_7', name: 'Therapeutic Joint Injection', price: 60.00, category: 'Procedures' },
  { id: 'srv_8', name: 'Physical Therapy Session', price: 55.00, category: 'Procedures' },
];

export function POSTerminal({ user }) {
  const [cart, setCart] = useState([]);
  const [patientName, setPatientName] = useState('Walk-in Patient');
  const [patientPhone, setPatientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [discount, setDiscount] = useState(0);
  const [taxRate] = useState(0.05); // 5% flat healthcare tax
  const [loading, setLoading] = useState(false);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Load recent invoices
  const fetchRecentInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5000/invoices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecentInvoices(data.data);
    } catch (err) {
      console.error('Failed to load recent invoices:', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'DOCTOR') {
      fetchRecentInvoices();
    }
  }, [user]);

  // Cart operations
  const addToCart = (service) => {
    const existing = cart.find(item => item.id === service.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...service, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const finalTotal = parseFloat((subtotal + tax - parseFloat(discount || 0)).toFixed(2));

  // Open checkout modal
  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Please add at least one medical service to the invoice.');
      return;
    }
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = (invoice) => {
    printReceipt(invoice);
    setCart([]);
    setPatientName('Walk-in Patient');
    setDiscount(0);
    fetchRecentInvoices();
  };

  const printReceipt = (inv) => {
    const printWindow = window.open('', '_blank');
    const itemsList = JSON.parse(inv.items || '[]');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>MediSync POS Invoice #${inv.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 320px; font-size: 13px; line-height: 1.4; color: #111; }
            .text-center { text-align: center; }
            .divider { border-bottom: 1px dashed #333; margin: 12px 0; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .title { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
            .total { font-weight: bold; font-size: 15px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="text-center">
            <div class="title">MEDISYNC CLINIC POS</div>
            <div>Official Checkout Terminal</div>
            <div>Doctor Session ID: #${inv.doctorId}</div>
          </div>
          <div class="divider"></div>
          <div>Date: ${new Date(inv.createdAt).toLocaleString()}</div>
          <div>Invoice ID: #${inv.id}</div>
          <div>Patient: ${inv.patientName}</div>
          <div class="divider"></div>
          
          <div style="font-weight: bold; margin-bottom: 8px;">SERVICES RENDERED</div>
          ${itemsList.map(item => `
            <div class="item-row">
              <div>${item.name} x${item.quantity}</div>
              <div>$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          `).join('')}
          
          <div class="divider"></div>
          <div class="item-row">
            <div>Subtotal:</div>
            <div>$${(inv.totalAmount - inv.tax + inv.discount).toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Discount:</div>
            <div>-$${parseFloat(inv.discount).toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Tax (5%):</div>
            <div>$${parseFloat(inv.tax).toFixed(2)}</div>
          </div>
          <div class="divider"></div>
          <div class="item-row total">
            <div>TOTAL DUE:</div>
            <div>$${parseFloat(inv.totalAmount).toFixed(2)}</div>
          </div>
          <div class="divider"></div>
          <div class="text-center" style="font-size: 11px;">
            <div>Payment: ${inv.paymentMethod} (${inv.paymentStatus})</div>
            <div style="margin-top: 8px; font-weight: bold;">THANK YOU FOR YOUR TRUST</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const categories = ['All', 'Consult', 'Labs', 'Diagnostics', 'Procedures'];
  const filteredServices = activeCategory === 'All' 
    ? POS_SERVICES 
    : POS_SERVICES.filter(s => s.category === activeCategory);

  if (!user || user.role !== 'DOCTOR') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <ShieldAlert size={48} style={{ color: 'var(--color-danger)', marginBottom: '16px' }} />
        <h3>Access Restricted</h3>
        <p>The POS Billing Terminal is exclusively accessible to authorized Doctor or Clinic Administrator roles.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
        <div>
          <h1 style={{ marginBottom: '6px', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>Clinical POS Terminal</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Issue quick walk-in billing tickets, collect payments, and print medical receipts.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Column: Quick Services Catalog Grid */}
        <div>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '100px',
                  border: '1px solid var(--color-border)',
                  background: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-white)',
                  color: activeCategory === cat ? 'white' : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {filteredServices.map(srv => (
              <button
                key={srv.id}
                type="button"
                onClick={() => addToCart(srv)}
                className="card hover-target"
                style={{
                  padding: '16px',
                  textAlign: 'left',
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{srv.category}</span>
                <strong style={{ fontSize: '13px', color: 'var(--color-text)', display: 'block', minHeight: '36px', lineHeight: '1.4' }}>{srv.name}</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto', borderTop: '1px dashed var(--color-border-light)', paddingTop: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text)' }}>${srv.price.toFixed(2)}</span>
                  <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>+</span>
                </div>
              </button>
            ))}
          </div>

          {/* Recent Invoices History Section */}
          <div className="card" style={{ marginTop: '28px', padding: '20px', background: 'var(--color-white)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
              <Clock size={16} />
              <span>Today's Receipts Register</span>
            </h3>
            
            {recentInvoices.length === 0 ? (
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', padding: '16px 0' }}>No transactions recorded during this session.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {recentInvoices.map(inv => (
                  <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: '8px', fontSize: '12px' }}>
                    <div>
                      <strong style={{ color: 'var(--color-text)' }}>{inv.patientName}</strong>
                      <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Method: {inv.paymentMethod}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <strong style={{ fontSize: '13px' }}>${parseFloat(inv.totalAmount).toFixed(2)}</strong>
                      <button 
                        onClick={() => printReceipt(inv)} 
                        style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '4px' }}
                        title="Print Receipt"
                      >
                        <Printer size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Cart Calculator */}
        <div className="card" style={{ padding: '24px', background: 'var(--color-white)', position: 'sticky', top: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Coins size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Active Checkout Cart</span>
          </h2>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Patient Name (Walk-in or Registered)</label>
            <input 
              type="text" 
              className="form-input" 
              value={patientName} 
              onChange={e => setPatientName(e.target.value)} 
              placeholder="E.g. John Doe"
            />
          </div>

          {/* Cart items list */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '12px', background: 'var(--color-bg)', minHeight: '160px', maxHeight: '240px', overflowY: 'auto', marginBottom: '20px' }}>
            {cart.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '130px', color: 'var(--color-text-muted)' }}>
                <span style={{ fontSize: '24px', marginBottom: '8px' }}>🛒</span>
                <p style={{ margin: 0, fontSize: '12px' }}>Checkout cart is empty.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-white)', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}>
                    <div style={{ maxWidth: '60%' }}>
                      <strong style={{ fontSize: '12px', color: 'var(--color-text)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>${item.price.toFixed(2)} each</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg)', borderRadius: '6px', padding: '2px 4px' }}>
                        <button type="button" onClick={() => updateQuantity(item.id, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Minus size={12} /></button>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '14px', textAlign: 'center' }}>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Plus size={12} /></button>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing breakdown */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal:</span>
              <strong style={{ color: 'var(--color-text)' }}>${subtotal.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Discount ($):</span>
              <input 
                type="number" 
                className="form-input" 
                style={{ width: '80px', height: '28px', padding: '4px 8px', fontSize: '12px', textAlign: 'right' }} 
                value={discount} 
                onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Healthcare Tax (5%):</span>
              <strong style={{ color: 'var(--color-text)' }}>${tax.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-border)', paddingTop: '12px', marginTop: '4px', fontSize: '16px' }}>
              <strong style={{ color: 'var(--color-text)' }}>Final Total:</strong>
              <strong style={{ color: 'var(--color-primary)', fontSize: '18px' }}>${finalTotal.toFixed(2)}</strong>
            </div>
          </div>

          {/* Checkout controls */}
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              <Printer size={16} />
              <span>Checkout & Print Receipt</span>
            </button>
          </div>

        </div>

      </div>

      <POSCheckout 
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        discount={parseFloat(discount || 0)}
        tax={tax}
        totalAmount={finalTotal}
        patientName={patientName}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
