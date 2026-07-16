// ============================================================
// FeatureGate — shows children or UpgradePrompt
// ============================================================
import { useFeatureGate } from '../../hooks/useFeatureGate';
import { Lock, ArrowUpCircle } from 'lucide-react';

function UpgradePrompt({ feature }) {
  return (
    <div className="upgrade-prompt" id="upgrade-prompt">
      <div className="upgrade-prompt-icon">
        <Lock size={28} />
      </div>
      <h3>Feature Not Available</h3>
      <p>
        The <strong>{feature}</strong> feature is not included in your current plan.
        Upgrade to unlock this and more.
      </p>
      <button className="btn btn-primary btn-lg" id="upgrade-btn">
        <ArrowUpCircle size={20} />
        Upgrade Plan
      </button>
    </div>
  );
}

export default function FeatureGate({ feature, children, fallback }) {
  const hasFeature = useFeatureGate(feature);

  if (hasFeature) return children;
  return fallback || <UpgradePrompt feature={feature} />;
}
