import { Fr026Button } from "../atoms/Fr026Button";

export function Fr026Feedback({
  message,
  onRetry,
  error = false,
}: {
  message: string;
  onRetry?: () => void;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-2xl border bg-white p-8 text-sm shadow-sm dark:bg-[#0b1e3d] ${
        error ? "border-red-200 text-red-700 dark:border-red-900/60 dark:text-red-300" : "border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300"
      }`}
    >
      <p>{message}</p>
      {onRetry && (
        <Fr026Button className="mt-4" variant="outline" onClick={onRetry}>
          Coba lagi
        </Fr026Button>
      )}
    </div>
  );
}
