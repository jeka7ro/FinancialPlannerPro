export interface DashboardStats {
  totalRevenue: number;
  activeCabinets: number;
  totalLocations: number;
  avgDailyPlay: number;
  recentActivity: any[];
  topLocations: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface SearchAndFilterState {
  search: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type StatusVariant = 'active' | 'maintenance' | 'inactive' | 'pending' | 'completed' | 'cancelled';

export interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  actionLabel?: string;
  actionUrl?: string;
}
