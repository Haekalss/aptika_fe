export interface PerubahanItFormSummary {
  tanggalPengajuan: string;
  perangkatDaerah: string;
  pemohon: string;
  jenisPermohonan: string;
  namaAplikasi: string;
}

export interface PerubahanItSubmission {
  formData: PerubahanItFormSummary;
}

export interface PerubahanItTicket {
  id: number | string;
  no_rfc: string;
  status: string;
}

export interface PerubahanItApiError {
  errors?: Record<string, unknown>;
  error?: unknown;
  message?: unknown;
}
