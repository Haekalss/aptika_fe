import Button, { type ButtonProps } from "@/components/ui/Button";

export function Fr025Button({ className = "", variant = "success", type = "button", ...props }: ButtonProps) {
  return <Button {...props} type={type} variant={variant} className={`rounded-xl ${className}`} />;
}
