"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/digest", { method: "POST" });
      if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
      router.refresh();
    } catch (err) {
      // window.alert() blocks the page and cannot be styled or dismissed by
      // keyboard in a predictable place. The message belongs next to the
      // control that produced it, announced politely.
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        {/* The icon spins only while the request is in flight, so the motion
            IS the loading state -- MASTER exempts .animate-spin from the
            reduced-motion clamp for exactly this reason. */}
        <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
        {loading ? "Refreshing\u2026" : "Refresh now"}
      </button>
      <p role="status" aria-live="polite" className="min-h-0 text-xs text-[var(--num-down)]">
        {error}
      </p>
    </div>
  );
}
