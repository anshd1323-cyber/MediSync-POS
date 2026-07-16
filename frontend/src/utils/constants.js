// ============================================================
// ClinicOS Constants
// ============================================================

// User Roles
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLINIC_ADMIN: 'CLINIC_ADMIN',
  DOCTOR: 'DOCTOR',
  RECEPTIONIST: 'RECEPTIONIST',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.CLINIC_ADMIN]: 'Clinic Admin',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.RECEPTIONIST]: 'Receptionist',
};

// Role → default dashboard path mapping
export const ROLE_DASHBOARDS = {
  [ROLES.SUPER_ADMIN]: '/admin',
  [ROLES.CLINIC_ADMIN]: '/clinic',
  [ROLES.DOCTOR]: '/doctor',
  [ROLES.RECEPTIONIST]: '/frontdesk',
};

// Visit / Token Status
export const VISIT_STATUS = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const VISIT_STATUS_LABELS = {
  [VISIT_STATUS.WAITING]: 'Waiting',
  [VISIT_STATUS.IN_PROGRESS]: 'In Progress',
  [VISIT_STATUS.COMPLETED]: 'Completed',
  [VISIT_STATUS.CANCELLED]: 'Cancelled',
};

export const VISIT_STATUS_BADGE = {
  [VISIT_STATUS.WAITING]: 'info',
  [VISIT_STATUS.IN_PROGRESS]: 'warning',
  [VISIT_STATUS.COMPLETED]: 'success',
  [VISIT_STATUS.CANCELLED]: 'neutral',
};

// Billing
export const BILL_ITEM_TYPES = [
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'PROCEDURE', label: 'Procedure' },
  { value: 'MEDICINE', label: 'Medicine' },
  { value: 'LAB', label: 'Lab Test' },
];

export const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
  { value: 'INSURANCE', label: 'Insurance' },
];

export const BILL_STATUS = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  REFUNDED: 'REFUNDED',
};

// Tenant / Subscription Plans
export const PLANS = {
  FREE: 'FREE',
  STARTER: 'STARTER',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
};

export const PLAN_LABELS = {
  [PLANS.FREE]: 'Free',
  [PLANS.STARTER]: 'Starter',
  [PLANS.PRO]: 'Pro',
  [PLANS.ENTERPRISE]: 'Enterprise',
};

export const PLAN_BADGE = {
  [PLANS.FREE]: 'neutral',
  [PLANS.STARTER]: 'info',
  [PLANS.PRO]: 'primary',
  [PLANS.ENTERPRISE]: 'success',
};

// Tenant Statuses
export const TENANT_STATUS = {
  ACTIVE: 'ACTIVE',
  TRIAL: 'TRIAL',
  EXPIRED: 'EXPIRED',
  SUSPENDED: 'SUSPENDED',
};

export const TENANT_STATUS_LABELS = {
  [TENANT_STATUS.ACTIVE]: 'Active',
  [TENANT_STATUS.TRIAL]: 'Trial',
  [TENANT_STATUS.EXPIRED]: 'Expired',
  [TENANT_STATUS.SUSPENDED]: 'Suspended',
};

export const TENANT_STATUS_BADGE = {
  [TENANT_STATUS.ACTIVE]: 'success',
  [TENANT_STATUS.TRIAL]: 'warning',
  [TENANT_STATUS.EXPIRED]: 'danger',
  [TENANT_STATUS.SUSPENDED]: 'neutral',
};

// Staff Statuses
export const STAFF_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

// Feature Keys — used for feature gating
export const FEATURES = {
  PATIENT_MANAGEMENT: 'patient_management',
  TOKEN_QUEUE: 'token_queue',
  BILLING: 'billing',
  PRESCRIPTION: 'prescription',
  PATIENT_HISTORY: 'patient_history',
  REPORTS: 'reports',
  STAFF_MANAGEMENT: 'staff_management',
  MULTI_DOCTOR: 'multi_doctor',
  SMS_NOTIFICATIONS: 'sms_notifications',
  LAB_INTEGRATION: 'lab_integration',
  INVENTORY: 'inventory',
  CUSTOM_BRANDING: 'custom_branding',
};

// Gender options
export const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

// Blood Group options
export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
];

// Medicine frequency options
export const FREQUENCIES = [
  { value: 'OD', label: 'Once daily (OD)' },
  { value: 'BD', label: 'Twice daily (BD)' },
  { value: 'TDS', label: 'Thrice daily (TDS)' },
  { value: 'QID', label: 'Four times daily (QID)' },
  { value: 'SOS', label: 'As needed (SOS)' },
  { value: 'STAT', label: 'Immediately (STAT)' },
  { value: 'HS', label: 'At bedtime (HS)' },
];

// Duration units
export const DURATION_UNITS = [
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
  { value: 'months', label: 'Months' },
];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
