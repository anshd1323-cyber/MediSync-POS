// ============================================================
// StatCard — dashboard metric card
// ============================================================
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  variant = 'primary',
  id,
}) {
  return (
    <div className="stat-card animate-fade-in" id={id}>
      {Icon && (
        <div className={`stat-card-icon ${variant}`}>
          <Icon size={24} />
        </div>
      )}
      <div className="stat-card-content">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {trend !== undefined && (
          <span className={`stat-card-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}% {trendLabel || ''}
          </span>
        )}
      </div>
    </div>
  );
}
