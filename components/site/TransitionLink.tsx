"use client";

import Link, { LinkProps } from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { pushGtmEvent } from "@/lib/analytics/gtm";
import { useTransition } from "@/components/transitions/TransitionContext";

interface TransitionLinkProps extends Omit<LinkProps, "href"> {
  children: React.ReactNode;
  href: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function TransitionLink({ children, href, className, onClick, ...props }: TransitionLinkProps) {
  const pathname = usePathname();
  const { beginPageTransition } = useTransition();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If it's a modifier key or right click, let the browser handle it natively
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    
    // If it's an anchor link on the same page, do not animate
    if (href?.startsWith("#") || href?.includes("#")) {
      if (onClick) onClick(e);
      return;
    }
    
    if (onClick) onClick(e);

    if (href === "/reserve" || href.startsWith("/book")) {
      pushGtmEvent("reserve_click", { link_url: href });
    }

    // If we're already on the destination page, just scroll to top
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Trigger the new global transition
    beginPageTransition();
  };

  return (
    <Link href={href} onClick={handleTransition} className={className} {...props}>
      {children}
    </Link>
  );
}
