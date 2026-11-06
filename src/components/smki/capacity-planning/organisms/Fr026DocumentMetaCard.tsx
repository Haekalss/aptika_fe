import type { Fr026Category, Fr026Meta } from "@/services/smki/capacityPlanning.types";
import { fr026Date } from "../form";

export function Fr026DocumentMetaCard({ category, meta }: { category: Fr026Category; meta: Fr026Meta }) {
  const document = meta.documents[category];
  const items = [
    { label: "Nomor dokumen", value: document.code, mono: true },
    { label: "Revisi", value: document.revision },
    { label: "Tanggal", value: fr026Date(document.tanggal) },
    { label: "Last Update", value: fr026Date(document.last_update) },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</dt>
          <dd className={`mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100 ${item.mono ? "font-mono text-[13px]" : ""}`}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
