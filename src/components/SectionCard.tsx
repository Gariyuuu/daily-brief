import { ReactNode } from "react";
import { Section } from "@/lib/types";

export function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-input bg-black/[.02] dark:bg-white/[.03] p-5">
      <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
        <span aria-hidden>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

// Renders a friendly "not ready" message for a section that has no data,
// distinguishing "add an API key" from "the upstream request failed".
export function Unavailable({ section }: { section: Section<unknown> }) {
  if (section.ok) return null;
  return (
    <p className="text-sm text-black/50 dark:text-white/50">
      {section.reason === "missing_key" ? "⚙️ " : "⚠️ "}
      {section.message}
    </p>
  );
}
