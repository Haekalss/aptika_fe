export function Fr025Status({ status }: { status: "draft" | "final" }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status === "final" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{status === "final" ? "Final" : "Draft"}</span>;
}
