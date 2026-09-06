"use client";

import { usePathname } from "next/navigation";
import { FormEvent, useState } from "react";
import { ThinkingOrb } from "thinking-orbs";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Ask about "today" on the home page, or the viewed day when browsing the archive
// (archive detail pages live at /archive/YYYY-MM-DD).
function useContextDate(): string | undefined {
  const pathname = usePathname();
  const match = pathname.match(/^\/archive\/(\d{4}-\d{2}-\d{2})$/);
  return match?.[1];
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const date = useContextDate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, date }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat request failed");
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: `⚠️ ${err instanceof Error ? err.message : "Something went wrong."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 rounded-full bg-foreground text-background w-14 h-14 text-2xl shadow-lg hover:opacity-90 transition"
        aria-label="Open chat"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-[min(24rem,calc(100vw-2.5rem))] h-[min(32rem,calc(100vh-6rem))] rounded-2xl border border-input bg-[var(--background)] shadow-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-input">
        <p className="font-medium text-sm">
          💬 Ask about {date ?? "today's"} brief
        </p>
        <button
          onClick={() => setOpen(false)}
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Ask me anything about today&apos;s weather, news, markets, sports, or anything
            else on your mind.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-foreground text-background px-3 py-2 text-sm"
                : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-foreground/[.06] px-3 py-2 text-sm whitespace-pre-wrap"
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="mr-auto flex items-center gap-2 max-w-[85%] rounded-2xl rounded-bl-sm bg-foreground/[.06] px-3 py-2 text-sm text-muted-foreground">
            <ThinkingOrb state="composing" size={20} aria-label="Thinking" />
            Thinking…
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-full border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
