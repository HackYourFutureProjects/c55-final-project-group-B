"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// A header link that marks itself as the current page for assistive tech and
// for the `[aria-current="page"]` style in site-header.module.css.
export default function NavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isCurrent = pathname === href;

  return (
    <Link
      href={href}
      className={className}
      aria-current={isCurrent ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
