/**
 * Storage Quota Configuration & Calculations
 */
export const DEFAULT_QUOTA_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB default college/free tier
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB max single file upload

export const CLOUD_PLANS = [
  {
    id: 'starter',
    name: 'College Starter',
    quotaBytes: 5 * 1024 * 1024 * 1024,
    description: 'Perfect for student projects, coursework, and personal cloud backup.',
    price: 'Free',
    features: ['5 GB Secure Cloud Storage', 'Real-time sync', 'Email file sharing', 'Standard upload speed'],
  },
  {
    id: 'pro',
    name: 'Cloud Pro',
    quotaBytes: 25 * 1024 * 1024 * 1024,
    description: 'Designed for research labs, teams, and high-resolution media storage.',
    price: '$4.99 / mo',
    features: ['25 GB Cloud Storage', 'Priority bandwidth', 'Custom expiration links', 'Role-based sharing', 'Detailed audit logs'],
  },
  {
    id: 'enterprise',
    name: 'Campus Enterprise',
    quotaBytes: 100 * 1024 * 1024 * 1024,
    description: 'Institutional-grade infrastructure with automated backups and admin console.',
    price: '$14.99 / mo',
    features: ['100 GB Cloud Storage', 'Full Admin Dashboard', 'Custom security rules', 'Unlimited team shares', '24/7 Priority support'],
  }
];

export function getStoragePercentage(usedBytes, totalQuota = DEFAULT_QUOTA_BYTES) {
  if (!usedBytes || usedBytes <= 0) return 0;
  const pct = (usedBytes / totalQuota) * 100;
  return Math.min(100, parseFloat(pct.toFixed(1)));
}

export function getQuotaStatus(usedBytes, totalQuota = DEFAULT_QUOTA_BYTES) {
  const percentage = getStoragePercentage(usedBytes, totalQuota);
  if (percentage >= 95) {
    return {
      level: 'critical',
      message: 'Storage almost full! You have exceeded 95% of your quota.',
      color: 'bg-rose-500',
      textColor: 'text-rose-600 dark:text-rose-400',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    };
  }
  if (percentage >= 80) {
    return {
      level: 'warning',
      message: 'Storage running low (over 80% used). Consider freeing up space.',
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    };
  }
  return {
    level: 'normal',
    message: 'Healthy storage status.',
    color: 'bg-brand-500',
    textColor: 'text-brand-600 dark:text-brand-400',
    badgeColor: 'bg-brand-100 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300',
  };
}
