import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { authAPI } from './api';
import { Login, Register } from './pages/Auth';
import { B2BOnboarding } from './pages/B2BOnboarding';
import { Dashboard } from './pages/Dashboard';
import { ConsultationsList } from './pages/ConsultationsList';
import { ConsultationRoom } from './pages/ConsultationRoom';
import { SettingsPage } from './pages/Settings';
import { POSTerminal } from './pages/POSTerminal';
import { Discovery } from './pages/Discovery';
import { Landing } from './pages/Landing';
import { 
  Activity, 
  Shield, 
  MessageSquare, 
  Calendar, 
  ArrowRight, 
  LayoutDashboard,
  CreditCard,
  MapPin, 
  Settings as SettingsIcon, 
  LogOut, 
  Lock, 
  Check, 
  Video, 
  Heart, 
  FileText, 
  Database,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  HelpCircle
} from 'lucide-react';

function Layout({ children, user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/' || location.pathname === '/onboarding';

  useEffect(() => {
    if (!user && !isAuthPage) {
      navigate('/');
    }
  }, [user, isAuthPage, navigate]);

  if (isAuthPage) return children;
  
  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div className="sidebar-logo">
            +
          </div>
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">MediSync</span>
            <span className="sidebar-brand-sub">Clinical Workspace</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Clinical</div>
          <div className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
            <LayoutDashboard className="sidebar-link-icon" size={18} />
            <span>Dashboard</span>
          </div>
          {user?.role === 'PATIENT' && (
            <div className={`sidebar-link ${location.pathname === '/discovery' ? 'active' : ''}`} onClick={() => navigate('/discovery')}>
              <MapPin className="sidebar-link-icon" size={18} />
              <span>Find Clinics</span>
            </div>
          )}
          <div className={`sidebar-link ${location.pathname === '/consultations' ? 'active' : ''}`} onClick={() => navigate('/consultations')}>
            <MessageSquare className="sidebar-link-icon" size={18} />
            <span>Consultations</span>
          </div>
          <div className={`sidebar-link ${location.pathname === '/appointments' ? 'active' : ''}`} onClick={() => navigate('/appointments')}>
            <Calendar className="sidebar-link-icon" size={18} />
            <span>Appointments</span>
          </div>
          {user?.role === 'DOCTOR' && (
            <div className={`sidebar-link ${location.pathname === '/pos' ? 'active' : ''}`} onClick={() => navigate('/pos')}>
              <CreditCard className="sidebar-link-icon" size={18} />
              <span>POS Terminal</span>
            </div>
          )}
          
          <div className="sidebar-section-title" style={{ marginTop: '16px' }}>Account</div>
          <div className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`} onClick={() => navigate('/settings')}>
            <SettingsIcon className="sidebar-link-icon" size={18} />
            <span>Settings</span>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-role">{user?.role}</p>
            </div>
          </div>
          <button className="sidebar-logout-btn" style={{ width: '100%', marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }} onClick={() => {
            localStorage.removeItem('token');
            setUser(null);
            navigate('/');
          }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <span className="topbar-breadcrumb">MediSync Portal &gt; Dashboard</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}

function Appointments() {
  return (
    <div className="card">
      <div className="card-body">
        <h2>Appointments</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>Your upcoming scheduled appointments will appear here.</p>
      </div>
    </div>
  );
}


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await authAPI.getProfile();
          setUser(data.data);
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>Loading application...</div>;

  return (
    <Router>
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/onboarding" element={<B2BOnboarding setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/consultations" element={<ConsultationsList user={user} />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/settings" element={<SettingsPage user={user} onUpdateUser={setUser} />} />
          <Route path="/discovery" element={<Discovery user={user} />} />
          <Route path="/pos" element={<POSTerminal user={user} />} />
          <Route path="/consultation/:id" element={<ConsultationRoom user={user} />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
