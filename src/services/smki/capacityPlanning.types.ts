export type Fr026Category = "server" | "network";
export type Fr026Tab = "ringkasan" | Fr026Category;

export interface Fr026MonthOption {
  month: number;
  label: string;
}

export interface Fr026DocumentMeta {
  code: string;
  revision: string;
  effective_date: string;
  year: number;
  tanggal: string | null;
  last_update: string | null;
}

export interface Fr026Meta {
  year: number;
  month: number;
  period_label: string;
  month_label: string;
  short_month_label: string;
  months: Fr026MonthOption[];
  documents: Record<Fr026Category, Fr026DocumentMeta>;
}

export interface Fr026Log {
  id: number;
  year: number;
  month: number;
  current_storage_gb: number | null;
  current_memory_pct: number | null;
  current_cpu_pct: number | null;
  projection_storage_gb: number | null;
  projection_memory_pct: number | null;
  projection_cpu_pct: number | null;
  bandwidth_capacity_mbps: number | null;
  bandwidth_max_usage_mbps: number | null;
  bandwidth_usage_pct: number | null;
  sla_agreement_pct: number | null;
  sla_achievement_pct: number | null;
  notes: string | null;
  difference_storage_gb: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Fr026Asset {
  id: number;
  category: Fr026Category;
  asset_name: string;
  ip_address: string | null;
  logs: Fr026Log[];
  logs_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Fr026MonthStat {
  month: number;
  label: string;
  logged: number;
  total: number;
  is_active: boolean;
}

export interface Fr026MissingAsset {
  asset_id: number;
  asset_name: string;
  category: Fr026Category;
  ip_address: string | null;
}

export interface Fr026ServerComparison {
  asset_id: number;
  asset_name: string;
  ip_address: string | null;
  has_log: boolean;
  current_storage_gb: number | null;
  projection_storage_gb: number | null;
  difference_gb: number | null;
}

export interface Fr026NetworkUsage {
  asset_id: number;
  asset_name: string;
  ip_address: string | null;
  has_log: boolean;
  capacity_mbps: number | null;
  max_usage_mbps: number | null;
  usage_pct: number | null;
}

export interface Fr026Summary {
  total_assets: number;
  server_count: number;
  network_count: number;
  logs_this_month: number;
  month_completeness_pct: number;
  expected_to_date: number;
  logged_to_date: number;
  completeness_pct: number;
  annual_expected: number;
  annual_logs: number;
  monthly: Fr026MonthStat[];
  missing_current_month: Fr026MissingAsset[];
  server_comparison: Fr026ServerComparison[];
  network_usage: Fr026NetworkUsage[];
}

export interface Fr026Dashboard {
  meta: Fr026Meta;
  assets: Fr026Asset[];
  summary: Fr026Summary;
  permissions: { can_manage: boolean };
}

export interface Fr026AssetPayload {
  category: Fr026Category;
  asset_name: string;
  ip_address: string | null;
}

export interface Fr026ServerLogPayload {
  year: number;
  month: number;
  current_storage_gb: number;
  current_memory_pct: number;
  current_cpu_pct: number;
  projection_storage_gb: number;
  projection_memory_pct: number;
  projection_cpu_pct: number;
}

export interface Fr026NetworkLogPayload {
  year: number;
  month: number;
  bandwidth_capacity_mbps: number;
  bandwidth_max_usage_mbps: number;
  sla_agreement_pct: number;
  sla_achievement_pct: number;
  notes: string | null;
}

export type Fr026LogPayload = Fr026ServerLogPayload | Fr026NetworkLogPayload;
