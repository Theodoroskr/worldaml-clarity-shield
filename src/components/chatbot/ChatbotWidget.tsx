import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { findBestMatch } from "@/data/chatbotKnowledge";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "bot" | "user";
  text: string;
  link?: string;
}

const quickActions = [
  { label: "Request a Demo", message: "I'd like to request a demo" },
  { label: "View Pricing", message: "What are your pricing plans?" },
  { label: "Free AML Check", message: "Can I run a free AML check?" },
  { label: "Talk to Sales", message: "I want to talk to sales" },
];

const WELCOME_MESSAGE: Message = {
  role: "bot",
  text: "Hi there! 👋 I'm the WorldAML assistant. How can I help you today? You can ask about our products, pricing, or request a demo.",
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSend = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;

    const userMsg: Message = { role: "user", text: msg };
    const { answer, link } = findBestMatch(msg);
    const botMsg: Message = { role: "bot", text: answer, link };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex w-[350px] max-sm:w-[calc(100vw-2rem)] max-sm:right-4 max-sm:bottom-4 flex-col rounded-xl border border-border bg-background shadow-2xl overflow-hidden"
          style={{ height: 460 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <span className="text-sm font-semibold">WorldAML Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef as any}>
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.text}
                    {m.link && (
                      <button
                        onClick={() => {
                          navigate(m.link!);
                          setOpen(false);
                        }}
                        className="mt-2 flex items-center gap-1 text-xs font-medium text-primary underline underline-offset-2"
                      >
                        Learn more <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Quick actions (show only when just welcome message) */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {quickActions.map((qa) => (
                    <button
                      key={qa.label}
                      onClick={() => handleSend(qa.message)}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-border px-3 py-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question..."
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button size="icon" variant="ghost" onClick={() => handleSend()} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
