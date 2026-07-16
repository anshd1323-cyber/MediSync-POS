import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  Search, 
  User, 
  Clock, 
  Activity, 
  Check, 
  AlertTriangle,
  Building,
  Star,
  ArrowRight,
  Shield,
  CreditCard,
  X
} from 'lucide-react';
import { consultationAPI } from '../api';

export function Discovery({ user }) {
  const [lat, setLat] = useState('12.9716'); // Default coordinates
  const [lng, setLng] = useState('77.5946');
  const [radius, setRadius] = useState('15');
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Slot booking states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Fetch clinics based on location coordinates
  const fetchClinics = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/discovery/search?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (data && Array.isArray(data.data)) {
        setClinics(data.data);
      } else {
        setClinics([]);
      }
    } catch (err) {
      console.error(err);
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [radius]); // Auto re-fetch when radius slider changes

  // Browser Geolocation Detector
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
          fetchClinics();
        },
        (err) => {
          alert('Could not detect location. Using default center coordinates.');
        }
      );
    }
  };

  // Fetch slots for selected doctor
  const handleSelectDoctor = (doc) => {
    setSelectedDoctor(doc);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setBookingDate(dateStr);
    loadSlots(doc.id, dateStr);
  };

  const loadSlots = async (docId, dateStr) => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`http://localhost:5000/availability/${docId}/slots?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSlots(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (e) => {
    setBookingDate(e.target.value);
    if (selectedDoctor) {
      loadSlots(selectedDoctor.id, e.target.value);
    }
  };

  const confirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setBookingError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/appointments/book', {
        doctorId: selectedDoctor.id,
        scheduledAt: selectedSlot.datetime,
        paymentStatus: 'PAID',
        fee: 15.00
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookingSuccess(true);
      setTimeout(() => {
        handleCloseBooking();
        fetchClinics();
      }, 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Double-booking race condition blocked!');
    }
  };

  const handleCloseBooking = () => {
    setSelectedDoctor(null);
    setBookingDate('');
    setSlots([]);
    setSelectedSlot(null);
    setCheckoutStep(false);
    setBookingSuccess(false);
    setBookingError('');
  };

  // Filter clinics by search query
  const filteredClinics = Array.isArray(clinics)
    ? clinics.filter(c => 
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Search Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #0f766e 100%)', borderRadius: '24px', padding: '40px', color: 'white', marginBottom: '32px', boxShadow: 'var(--shadow-lg)' }}>
        <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.5px' }}>Find Nearby Clinics</h1>
        <p style={{ opacity: 0.9, fontSize: '14px', marginBottom: '24px' }}>Locate verified clinics, discover active practitioners, and schedule instant consult rooms.</p>
        
        {/* Geolocation Filter bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(8px)' }}>
          <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', borderRadius: '10px', padding: '0 12px' }}>
            <MapPin size={18} style={{ color: 'var(--color-primary)' }} />
            <input 
              type="text" 
              placeholder="Latitude" 
              value={lat} 
              onChange={e => setLat(e.target.value)} 
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--color-text)', height: '40px' }}
            />
          </div>
          
          <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', background: 'white', borderRadius: '10px', padding: '0 12px' }}>
            <MapPin size={18} style={{ color: 'var(--color-primary)' }} />
            <input 
              type="text" 
              placeholder="Longitude" 
              value={lng} 
              onChange={e => setLng(e.target.value)} 
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--color-text)', height: '40px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', borderRadius: '10px', padding: '0 16px', color: 'var(--color-text)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Radius: {radius}km</span>
            <input 
              type="range" 
              min="5" 
              max="50" 
              value={radius} 
              onChange={e => setRadius(e.target.value)}
              style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
          </div>

          <button 
            onClick={detectLocation}
            style={{ padding: '0 20px', background: 'var(--color-white)', color: 'var(--color-primary)', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            Detect GPS
          </button>
          
          <button 
            onClick={fetchClinics}
            style={{ padding: '0 24px', background: '#111827', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Main Discover Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Text filter input */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0 16px' }}>
            <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search clinics by name or address..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', height: '46px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading nearby clinics...</div>
        ) : filteredClinics.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: 'var(--color-white)', border: '1px dashed var(--color-border)', borderRadius: '16px' }}>
            <Building size={36} style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }} />
            <h4>No Nearby Clinics Found</h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Try increasing the search radius slider or coordinate grids.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {filteredClinics.map(clinic => (
              <div key={clinic.id} className="card" style={{ padding: '24px', background: 'var(--color-white)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-primary-50)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{clinic.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>{clinic.address}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-success)', fontWeight: 600, background: 'rgba(13, 148, 136, 0.08)', padding: '4px 10px', borderRadius: '100px', width: 'fit-content' }}>
                  <Star size={12} fill="var(--color-success)" />
                  <span>Open for Bookings</span>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '16px', marginTop: 'auto' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Available Doctors:</span>
                  
                  {Array.isArray(clinic.doctors) && clinic.doctors.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>No doctors currently available.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {clinic.doctors?.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                              {doc.name?.charAt(0)}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>{doc.name}</span>
                          </div>
                          
                          <button 
                            className="btn btn-primary btn-sm" 
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                            onClick={() => handleSelectDoctor(doc)}
                          >
                            Book Slot
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Booking / Checkout Wizard Modal --- */}
      {selectedDoctor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', backgroundColor: 'var(--color-white)', boxShadow: 'var(--shadow-xl)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--color-border)', animation: 'scaleIn 0.3s ease-out' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-bg-alt)' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Checkout Booking</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>with {selectedDoctor.name}</p>
              </div>
              <button onClick={handleCloseBooking} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {bookingSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Check size={28} />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Appointment Scheduled & Paid!</h4>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Redirecting to dashboard...</p>
                </div>
              ) : checkoutStep ? (
                // Step 2: Checkout payment page
                <div>
                  {bookingError && (
                    <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-light)', borderRadius: '8px', marginBottom: '20px', color: 'var(--color-danger)', fontSize: '13px' }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border-light)', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Invoice Summary</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Provider:</span>
                        <strong>{selectedDoctor.name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Schedule:</span>
                        <strong>{bookingDate} at {selectedSlot?.time}</strong>
                      </div>
                      <div style={{ height: '1px', borderBottom: '1px dashed var(--color-border)', margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold' }}>
                        <span>Total Due:</span>
                        <strong style={{ color: 'var(--color-primary)' }}>$15.00</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px', background: 'var(--color-white)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>💳 Checkout Card Terminal</span>
                    <input type="text" className="form-input" placeholder="Card Number" defaultValue="4242 4242 4242 4242" style={{ marginBottom: '10px', height: '38px', fontSize: '13px' }} required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input type="text" className="form-input" placeholder="MM/YY" defaultValue="12/28" style={{ height: '38px', fontSize: '13px', textAlign: 'center' }} required />
                      <input type="password" className="form-input" placeholder="CVC" defaultValue="123" style={{ height: '38px', fontSize: '13px', textAlign: 'center' }} required />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setCheckoutStep(false)}>Back</button>
                    <button type="button" className="btn btn-primary" style={{ flex: 2, padding: '12px' }} onClick={confirmBooking}>Pay & Book</button>
                  </div>
                </div>
              ) : (
                // Step 1: Slots Calendar Date/Time Selector
                <>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Select Consultation Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={bookingDate} 
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ height: '42px' }}
                    />
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '12px', display: 'block' }}>Available Slots</label>
                    {loadingSlots ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>Loading slots...</div>
                    ) : slots.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 16px', border: '1px dashed var(--color-border)', borderRadius: '12px', background: 'var(--color-bg)' }}>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>No slots open on this date.</p>
                      </div>
                    ) : (
                      <div className="slots-grid">
                        {slots.map(s => (
                          <button
                            key={s.time}
                            type="button"
                            onClick={() => setSelectedSlot(s)}
                            className={`slot-btn ${selectedSlot?.time === s.time ? 'selected' : 'available'}`}
                          >
                            {s.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '32px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={handleCloseBooking}>Cancel</button>
                    <button type="button" className="btn btn-primary" style={{ flex: 2, padding: '12px' }} disabled={!selectedSlot} onClick={() => setCheckoutStep(true)}>Proceed to Pay</button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
