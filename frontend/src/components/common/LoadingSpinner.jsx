// ============================================================
// LoadingSpinner — animated spinner with optional message
// ============================================================
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message, size = 'md', className = '' }) {
  return (
    <div className={`spinner spinner-${size} ${className}`} id="loading-spinner">
      <div className="spinner-circle" />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
}

export function PageLoading({ message = 'Loading…' }) {
  return (
    <div className="page-loading" id="page-loading">
      <LoadingSpinner message={message} size="lg" />
    </div>
  );
}
