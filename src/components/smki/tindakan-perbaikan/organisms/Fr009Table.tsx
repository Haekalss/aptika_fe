"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Fr009Record } from "@/services/smki/tindakanPerbaikan.types";

export default function Fr009Table({ records, onDelete }: { records: Fr009Record[]; onDelete: (record: Fr009Record) => void }) {
  return <div className="overflow-x-auto"><table className="w-full text-left text-xs"><caption className="sr-only">Daftar laporan FR-009</caption><thead className="bg-slate-50 dark:bg-slate-800 text-slate-500"><tr>{["No. / Tanggal", "Divisi / Area", "Pelapor", "Status laporan", "Verifikasi", "Aksi"].map((label) => <th key={label} scope="col" className="p-4 uppercase tracking-wide">{label}</th>)}</tr></thead><tbody>
    {records.map((record) => <tr key={record.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"><td className="p-4"><Link href={`/smki/tindakan-perbaikan/${record.id}`} className="font-bold text-emerald-700 dark:text-emerald-300">{record.nomor_laporan || `Draft #${record.id}`}</Link><p className="text-slate-500 mt-1">{record.tanggal_laporan?.slice(0, 10) || "—"}</p></td><td className="p-4">{record.area || "—"}</td><td className="p-4">{record.dilaporkan_oleh_nama || "—"}</td><td className="p-4"><StatusBadge status={record.status === "draft" ? "Draft" : "Diajukan"} /></td><td className="p-4"><StatusBadge status={record.verifikasi || "Belum diverifikasi"} /></td><td className="p-4"><div className="flex items-center gap-2"><Link className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={`Lihat laporan ${record.nomor_laporan || record.id}`} href={`/smki/tindakan-perbaikan/${record.id}`}><Eye size={16} /></Link>{record.permissions.can_update && <Link className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={`Edit laporan ${record.nomor_laporan || record.id}`} href={`/smki/tindakan-perbaikan/${record.id}/edit`}><Pencil size={16} /></Link>}{record.permissions.can_delete && <Button variant="ghost" size="icon" aria-label={`Hapus laporan ${record.nomor_laporan || record.id}`} onClick={() => onDelete(record)}><Trash2 className="text-rose-600" /></Button>}</div></td></tr>)}
    {!records.length && <tr><td colSpan={6} className="py-12 text-center text-slate-500">Belum ada laporan yang sesuai filter.</td></tr>}
  </tbody></table></div>;
}
