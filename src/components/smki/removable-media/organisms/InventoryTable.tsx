import type { Fr025Item } from "@/services/smki/removableMedia.types";

const conditions = { baik: "Baik", kurang_baik: "Kurang Baik", rusak: "Rusak" };
export function InventoryTable({ items }: { items: Fr025Item[] }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[1000px] text-left text-sm">
    <caption className="px-6 py-4 text-left text-lg font-bold text-slate-900">Rincian Inventaris</caption>
    <thead className="bg-slate-50 text-xs text-slate-600"><tr>{["No", "Nama Barang", "Merek", "Jumlah", "Tahun Pengadaan", "PIC Pemegang Inventaris", "Keadaan Barang", "Keterangan"].map((text) => <th key={text} scope="col" className="p-4">{text}</th>)}</tr></thead>
    <tbody className="divide-y divide-slate-100">{items.map((item, index) => <tr key={item.id ?? index} className="align-top [&>td]:p-4"><td>{index + 1}</td><td className="font-semibold">{item.nama_barang || "-"}</td><td>{item.merek || "-"}</td><td>{item.jumlah ?? "-"}</td><td>{item.tahun_pengadaan ?? "-"}</td><td>{item.pic_nama || "-"}</td><td>{item.kondisi ? conditions[item.kondisi] : "-"}</td><td className="max-w-xs whitespace-pre-wrap break-words">{item.keterangan || "-"}</td></tr>)}</tbody>
  </table>{!items.length && <p className="p-8 text-center text-sm text-slate-500">Draft belum memiliki barang.</p>}</div>;
}
