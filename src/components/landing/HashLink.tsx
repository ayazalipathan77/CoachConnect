'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';

type Props = ComponentProps<typeof Link>;

/** Smooth-scrolls to the target id without waiting on a retry loop elsewhere. */
function scrollToHash(hash: string, attempt = 0) {
  const el = document.getElementById(hash);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (attempt < 20) {
    // Section may still be laying out (images, scroll-jacking sections above
    // it) — retry across a few frames instead of giving up after one.
    requestAnimationFrame(() => scrollToHash(hash, attempt + 1));
  }
}

/**
 * `<Link href="/#section">` only reliably scrolls when navigating from a
 * *different* route — clicking it while already on that page does nothing
 * because the URL (and therefore the hash) doesn't change, so Next never
 * re-runs its scroll-into-view logic. This intercepts that same-page case
 * and scrolls manually; cross-page navigation still goes through Link as
 * normal and is picked up by `HashScrollOnMount` on the destination page.
 */
export function HashLink({ href, onClick, ...props }: Props) {
  const pathname = usePathname();
  const hrefStr = typeof href === 'string' ? href : (href.pathname ?? '/') + (href.hash ?? '');
  const [path, hash] = hrefStr.split('#');
  const targetPath = path || '/';

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (hash && pathname === targetPath) {
      e.preventDefault();
      scrollToHash(hash);
    }
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}
