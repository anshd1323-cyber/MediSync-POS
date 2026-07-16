// ============================================================
// Sidebar — role-based navigation sidebar
// ============================================================
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContext } from 'react';
import { TenantContext } from '../../context/TenantContext';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { getInitials } from '../../utils/formatters';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  Receipt,
  FileBarChart,
  Stethoscope,
  CalendarCheck,
  FileText,
  History,
  Building2,
  Settings,
  CreditCard,
  LogOut,
  Activity,
  ToggleLeft,
} from 'lucide-react';

const NAV_CONFIG = {
  [ROLES.SUPER_ADMIN]: [
    { section: 'Platform' },
    { to: '/admin', icon: LayoutDashboard, label: 'Tenant Dashboard', end: true },
    { to: '/admin/features', icon: ToggleLeft, label: 'Feature Config' },
  ],
  [ROLES.CLINIC_ADMIN]: [
    { section: 'Clinic' },
    { to: '/clinic', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/clinic/staff', icon: Users, label: 'Staff Management' },
    { to: '/clinic/subscription', icon: CreditCard, label: 'Subscription' },
  ],
  [ROLES.RECEPTIONIST]: [
    { section: 'Front Desk' },
    { to: '/frontdesk', icon: Users, label: 'Patient Search', end: true },
    { to: '/frontdesk/queue', icon: ClipboardList, label: 'Token Queue' },
    { to: '/frontdesk/billing', icon: Receipt, label: 'Billing Counter' },
    { to: '/frontdesk/day-report', icon: FileBarChart, label: 'Day-End Report' },
  ],
  [ROLES.DOCTOR]: [
    { section: 'Practice' },
    { to: '/doctor', icon: CalendarCheck, label: "Today's Patients", end: true },
    { to: '/doctor/consultation', icon: Stethoscope, label: 'Consultation' },
    { to: '/doctor/prescription', icon: FileText, label: 'Prescription Writer' },
    { to: '/doctor/history', icon: History, label: 'Patient History' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const tenantCtx = useContext(TenantContext);
  const role = user?.role || ROLES.RECEPTIONIST;
  const navItems = NAV_CONFIG[role] || [];
  const clinicName = tenantCtx?.tenant?.name || 'ClinicOS';

  return (
    <aside className="dashboard-sidebar" id="sidebar">
      {/* Header / Brand */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Activity size={20} />
        </div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">ClinicOS</span>
          <span className="sidebar-brand-sub">{clinicName}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" id="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return (
              <div className="sidebar-section-title" key={`section-${i}`}>
                {item.section}
              </div>
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              id={`nav-${item.to.replace(/\//g, '-').replace(/^-/, '')}`}
            >
              <Icon size={20} className="sidebar-link-icon" />
              <span>{item.label}</span>
              {item.badge && <span className="sidebar-link-badge">{item.badge}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {getInitials(user?.name || 'U')}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{ROLE_LABELS[role] || role}</div>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={logout}
            title="Logout"
            id="sidebar-logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
