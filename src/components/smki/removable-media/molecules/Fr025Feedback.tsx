import { Fr025Button } from "../atoms/Fr025Button";

export function Fr025Feedback({ message, onRetry, error = false }: { message: string; onRetry?: () => void; error?: boolean }) {
  return <div role={error ? "alert" : "status"} className={`rounded-2xl border bg-white p-8 text-sm ${error ? "border-red-200 text-red-700" : "border-slate-200 text-slate-600"}`}>
    <p>{message}</p>{onRetry && <Fr025Button className="mt-4" variant="outline" onClick={onRetry}>Coba lagi</Fr025Button>}
  </div>;
}
