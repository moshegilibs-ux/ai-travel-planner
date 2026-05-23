"use client";

import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Mic, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const suggestedPrompts = [
  "תכנן לנו טיול נגיש ליוון ל-5 ימים עם סבתא בכיסא גלגלים",
  "מצא מלון נגיש בפריז עם מעלית ומרחקי הליכה קצרים",
  "בנה חופשה משפחתית רגועה עם ילדים וסבא וסבתא",
  "מה הסיכונים בנגישות במסלול הזה?",
];

export function AiChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "שלום, אני העוזר החכם של טיולים וחלומות. ספרו לי יעד, תקציב, תאריכים וצרכי נגישות, ואבנה מסלול רגוע שמתאים לכל המשפחה.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 2 && !isStreaming,
    [input, isStreaming],
  );

  async function sendMessage(value = input) {
    const message = value.trim();

    if (!message || isStreaming) {
      return;
    }

    setInput("");
    setIsStreaming(true);
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ];
    setMessages(nextMessages);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: messages.slice(-8),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("AI assistant unavailable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value: chunk } = await reader.read();

        if (done) {
          break;
        }

        assistantText += decoder.decode(chunk, { stream: true });
        setMessages((current) => {
          const copy = [...current];
          copy[copy.length - 1] = {
            role: "assistant",
            content: assistantText,
          };
          return copy;
        });
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("העוזר החכם לא זמין כרגע, מציג הנחיית fallback.");
        setMessages((current) => {
          const copy = [...current];
          copy[copy.length - 1] = {
            role: "assistant",
            content:
              "לא הצלחתי להתחבר לשירות ה-AI כרגע. נסו למשל: **תכנן לנו טיול נגיש ליוון ל-5 ימים עם סבתא בכיסא גלגלים**.",
          };
          return copy;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }

  const panel = (
    <div className="flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-black text-slate-950 dark:text-white">
              עוזר AI נגיש
            </h2>
            <p className="text-xs text-slate-500">
              טיסות, מלונות, קצב רגוע, נגישות וסיכונים
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <motion.div
            key={`${message.role}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-7 ${
              message.role === "user"
                ? "mr-auto bg-slate-950 text-white dark:bg-emerald-500 dark:text-slate-950"
                : "ml-auto bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-100"
            }`}
          >
            <div className="prose prose-sm max-w-none text-right dark:prose-invert">
              <ReactMarkdown>{message.content || "כותב..."}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
        {isStreaming ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 dark:bg-white/10">
            <Sparkles className="h-3 w-3 animate-pulse" />
            בודק נגישות ומסלול רגוע
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-200 p-4 dark:border-white/10">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="shrink-0 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-white/10 dark:text-slate-200"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
          className="flex items-end gap-2"
        >
          <button
            type="button"
            onClick={() => toast.info("מקום שמור לקלט קולי בהמשך.")}
            className="rounded-2xl border border-slate-200 p-3 text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
          >
            <Mic className="h-5 w-5" />
          </button>
          <textarea
            className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-white/10 dark:bg-slate-950 dark:focus:ring-emerald-500/20"
            onChange={(event) => setInput(event.target.value)}
            placeholder="בקשו ממני לתכנן טיול נגיש לכל המשפחה..."
            value={input}
          />
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-2xl bg-slate-950 p-3 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-emerald-500 dark:text-slate-950"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden h-[720px] md:block">{panel}</div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-4 z-50 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-4 font-bold text-white shadow-2xl md:hidden dark:bg-emerald-500 dark:text-slate-950"
      >
        <Bot className="h-5 w-5" />
        עוזר נגיש
      </button>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/50 p-3 backdrop-blur md:hidden"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="h-full"
            >
              {panel}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
