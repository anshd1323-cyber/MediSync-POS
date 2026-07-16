// ============================================================
// useFeatureGate hook — check if a feature is available
// ============================================================
import { useContext } from 'react';
import { TenantContext } from '../context/TenantContext';

export function useFeatureGate(featureKey) {
  const ctx = useContext(TenantContext);
  if (!ctx) return false;

  const { features } = ctx;
  // Super admins have wildcard access
  if (features.includes('*')) return true;
  return features.includes(featureKey);
}
