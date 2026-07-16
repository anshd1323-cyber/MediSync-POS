// ============================================================
// DashboardLayout — shell for authenticated pages
// ============================================================
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ title, children }) {
  return (
    <div className="dashboard-layout" id="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Topbar title={title} />
        <main className="dashboard-content animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
