"use client";

export default function SectionTitle({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <h3
      className={`text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest ${className}`}
    >
      {title}
    </h3>
  );
}
export { SectionTitle };
