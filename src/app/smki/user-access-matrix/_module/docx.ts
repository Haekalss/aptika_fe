import { downloadDaftarRoleDocx } from "@/services/smki/daftarRoleService";
import type { MatrixRecord } from "./model";

/**
 * Unduh formulir FR-033 dari endpoint backend, mengikuti pola modul SMKI lain
 * (mis. daftarRekamanService.downloadDaftarRekamanDocx).
 */
export async function downloadMatricesDocx(records: MatrixRecord[]): Promise<void> {
  if (!records.length) throw new Error("Tidak ada formulir untuk diekspor.");

  for (const record of records) {
    const blob = await downloadDaftarRoleDocx(record.id);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `FR-033_Daftar-Role_${record.unit || "Unit-Kerja"}.docx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
