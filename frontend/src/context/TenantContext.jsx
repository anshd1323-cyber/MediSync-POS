// ============================================================
// TenantContext — loads tenant info & feature flags after auth
// ============================================================
import { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { getSubscription } from '../api/clinic';

export const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [tenant, setTenant] = useState(null);
  const [features, setFeatures] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setTenant(null);
      setFeatures([]);
      setPlan(null);
      return;
    }

    // Super admins don't belong to a tenant
    if (user.role === 'SUPER_ADMIN') {
      setTenant({ name: 'ClinicOS Platform' });
      setFeatures(['*']); // all features
      setPlan('ENTERPRISE');
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await getSubscription();
        const data = res.data;
        if (!cancelled) {
          setTenant(data.tenant || data.clinic || { name: user.clinicName || 'My Clinic' });
          setFeatures(data.features || []);
          setPlan(data.plan || 'FREE');
        }
      } catch {
        // Fall back to basic info from user
        if (!cancelled) {
          setTenant({ name: user.clinicName || 'My Clinic' });
          setFeatures([]);
          setPlan('FREE');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, user]);

  const value = useMemo(() => ({
    tenant,
    features,
    plan,
    loading,
  }), [tenant, features, plan, loading]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}
