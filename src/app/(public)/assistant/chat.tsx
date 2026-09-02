"use client";

import * as React from "react";
import Link from "next/link";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "What does Mistravora build?",
  "How much does a website cost?",
  "How long does a project take?",
];

export function Chat() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, loading]);

  async function send(content: string) {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput("");
    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok || !data.reply) {
        setError(
          data.error ??
            "The assistant is unavailable — please use WhatsApp or the contact form."
        );
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div
        ref={listRef}
        aria-live="polite"
        className="flex h-96 flex-col gap-4 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <Bot aria-hidden className="h-10 w-10 text-primary" />
            <p className="max-w-xs text-sm text-muted-foreground">
              Hi! I can answer questions about Mistravora&apos;s services,
              pricing, and process. Try one of these:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void send(prompt)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === "user"
                  ? "flex items-start justify-end gap-2"
                  : "flex items-start gap-2"
              }
            >
              {message.role === "assistant" ? (
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot aria-hidden className="h-4 w-4 text-primary" />
                </span>
              ) : null}
              <p
                className={
                  message.role === "user"
                    ? "max-w-[80%] whitespace-pre-wrap rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                    : "max-w-[80%] whitespace-pre-wrap rounded-xl bg-muted px-4 py-2.5 text-sm"
                }
              >
                {message.content}
              </p>
              {message.role === "user" ? (
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User aria-hidden className="h-4 w-4 text-muted-foreground" />
                </span>
              ) : null}
            </div>
          ))
        )}

        {loading ? (
          <div className="flex items-start gap-2">
            <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot aria-hidden className="h-4 w-4 text-primary" />
            </span>
            <p className="rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
              Thinking…
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-4 py-3"
        >
          <p className="text-sm text-red-500">{error}</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <label htmlFor="chat-input" className="sr-only">
          Message the assistant
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about services, pricing, timelines…"
          maxLength={2000}
          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()}>
          <Send aria-hidden className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
