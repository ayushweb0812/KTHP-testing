"use client";

import Link, { LinkProps } from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React from "react";

interface TransitionLinkProps extends Omit<LinkProps, "href"> {
  children: React.ReactNode;
  href: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function TransitionLink({ children, href, className, onClick, ...props }: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If it's a modifier key or right click, let the browser handle it natively
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    
    // If it's an anchor link on the same page, do not animate
    if (href?.startsWith("#") || href?.includes("#")) {
      if (onClick) onClick(e);
      return;
    }
    
    e.preventDefault();
    if (onClick) onClick(e);

    // If we're already on the destination page, just scroll to top
    if (pathname === href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Trigger the exit animation defined in template.tsx
    window.dispatchEvent(new CustomEvent("page-exit"));

    // Wait for the exit animation duration (800ms) before changing the route
    setTimeout(() => {
      router.push(href);
    }, 800);
  };

  return (
    <Link href={href} onClick={handleTransition} className={className} {...props}>
      {children}
    </Link>
  );
}
