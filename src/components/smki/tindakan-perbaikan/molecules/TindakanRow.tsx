"use client";

import { Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PersonField from "./PersonField";
import type { Fr009Errors, Fr009Lookup } from "@/services/smki/tindakanPerbaikan.types";
import type { Fr009FormAction } from "../types";

export default function TindakanRow({ item, index, number, lookup, errors, onChange, onRemove, disabled }: {
  item: Fr009FormAction; index: number; number: number; lookup: Fr009Lookup; errors: Fr009Errors;
  onChange: (changes: Partial<Fr009FormAction>) => void; onRemove: () => void; disabled?: boolean;
}) {
  const fieldError = (key: string) => index >= 0 ? errors[`items.${index}.${key}`]?.[0] : undefined;
  return <tr className="block md:table-row align-top border-t border-slate-100 dark:border-slate-800 p-2 md:p-0">
    <td className="block md:table-cell p-3 text-xs font-semibold"><span className="md:hidden">Tindakan </span>{number}</td>
    <td className="block md:table-cell p-3 min-w-0 md:min-w-64"><span className="block md:hidden text-xs text-slate-500 mb-2">Uraian tindakan</span><Input textarea rows={3} aria-label={`Uraian tindakan ${number}`} value={item.uraian} onChange={(event) => onChange({ uraian: event.target.value })} error={fieldError("uraian")} className="rounded-xl" /></td>
    <td className="block md:table-cell p-3 min-w-0 md:min-w-56"><PersonField label={`PIC tindakan ${number}`} id={item.pic_id} name={item.pic_nama} options={lookup.users} onChange={(pic_id, pic_nama) => onChange({ pic_id, pic_nama })} error={fieldError("pic_id") || fieldError("pic_nama")} /></td>
    <td className="block md:table-cell p-3 min-w-0 md:min-w-44"><span className="block md:hidden text-xs text-slate-500 mb-2">Batas waktu</span><Input type="date" aria-label={`Batas waktu tindakan ${number}`} value={item.batas_waktu || ""} onChange={(event) => onChange({ batas_waktu: event.target.value || null })} error={fieldError("batas_waktu")} className="rounded-xl" /></td>
    <td className="block md:table-cell p-3"><Button type="button" size="icon" variant="ghost" disabled={disabled} aria-label={`Hapus tindakan ${number}`} onClick={onRemove}><Trash2 className="text-rose-600" /></Button></td>
  </tr>;
}
