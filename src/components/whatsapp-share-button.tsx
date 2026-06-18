"use client";

import type { MouseEvent } from "react";
import { MessageCircle } from "lucide-react";

/**
 * Shares free text to WhatsApp via the official wa.me deep link.
 * Renders as an anchor (real new-tab semantics + keyboard) so it can sit as a
 * sibling of clickable cards; `stopPropagation` keeps it from triggering a
 * surrounding card's click handler. Hebrew-first label, ≥44px touch target.
 */
export function WhatsAppShareButton({
  text,
  label = "שתף בוואטסאפ",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const href = `https://wa.me/?text=${encodeURIComponent(text)}`;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation();
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label={label}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-2 text-sm font-black text-white no-underline transition hover:bg-[#1da851] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1da851] ${className}`}
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}
