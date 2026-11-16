"use client";

/** Baris skeleton untuk keadaan loading di dalam <tbody>. */
export default function Fr048SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-slate-100 dark:border-slate-800 animate-pulse" aria-hidden="true">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-3 py-3">
              <div className="h-3.5 rounded bg-slate-200 dark:bg-slate-800 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
