"use client";

import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Fr009ActionType } from "@/services/smki/tindakanPerbaikan.types";
import TindakanRow from "../molecules/TindakanRow";
import { createAction, orderedFilledActions } from "../form";
import type { Fr009SectionProps } from "../types";
import FormSection from "./FormSection";

export default function TindakanTable({ jenis, ...props }: Fr009SectionProps & { jenis: Fr009ActionType }) {
  const { form, lookup, errors, onChange, disabled } = props;
  const payloadIndices = new Map(orderedFilledActions(form.items).map((item, index) => [item.clientKey, index]));
  const items = form.items.filter((item) => item.jenis === jenis).map((item) => ({ item, index: payloadIndices.get(item.clientKey) ?? -1 }));
  const isCorrection = jenis === "koreksi";
  return <FormSection number={isCorrection ? 3 : 4} title={isCorrection ? "Koreksi (Perbaikan Seketika)" : "Tindakan Korektif"} hint={isCorrection ? "Penanganan langsung terhadap masalah yang ditemukan." : "Tindakan agar ketidaksesuaian tidak terjadi kembali."}>
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800"><table className="block md:table w-full text-left"><caption className="sr-only">{isCorrection ? "Daftar koreksi" : "Daftar tindakan korektif"}</caption><thead className="hidden md:table-header-group bg-slate-50 dark:bg-slate-800 text-xs"><tr><th scope="col" className="p-3">No.</th><th scope="col" className="p-3">{isCorrection ? "Koreksi" : "Tindakan korektif"}</th><th scope="col" className="p-3">PIC</th><th scope="col" className="p-3">Batas waktu</th><th scope="col" className="p-3">Aksi</th></tr></thead><tbody className="block md:table-row-group">
      {items.map(({ item, index }, number) => <TindakanRow key={item.clientKey} item={item} index={index} number={number + 1} lookup={lookup} errors={errors} disabled={disabled} onChange={(changes) => onChange({ items: form.items.map((row) => row.clientKey === item.clientKey ? { ...row, ...changes } : row) })} onRemove={() => onChange({ items: form.items.filter((row) => row.clientKey !== item.clientKey) })} />)}
      {!items.length && <tr className="block md:table-row"><td colSpan={5} className="block md:table-cell p-5 text-xs text-slate-500 text-center">Belum ada tindakan. Tambahkan baris untuk mulai mengisi.</td></tr>}
    </tbody></table></div>
    <Button type="button" variant="outline" className="mt-4 rounded-xl" disabled={disabled} onClick={() => onChange({ items: [...form.items, createAction(jenis)] })}><Plus />Tambah {isCorrection ? "koreksi" : "tindakan korektif"}</Button>
    {errors.items && <p role="alert" className="mt-2 text-xs text-rose-600">{errors.items[0]}</p>}
  </FormSection>;
}
