// ============================================================
// Badge — colored status pill
// ============================================================

export default function Badge({ variant = 'neutral', children, dot = true, id }) {
  return (
    <span className={`badge badge-${variant}`} id={id}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}
