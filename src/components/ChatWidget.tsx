import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, Headphones, Archive, MessageCircle } from "lucide-react";
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
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [guestName, setGuestName] = useState("");
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState<"home" | "history" | "chat">("home");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = (profile?.full_name?.trim() || user?.email?.split("@")[0] || "").trim();

  useEffect(() => {
    supabase.from("settings").select("value").eq("key", "chat_greeting").maybeSingle().then(({ data }) => {
      const v = data?.value as any;
      if (typeof v === "string" && v.trim()) setGreeting(v);
    });
  }, []);

  const loadConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) setConversations(data as ConversationRow[]);
  };

  // On open: load user's history, auto-resume most-recent active
  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      const list = (data as ConversationRow[]) || [];
      setConversations(list);
      const activeOne = list.find((c) => c.status === "active");
      if (activeOne) { setActiveConvId(activeOne.id); setView("chat"); }
      else setView("home");
    })();
  }, [open, user]);

  // Load + subscribe messages for active conversation
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
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_conversations", filter: `id=eq.${activeConvId}` },
        (payload) => {
          const next = payload.new as ConversationRow;
          setConversations((prev) => prev.map((c) => c.id === next.id ? next : c));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => { if (open && view === "chat") inputRef.current?.focus(); }, [open, view, activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;
  const isClosed = activeConv?.status === "closed";

  const ensureConversation = async (): Promise<string | null> => {
    if (activeConvId && !isClosed) return activeConvId;
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
    const row = data as ConversationRow;
    setActiveConvId(row.id);
    setConversations((prev) => [row, ...prev]);
    setView("chat");
    await supabase.from("chat_messages").insert({
      conversation_id: row.id,
      sender_type: "admin",
      content: greeting.replace(/\{name\}/gi, name),
    });
    return row.id;
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
    if (!input.trim() || isClosed) return;
    const text = input;
    setInput("");
    await sendText(text);
  };

  const handleQuickReply = async (text: string) => {
    await sendText(text);
  };

  const handleCloseChat = async () => {
    if (!activeConvId) return;
    const ok = window.confirm("End this chat and move it to your archive?");
    if (!ok) return;
    await supabase.from("chat_conversations").update({ status: "closed" }).eq("id", activeConvId);
    setConversations((prev) => prev.map((c) => c.id === activeConvId ? { ...c, status: "closed" } : c));
    setActiveConvId(null);
    setView("home");
    loadConversations();
  };

  const openConversation = (id: string) => { setActiveConvId(id); setView("chat"); };

  if (!open) return null;

  const needsGuestName = !user && view !== "chat" && !guestName.trim();
  const greetName = user ? (displayName || "there") : (guestName.trim() || "there");
  const canSend = !!input.trim() && (user || guestName.trim()) && !creating && !isClosed;

  const activeConvs = conversations.filter((c) => c.status === "active");
  const archivedConvs = conversations.filter((c) => c.status !== "active");

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-[2px] animate-fade-in" />
      <div className="fixed z-[61] animate-scale-in bg-background shadow-2xl flex flex-col
        inset-x-3 bottom-3 top-14 rounded-[24px]
        md:inset-auto md:right-6 md:bottom-6 md:top-auto md:left-auto md:w-[400px] md:h-[620px]
        overflow-hidden border border-border/40">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border/40 flex items-center gap-2.5 bg-card/60">
          {view !== "home" && (
            <button
              onClick={() => { setView("home"); setActiveConvId(null); }}
              className="p-1.5 rounded-xl active:scale-90 hover:bg-secondary/60"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-extrabold text-foreground tracking-tight leading-none">
              {view === "history" ? "Chat History" : "Champa Support"}
            </p>
            {view !== "history" && (
              <p className="text-[11px] text-success font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> Online now
              </p>
            )}
          </div>
          {view === "chat" && !isClosed && (
            <button
              onClick={handleCloseChat}
              className="text-[13px] font-semibold text-muted-foreground hover:text-foreground px-2 py-1"
              title="End chat"
            >
              End chat
            </button>
          )}
          <button onClick={onClose} className="text-[15px] font-semibold text-primary hover:opacity-80">
            Close
          </button>
        </div>

        {/* HOME view */}
        {view === "home" && (
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-background">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Headphones className="w-[22px] h-[22px] text-primary" strokeWidth={2} />
              </div>
              <p className="text-[22px] font-extrabold text-foreground leading-tight tracking-[-0.01em]">
                Hi{greetName !== "there" ? `, ${greetName}` : ""}! How can I help you?
              </p>
            </div>

            <div className="flex flex-col items-start gap-2.5 pt-1">
              {QUICK_REPLIES.map((label) => (
                <button
                  key={label}
                  onClick={() => handleQuickReply(label)}
                  disabled={needsGuestName || creating}
                  className="px-5 py-3 rounded-2xl border border-border bg-card text-[15px] font-bold text-foreground tracking-tight hover:bg-secondary/60 active:scale-[0.97] transition-all disabled:opacity-40 shadow-sm"
                >
                  {label}
                </button>
              ))}
            </div>

            {user && conversations.length > 0 && (
              <button
                onClick={() => setView("history")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-secondary/40 hover:bg-secondary/60 transition-colors active:scale-[0.98] mt-2"
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.8} />
                  <span className="text-[14px] font-semibold text-foreground">Chat history</span>
                </div>
                <span className="text-[12px] text-muted-foreground">{conversations.length}</span>
              </button>
            )}

            <p className="text-[12px] text-muted-foreground leading-relaxed pt-2">
              Your conversation may be recorded for quality assurance. By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        )}

        {/* HISTORY view */}
        {view === "history" && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-background">
            {conversations.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle className="w-9 h-9 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[13px] text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <>
                {activeConvs.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] mb-2 px-1">Active</p>
                    <div className="space-y-2">
                      {activeConvs.map((c) => (
                        <ConvRow key={c.id} conv={c} onClick={() => openConversation(c.id)} />
                      ))}
                    </div>
                  </div>
                )}
                {archivedConvs.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] mb-2 px-1">Archived</p>
                    <div className="space-y-2">
                      {archivedConvs.map((c) => (
                        <ConvRow key={c.id} conv={c} onClick={() => openConversation(c.id)} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CHAT view */}
        {view === "chat" && (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3 bg-background">
              {isClosed && (
                <div className="text-center text-[11px] text-muted-foreground bg-secondary/40 rounded-full py-1.5 px-3 mx-auto w-fit font-medium">
                  This conversation was closed and moved to your archive
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === "guest" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 text-[15px] leading-relaxed ${
                    msg.sender_type === "guest"
                      ? "bg-foreground text-background rounded-[20px] rounded-br-md font-medium"
                      : "bg-card border border-border/40 rounded-[20px] rounded-bl-md text-foreground"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer input — hidden on history */}
        {view !== "history" && (
          <div className="border-t border-border/40 px-3 py-2.5 bg-card/40 space-y-2">
            {!user && view === "home" && (
              <input
                type="text"
                placeholder="Your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-[15px] font-medium focus:outline-none focus:border-primary/50"
              />
            )}
            <div className="flex items-stretch gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  isClosed ? "This chat is archived. Start a new one." :
                  needsGuestName ? "Enter your name to chat" : "Ask our team…"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                disabled={needsGuestName || isClosed}
                className="flex-1 px-5 py-3 rounded-2xl bg-background border border-border text-[15px] font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/50 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!canSend}
                className="w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 active:scale-95 transition-all shrink-0"
                aria-label="Send"
              >
                <Send className="w-[18px] h-[18px]" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ConvRow({ conv, onClick }: { conv: ConversationRow; onClick: () => void }) {
  const isActive = conv.status === "active";
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3.5 rounded-2xl border border-border/50 bg-card hover:bg-secondary/40 flex items-center gap-3 active:scale-[0.98] transition-all"
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isActive ? "bg-success/15" : "bg-secondary"}`}>
        {isActive ? (
          <Headphones className="w-4 h-4 text-success" strokeWidth={2} />
        ) : (
          <Archive className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-foreground truncate tracking-tight">{conv.subject || "Support Chat"}</p>
        <p className="text-[11px] text-muted-foreground">
          {isActive ? "Active" : "Archived"} · {new Date(conv.updated_at).toLocaleDateString()}
        </p>
      </div>
      {isActive && <div className="w-2 h-2 rounded-full bg-success shrink-0" />}
    </button>
  );
}
