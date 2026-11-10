import Button, { type ButtonProps } from "@/components/ui/Button";

export function Fr026Button({ className = "", variant = "success", type = "button", ...props }: ButtonProps) {
  return <Button {...props} type={type} variant={variant} className={`h-10 rounded-xl px-4 font-semibold ${className}`} />;
}
