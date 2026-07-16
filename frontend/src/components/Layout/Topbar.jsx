// ============================================================
// Topbar — page title, date, user info
// ============================================================
import { useAuth } from '../../hooks/useAuth';
import { getInitials, formatDate } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/constants';
import { CalendarDays } from 'lucide-react';

export default function Topbar({ title }) {
  const { user } = useAuth();
  const today = formatDate(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="dashboard-topbar" id="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title || 'Dashboard'}</h1>
      </div>
      <div className="topbar-right">
        <span className="topbar-date" id="topbar-date">
          <CalendarDays size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {today}
        </span>
        <div className="topbar-user-info" id="topbar-user">
          <div className="topbar-user-avatar">
            {getInitials(user?.name || 'U')}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {ROLE_LABELS[user?.role] || 'Staff'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
