const user = { id: 901, name: 'Staf Uji FR009', email: 'pdf@example.invalid', role: 'user' };
const bidang = { id: 901, code: 'TEST', name: 'Bidang Uji PDF' };
const services = [{ id: 16, code: 'SMKI', name: 'SMKI', is_enabled: true }];
const lookup = {
  units: [], users: [user], auditors: [],
  sources: [
    ['audit_internal', 'Audit Internal'], ['laporan_insiden', 'Laporan Insiden'], ['audit_eksternal', 'Audit Eksternal'],
    ['usulan_saran', 'Usulan / Saran'], ['pengukuran_pemantauan', 'Pengukuran dan pemantauan'], ['lainnya', 'Lain-lain'],
  ].map(([code, label]) => ({ code, label })),
  template: { code: 'FR-009/ KOM.03.05/SANDIKAMI', revision: '3.0', effective_date: '2023-09-11', classification: 'INTERNAL' },
  export_pdf_available: false,
};

function report(overrides = {}) {
  return {
    id: 901, nomor_laporan: 'FR009/UJI/2026', id_unit_kerja: null, area: bidang.name, tanggal_laporan: '2026-10-19',
    diajukan_kepada_id: null, diajukan_kepada_nama: 'Atasan Uji', dilaporkan_oleh_id: user.id, dilaporkan_oleh_nama: user.name,
    sumber_codes: ['audit_internal', 'lainnya'], sumber_lainnya: 'Evaluasi layanan', status_temuan: 'Minor',
    deskripsi: 'Prosedur peninjauan hak akses belum dilaksanakan secara berkala.', akar_masalah: 'Jadwal evaluasi dan PIC belum ditetapkan.',
    id_auditor: null, auditor_nama: 'Auditor Uji', atasan_id: null, atasan_nama: 'Atasan Uji',
    items: [
      { id: 1, jenis: 'koreksi', urutan: 1, uraian: 'Tinjau dan perbaiki hak akses akun aktif.', pic_id: user.id, pic_nama: user.name, batas_waktu: '2026-10-20' },
      { id: 2, jenis: 'tindakan_korektif', urutan: 1, uraian: 'Perbarui SOP dan jadwal evaluasi berkala.', pic_id: user.id, pic_nama: user.name, batas_waktu: '2026-10-21' },
    ],
    status: 'submitted', verifikasi: 'Close', tanggal_verifikasi: '2026-10-22', catatan_verifikasi: 'Koreksi dan SOP telah diperiksa. Temuan selesai.',
    created_by: user.id, bidang_id: bidang.id, verified_by: 902, version: 3, template_version: '3.0', verifications: [],
    permissions: { can_update: false, can_delete: false, can_verify: false, can_export: true },
    ...overrides,
  };
}

module.exports = { user, bidang, services, lookup, report };
