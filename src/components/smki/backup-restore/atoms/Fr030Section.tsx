import Card, { type CardProps } from "@/components/ui/Card";

export default function Fr030Section({ className = "", ...props }: CardProps) {
  return <Card {...props} hoverable={false} className={`rounded-2xl border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700 ${className}`} />;
}
