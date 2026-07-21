import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, X, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  content: string;
  sender_type: "guest" | "admin";
  created_at: string;
}

interface ConversationRow {
  id: string;
  guest_name: string;
  status: string;
  updated_at: string;
  subject: string | null;
}

const DEFAULT_GREETING = "Hi {name}! 👋 Welcome to Champa Support. An agent will be with you shortly.";

const QUICK_REPLIES = [
  "Shopping for a product",
  "Recent orders",
  "Repairs and tech support",
  "Get a quote",
];

export default function ChatWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, profile } = useAuth();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [guestName, setGuestName] = useState("");
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const [creating, setCreating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = (profile?.full_name?.trim() || user?.email?.split("@")[0] || "").trim();

  // Load greeting
  useEffect(() => {
    supabase.from("settings").select("value").eq("key", "chat_greeting").maybeSingle().then(({ data }) => {
      const v = data?.value as any;
      if (typeof v === "string" && v.trim()) setGreeting(v);
    });
  }, []);

  // Resume most-recent active conversation for logged-in users
  useEffect(() => {
    if (!open || !user) return;
    supabase
      .from("chat_conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data?.id) setActiveConvId(data.id); });
  }, [open, user]);

  // Load + subscribe to messages
  useEffect(() => {
    if (!activeConvId) { setMessages([]); return; }
    supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", activeConvId)
      .order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setMessages(data as Message[]); });

    const channel = supabase
      .channel(`chat-widget-${activeConvId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${activeConvId}` },
        (payload) => setMessages((prev) => {
          const next = payload.new as Message;
          if (prev.some((m) => m.id === next.id)) return prev;
          return [...prev, next];
        })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open, activeConvId]);

  const ensureConversation = async (): Promise<string | null> => {
    if (activeConvId) return activeConvId;
    const name = user ? (displayName || "Customer") : guestName.trim();
    if (!name) return null;
    setCreating(true);
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ guest_name: name, user_id: user?.id || null })
      .select()
      .single();
    setCreating(false);
    if (error || !data) return null;
    setActiveConvId(data.id);
    await supabase.from("chat_messages").insert({
      conversation_id: data.id,
      sender_type: "admin",
      content: greeting.replace(/\{name\}/gi, name),
    });
    return data.id;
  };

  const sendText = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const convId = await ensureConversation();
    if (!convId) return;
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      sender_type: "guest",
      content: trimmed,
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    await sendText(text);
  };

  const handleQuickReply = async (text: string) => {
    await sendText(text);
  };

  if (!open) return null;

  const needsGuestName = !user && !activeConvId && !guestName.trim();
  const showWelcome = !activeConvId || messages.length === 0;
  const greetName = user ? (displayName || "there") : (guestName.trim() || "there");
  const canSend = input.trim() && (user || guestName.trim()) && !creating;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-[2px] animate-fade-in" />
      <div className="fixed z-[61] animate-scale-in bg-background shadow-2xl flex flex-col
        inset-x-3 bottom-3 top-14 rounded-[24px]
        md:inset-auto md:right-6 md:bottom-6 md:top-auto md:left-auto md:w-[400px] md:h-[620px]
        overflow-hidden border border-border/40">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2.5 bg-card/60">
          {activeConvId && (
            <button
              onClick={() => { setActiveConvId(null); setMessages([]); }}
              className="p-1.5 rounded-xl active:scale-90 hover:bg-secondary/60"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-foreground tracking-tight leading-tight">Champa Support</p>
            <p className="text-[10px] text-success font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> Online now
            </p>
          </div>
          <button onClick={onClose} className="text-[13px] font-semibold text-primary hover:opacity-80 px-2 py-1">
            Close
          </button>
        </div>

        {/* Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-background">
          {showWelcome && (
            <div className="flex items-start gap-3 pb-1">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-primary" strokeWidth={2} />
              </div>
              <p className="text-[17px] font-bold text-foreground leading-snug tracking-tight pt-1.5">
                Hi{greetName !== "there" ? `, ${greetName}` : ""}! How can I help you?
              </p>
            </div>
          )}

          {showWelcome && (
            <div className="flex flex-col items-start gap-2 pl-[52px]">
              {QUICK_REPLIES.map((label) => (
                <button
                  key={label}
                  onClick={() => handleQuickReply(label)}
                  disabled={needsGuestName || creating}
                  className="px-4 py-2.5 rounded-full border border-border bg-card text-[14px] font-semibold text-foreground hover:bg-secondary/60 active:scale-[0.97] transition-all disabled:opacity-40"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_type === "guest" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3.5 py-2.5 text-[14px] leading-relaxed ${
                msg.sender_type === "guest"
                  ? "bg-foreground text-background rounded-[18px] rounded-br-md"
                  : "bg-card border border-border/40 rounded-[18px] rounded-bl-md text-foreground"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: guest name (if needed) + input */}
        <div className="border-t border-border/40 px-3 py-2.5 bg-card/40 space-y-2">
          {showWelcome && (
            <p className="text-[11px] text-muted-foreground px-1 leading-relaxed">
              Your conversation may be recorded for quality assurance.
            </p>
          )}
          {!user && !activeConvId && (
            <input
              type="text"
              placeholder="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-background border border-border/40 text-[13px] focus:outline-none focus:border-primary/50"
            />
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={needsGuestName ? "Enter your name to chat" : "Ask our team…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              disabled={needsGuestName}
              className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border/40 text-[14px] focus:outline-none focus:border-primary/50 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 active:scale-90 transition-all shrink-0"
              aria-label="Send"
            >
              <Send className="w-4 h-4" strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
