/**
 * CSV Export Utilities for Admin Reports
 */

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  loyalty_points: number;
  loyalty_tier: string;
  created_at: string;
  updated_at: string;
}

interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: string;
  description: string | null;
  order_id: string | null;
  created_at: string;
}

const escapeCSVField = (field: string | number | null | undefined): string => {
  if (field === null || field === undefined) return '';
  const str = String(field);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const formatDateForCSV = (date: string): string => {
  return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
};

export const exportUserProfilesToCSV = (users: UserProfile[]): void => {
  const headers = [
    'User ID',
    'Full Name',
    'Email',
    'Loyalty Points',
    'Loyalty Tier',
    'Created At',
    'Updated At',
  ];

  const rows = users.map((user) => [
    escapeCSVField(user.user_id),
    escapeCSVField(user.full_name),
    escapeCSVField(user.email),
    escapeCSVField(user.loyalty_points),
    escapeCSVField(user.loyalty_tier),
    escapeCSVField(formatDateForCSV(user.created_at)),
    escapeCSVField(formatDateForCSV(user.updated_at)),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  downloadCSV(csvContent, `user_profiles_${getDateStamp()}.csv`);
};

export const exportLoyaltyTransactionsToCSV = (transactions: LoyaltyTransaction[]): void => {
  const headers = [
    'Transaction ID',
    'User ID',
    'Points',
    'Transaction Type',
    'Description',
    'Order ID',
    'Created At',
  ];

  const rows = transactions.map((tx) => [
    escapeCSVField(tx.id),
    escapeCSVField(tx.user_id),
    escapeCSVField(tx.points),
    escapeCSVField(tx.transaction_type),
    escapeCSVField(tx.description),
    escapeCSVField(tx.order_id),
    escapeCSVField(formatDateForCSV(tx.created_at)),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  downloadCSV(csvContent, `loyalty_transactions_${getDateStamp()}.csv`);
};

export const exportCombinedReportToCSV = (
  users: UserProfile[],
  transactions: LoyaltyTransaction[]
): void => {
  // Create a map of user_id to user info
  const userMap = new Map(users.map((u) => [u.user_id, u]));

  const headers = [
    'Transaction ID',
    'User ID',
    'User Name',
    'User Email',
    'User Tier',
    'Current Points Balance',
    'Transaction Points',
    'Transaction Type',
    'Description',
    'Order ID',
    'Transaction Date',
  ];

  const rows = transactions.map((tx) => {
    const user = userMap.get(tx.user_id);
    return [
      escapeCSVField(tx.id),
      escapeCSVField(tx.user_id),
      escapeCSVField(user?.full_name),
      escapeCSVField(user?.email),
      escapeCSVField(user?.loyalty_tier),
      escapeCSVField(user?.loyalty_points),
      escapeCSVField(tx.points),
      escapeCSVField(tx.transaction_type),
      escapeCSVField(tx.description),
      escapeCSVField(tx.order_id),
      escapeCSVField(formatDateForCSV(tx.created_at)),
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  downloadCSV(csvContent, `loyalty_report_${getDateStamp()}.csv`);
};

const getDateStamp = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const downloadCSV = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
