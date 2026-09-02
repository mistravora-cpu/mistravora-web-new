"use client";

import * as React from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { site } from "@/lib/site";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "How much does a website cost?",
  "What do you build?",
  "How do I contact you?",
];

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }
  }, [messages, loading, open]);

  async function send(content: string) {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

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
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content:
              data.error ??
              "Sorry — something went wrong. Reach us on WhatsApp at +94 77 330 6063 and we'll help right away.",
          },
        ]);
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "Connection hiccup — please try again, or message us on WhatsApp at +94 77 330 6063.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  return (
    <>
      {/* Floating buttons — stacked vertically, above sticky CTA on mobile */}
      <div className="fixed right-3 bottom-20 z-40 flex flex-col items-center gap-2 nav:bottom-5 nav:right-5">
        <a
          href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hi Mistravora! I'd like to discuss a project.")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Mistravora on WhatsApp"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring nav:h-12 nav:w-12"
        >
          <MessageCircle aria-hidden className="h-5 w-5 nav:h-6 nav:w-6" />
        </a>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close chat assistant" : "Open chat assistant"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-primary shadow-lg ring-1 ring-border transition-all duration-300 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring nav:h-12 nav:w-12"
        >
        {open ? (
          <X aria-hidden className="h-5 w-5" />
        ) : (
          <Bot aria-hidden className="h-5 w-5 animate-bounce-soft" />
        )}
        </button>
      </div>

      {open ? (
        <div className="animate-fade-in-up fixed bottom-36 right-3 z-40 flex h-[24rem] w-[20rem] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl nav:bottom-24 nav:right-5 nav:h-[26rem] nav:w-[21rem] nav:max-w-[calc(100vw-2.5rem)]">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-primary" />
            </span>
            <p className="text-sm font-semibold">Mistravora Assistant</p>
          </div>

          <div
            ref={listRef}
            aria-live="polite"
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 overscroll-contain"
          >
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <Bot aria-hidden className="h-8 w-8 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Ask me anything about our services, pricing, or process.
                </p>
                <div className="flex flex-col gap-1.5">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void send(prompt)}
                      className="ripple-click rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <p
                  key={index}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[85%] whitespace-pre-wrap rounded-xl bg-primary px-3 py-2 text-xs text-primary-foreground"
                      : "mr-auto max-w-[85%] whitespace-pre-wrap rounded-xl bg-muted px-3 py-2 text-xs"
                  }
                >
                  {message.content}
                </p>
              ))
            )}

            {loading ? (
              <p className="mr-auto rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                Thinking…
              </p>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border p-2"
          >
            <label htmlFor="chat-widget-input" className="sr-only">
              Message the assistant
            </label>
            <input
              id="chat-widget-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type a message…"
              maxLength={2000}
              className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 active:scale-90 disabled:opacity-50"
            >
              <Send aria-hidden className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
