import Link from "next/link";
import type { ComponentProps } from "react";

export function Fr025Link(props: ComponentProps<typeof Link>) {
  return <Link {...props} scroll={false} />;
}
