import { Trash2 } from "lucide-react";
import type { Fr025Lookup } from "@/services/smki/removableMedia.types";
import type { Fr025FormItem } from "../form";
import { Fr025Button } from "../atoms/Fr025Button";
import { Fr025Field, fr025Control } from "./Fr025Field";
import { MasterChoice } from "./MasterChoice";

export function InventoryRow({ item, index, lookup, onChange, onRemove, errors, disabled }: {
  item: Fr025FormItem; index: number; lookup: Fr025Lookup; onChange: (value: Partial<Fr025FormItem>) => void;
  onRemove: () => void; errors: Record<string, string>; disabled: boolean;
}) {
  const prefix = `fr025-${item.client_key}`;
  const error = (field: string) => errors[`items.${index}.${field}`];
  return <tr className="align-top [&>td]:p-3">
    <td className="text-center font-semibold text-slate-500">{index + 1}</td>
    <td><MasterChoice id={`${prefix}-name`} label={`Nama barang ${index + 1}`} compact options={lookup.names} selectedId={item.nama_barang_id} name={item.nama_barang ?? ""} onChange={(nama_barang_id, nama_barang) => onChange({ nama_barang_id, nama_barang })} error={error("nama_barang") || error("nama_barang_id")} disabled={disabled} /></td>
    <td><MasterChoice id={`${prefix}-brand`} label={`Merek ${index + 1}`} compact options={lookup.brands} selectedId={item.merek_id} name={item.merek ?? ""} onChange={(merek_id, merek) => onChange({ merek_id, merek })} error={error("merek") || error("merek_id")} disabled={disabled} /></td>
    <td><Fr025Field id={`${prefix}-qty`} label={`Jumlah ${index + 1}`} compact error={error("jumlah")}><input type="number" min="1" max="1000000" step="1" className={fr025Control} value={item.jumlah} disabled={disabled} onChange={(event) => onChange({ jumlah: event.target.value })} /></Fr025Field></td>
    <td><Fr025Field id={`${prefix}-year`} label={`Tahun pengadaan ${index + 1}`} compact error={error("tahun_pengadaan")}><input type="number" min="1900" max={Number(new Date().toLocaleDateString("en", { timeZone: "Asia/Jakarta", year: "numeric" }))} step="1" className={fr025Control} value={item.tahun_pengadaan} disabled={disabled} placeholder="YYYY" onChange={(event) => onChange({ tahun_pengadaan: event.target.value })} /></Fr025Field></td>
    <td><MasterChoice id={`${prefix}-pic`} label={`PIC pemegang inventaris ${index + 1}`} compact options={lookup.pics} selectedId={item.pic_id} name={item.pic_nama ?? ""} onChange={(pic_id, pic_nama) => onChange({ pic_id, pic_nama })} error={error("pic_nama") || error("pic_id")} disabled={disabled} /></td>
    <td><Fr025Field id={`${prefix}-condition`} label={`Keadaan barang ${index + 1}`} compact error={error("kondisi")}><select className={fr025Control} value={item.kondisi ?? ""} disabled={disabled} onChange={(event) => onChange({ kondisi: (event.target.value || null) as Fr025FormItem["kondisi"] })}><option value="">Pilih kondisi</option>{Object.entries(lookup.conditions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Fr025Field></td>
    <td><Fr025Field id={`${prefix}-note`} label={`Keterangan ${index + 1}`} compact error={error("keterangan")}><textarea className={fr025Control} rows={3} value={item.keterangan ?? ""} maxLength={3000} disabled={disabled} onChange={(event) => onChange({ keterangan: event.target.value })} /></Fr025Field></td>
    <td><Fr025Button variant="ghost" aria-label={`Hapus barang ${index + 1}`} onClick={onRemove} disabled={disabled}><Trash2 className="text-red-600" /></Fr025Button></td>
  </tr>;
}
