import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../api';
import { ShieldAlert, User, Mail, Lock, Briefcase, Award, Building, MapPin, CreditCard, FileText, CheckCircle } from 'lucide-react';

export function B2BOnboarding({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const plan = queryParams.get('plan') || 'professional';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Admin Account
  const [adminForm, setAdminForm] = useState({
    name: '', email: '', password: '', specialization: 'General Practice', yearsOfExperience: '5'
  });

  // Step 2: Clinic Workspace
  const [clinicForm, setClinicForm] = useState({
    clinicName: '', clinicAddress: '', clinicLatitude: 0, clinicLongitude: 0
  });

  // Step 3: Payment
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '', expiry: '', cvc: ''
  });

  // Address Autocomplete State
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const addressTimeoutRef = useRef(null);

  const handleAdminChange = (e) => setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  
  const handleClinicChange = (e) => {
    setClinicForm({ ...clinicForm, [e.target.name]: e.target.value });
    
    if (e.target.name === 'clinicAddress') {
      const query = e.target.value;
      if (query.length > 3) {
        setShowSuggestions(true);
        if (addressTimeoutRef.current) clearTimeout(addressTimeoutRef.current);
        addressTimeoutRef.current = setTimeout(async () => {
          setFetchingAddress(true);
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`, {
                headers: {
                    'Accept-Language': 'en-US,en;q=0.9',
                    'User-Agent': 'MediSync/1.0'
                }
            });
            const data = await res.json();
            setAddressSuggestions(data);
          } catch (err) {
            console.error(err);
          } finally {
            setFetchingAddress(false);
          }
        }, 500); // 500ms debounce
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const selectAddress = (addr) => {
    setClinicForm({ 
      ...clinicForm, 
      clinicAddress: addr.display_name,
      clinicLatitude: parseFloat(addr.lat),
      clinicLongitude: parseFloat(addr.lon)
    });
    setShowSuggestions(false);
  };

  const handlePaymentChange = (e) => setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!adminForm.name || !adminForm.email || !adminForm.password) {
        setError('Please fill out all required fields.');
        return;
      }
    }
    if (step === 2) {
      if (!clinicForm.clinicName || !clinicForm.clinicAddress) {
        setError('Please provide your clinic details.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!paymentForm.cardNumber) {
      setError('Please provide payment details.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Create account, clinic, and pay all in one API request (mapped to backend auth register)
      const payload = {
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password,
        role: 'DOCTOR',
        specialization: adminForm.specialization,
        yearsOfExperience: Number(adminForm.yearsOfExperience),
        clinicName: clinicForm.clinicName,
        clinicAddress: clinicForm.clinicAddress,
        clinicLatitude: clinicForm.clinicLatitude || 0,
        clinicLongitude: clinicForm.clinicLongitude || 0,
        plan
      };
      
      const { data } = await authAPI.register(payload);
      localStorage.setItem('token', data.data.token);
      setUser(data.data.user);
      
      // Advance to success invoice step
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration and payment failed.');
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const getPlanPrice = () => {
    if (plan === 'sandbox') return '$0.00';
    if (plan === 'enterprise') return '$79.00';
    return '$29.00';
  };

  return (
    <div className="auth-page" style={{ padding: '40px 16px', background: 'var(--color-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Hide surrounding UI when printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
        }
        .address-suggestion:hover {
          background-color: var(--color-bg-alt);
        }
      `}</style>

      <div 
        className="auth-card" 
        style={{ 
          maxWidth: '600px', 
          width: '100%',
          transition: 'all var(--transition-slow)'
        }}
      >
        <div className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
              +
            </div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>MediSync</span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="auth-title">Clinic Onboarding</h2>
            <p className="auth-subtitle">Step {step} of 4</p>
          </div>

          {/* Progress Bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: s <= step ? 'var(--color-primary)' : 'var(--color-border-light)', transition: 'background 0.3s ease' }} />
            ))}
          </div>

          {error && (
            <div className="auth-error" style={{ marginBottom: '24px' }}>
              <ShieldAlert size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* STEP 1: Admin Account */}
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text)' }}>Create Admin Account</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><User size={16} /></span>
                  <input className="form-input" name="name" type="text" value={adminForm.name} onChange={handleAdminChange} placeholder="Admin Name" style={{ paddingLeft: '38px' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><Mail size={16} /></span>
                  <input className="form-input" name="email" type="email" value={adminForm.email} onChange={handleAdminChange} placeholder="admin@clinic.com" style={{ paddingLeft: '38px' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><Lock size={16} /></span>
                  <input className="form-input" name="password" type="password" value={adminForm.password} onChange={handleAdminChange} placeholder="••••••••" style={{ paddingLeft: '38px' }} />
                </div>
              </div>
            </div>
            <button className="btn btn-primary no-print" style={{ width: '100%', marginTop: '24px', padding: '12px' }} onClick={nextStep}>Continue to Workspace Setup</button>
          </div>
        )}

        {/* STEP 2: Workspace Setup */}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text)' }}>Set up Clinic Workspace</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Clinic Name</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><Building size={16} /></span>
                  <input className="form-input" name="clinicName" type="text" value={clinicForm.clinicName} onChange={handleClinicChange} placeholder="Midtown Medical Center" style={{ paddingLeft: '38px' }} />
                </div>
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Physical Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><MapPin size={16} /></span>
                  <input className="form-input" name="clinicAddress" type="text" value={clinicForm.clinicAddress} onChange={handleClinicChange} placeholder="123 Health Ave, NY 10001" style={{ paddingLeft: '38px' }} autoComplete="off" onFocus={() => { if(clinicForm.clinicAddress.length > 3) setShowSuggestions(true); }} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
                </div>
                {showSuggestions && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: '8px', zIndex: 10, boxShadow: 'var(--shadow-md)', marginTop: '4px', overflow: 'hidden' }}>
                    {fetchingAddress ? (
                      <div style={{ padding: '12px', fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Searching map...</div>
                    ) : addressSuggestions.length > 0 ? (
                      addressSuggestions.map((addr, idx) => (
                        <div key={idx} style={{ padding: '10px 12px', fontSize: '13px', borderBottom: idx < addressSuggestions.length - 1 ? '1px solid var(--color-border-light)' : 'none', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'flex-start' }} onMouseDown={() => selectAddress(addr)} className="address-suggestion">
                          <MapPin size={14} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ color: 'var(--color-text)' }}>{addr.display_name}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '12px', fontSize: '13px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>No map results found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }} className="no-print">
              <button className="btn btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2, padding: '12px' }} onClick={nextStep}>Continue to Checkout</button>
            </div>
          </div>
        )}

        {/* STEP 3: Checkout Gateway */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text)' }}>Subscription Payment</h3>
            <div style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Selected Plan</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text)' }}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)' }}>
                {getPlanPrice()} <span style={{ fontSize: '12px', fontWeight: 600 }}>/mo</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Card Number (Simulated)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}><CreditCard size={16} /></span>
                  <input className="form-input" name="cardNumber" type="text" value={paymentForm.cardNumber} onChange={handlePaymentChange} placeholder="4242 4242 4242 4242" style={{ paddingLeft: '38px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Expiry</label>
                  <input className="form-input" name="expiry" type="text" value={paymentForm.expiry} onChange={handlePaymentChange} placeholder="MM/YY" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">CVC</label>
                  <input className="form-input" name="cvc" type="text" value={paymentForm.cvc} onChange={handlePaymentChange} placeholder="123" />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }} className="no-print">
              <button className="btn btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 2, padding: '12px' }} onClick={handleCheckout} disabled={loading}>
                {loading ? 'Processing...' : `Pay ${getPlanPrice()}`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success / Printable Invoice */}
        {step === 4 && (
          <div id="printable-invoice">
            <div style={{ textAlign: 'center', marginBottom: '32px' }} className="no-print">
              <div style={{ width: '64px', height: '64px', background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>Payment Successful</h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>Your clinic workspace has been created.</p>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>MediSync POS</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>B2B SaaS Subscription Invoice</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Invoice #B2B-{Math.floor(Math.random() * 100000)}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Billed To</div>
                  <div style={{ fontWeight: 600 }}>{clinicForm.clinicName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{clinicForm.clinicAddress}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Attn: {adminForm.name}</div>
                </div>
              </div>

              <div style={{ width: '100%', marginBottom: '24px', border: '1px solid var(--color-border-light)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', background: 'var(--color-bg-alt)', padding: '10px 16px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border-light)' }}>
                  <div style={{ flex: 1 }}>Description</div>
                  <div style={{ width: '100px', textAlign: 'right' }}>Amount</div>
                </div>
                <div style={{ display: 'flex', padding: '16px', borderBottom: '1px solid var(--color-border-light)', fontSize: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <strong>MediSync {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</strong> (1 Month)
                  </div>
                  <div style={{ width: '100px', textAlign: 'right' }}>{getPlanPrice()}</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--color-bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
                    <span>Total Paid</span>
                    <span style={{ color: 'var(--color-primary)' }}>{getPlanPrice()}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Thank you for choosing MediSync. This invoice serves as proof of your subscription payment.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }} className="no-print">
              <button className="btn btn-outline" style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={printInvoice}>
                <FileText size={16} /> Print Invoice
              </button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '12px' }} onClick={() => navigate('/dashboard')}>
                Enter Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
