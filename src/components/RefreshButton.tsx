"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/digest", { method: "POST" });
      if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
    >
      {loading ? "Refreshing…" : "🔄 Refresh Now"}
    </button>
  );
}
