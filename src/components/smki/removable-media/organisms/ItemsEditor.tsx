import { Plus } from "lucide-react";
import type { Fr025Lookup } from "@/services/smki/removableMedia.types";
import type { Fr025FormItem } from "../form";
import { blankFr025Item } from "../form";
import { Fr025Button } from "../atoms/Fr025Button";
import { InventoryRow } from "../molecules/InventoryRow";

export function ItemsEditor({ items, lookup, onChange, errors, disabled }: {
  items: Fr025FormItem[]; lookup: Fr025Lookup; onChange: (items: Fr025FormItem[]) => void; errors: Record<string, string>; disabled: boolean;
}) {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="fr025-items-title">
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 p-6">
      <div><h2 id="fr025-items-title" className="text-lg font-bold text-slate-900">2. Rincian Inventaris</h2><p className="mt-1 text-sm text-slate-500">Pilih master atau isi manual. Satu kondisi per baris; pisahkan kondisi/PIC berbeda. Maksimal 100 baris.</p></div>
      <Fr025Button onClick={() => onChange([...items, blankFr025Item()])} disabled={disabled || items.length >= 100}><Plus />Tambah barang</Fr025Button>
    </div>
    {errors.items && <p className="px-6 pt-4 text-sm text-red-600" role="alert">{errors.items}</p>}
    <div className="overflow-x-auto" role="region" aria-label="Editor rincian inventaris; geser horizontal untuk seluruh kolom" tabIndex={0}>
      <table className="w-full min-w-[1125px] table-fixed text-left text-sm">
        <caption className="sr-only">Daftar barang removable media</caption>
        <colgroup>{[45, 180, 150, 85, 110, 180, 130, 190, 55].map((width, index) => <col key={index} style={{ width }} />)}</colgroup>
        <thead className="bg-slate-50 text-xs font-semibold text-slate-600"><tr>{["No", "Nama Barang", "Merek", "Jumlah", "Tahun Pengadaan", "PIC Pemegang Inventaris", "Keadaan Barang", "Keterangan", "Aksi"].map((label) => <th key={label} scope="col" className="p-3">{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{items.map((item, index) => <InventoryRow key={item.client_key} item={item} index={index} lookup={lookup} errors={errors} disabled={disabled} onChange={(value) => onChange(items.map((row) => row.client_key === item.client_key ? { ...row, ...value } : row))} onRemove={() => { if (window.confirm(`Hapus barang ${index + 1} dari draft ini?`)) onChange(items.filter((row) => row.client_key !== item.client_key)); }} />)}</tbody>
      </table>
      {items.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Belum ada barang. Tambahkan setidaknya satu barang sebelum finalisasi.</p>}
    </div>
  </section>;
}
