import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, X, Plus, Headphones, MessageCircle } from "lucide-react";
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

export default function ChatWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [guestName, setGuestName] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load greeting once
  useEffect(() => {
    supabase.from("settings").select("value").eq("key", "chat_greeting").maybeSingle().then(({ data }) => {
      const v = (data?.value as any);
      if (typeof v === "string" && v.trim()) setGreeting(v);
    });
  }, []);

  // Load conversations when opened
  useEffect(() => {
    if (!open) return;
    if (user) {
      supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .then(({ data }) => { if (data) setConversations(data as ConversationRow[]); });
    } else {
      setConversations([]);
      setShowNewChat(true);
    }
  }, [open, user]);

  // Load messages + subscribe to realtime for active conversation
  useEffect(() => {
    if (!activeConvId) return;
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

  useEffect(() => { if (open && activeConvId) inputRef.current?.focus(); }, [open, activeConvId]);

  const startNewChat = async () => {
    const name = guestName.trim() || (user?.email?.split("@")[0] ?? "Guest");
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ guest_name: name, user_id: user?.id || null })
      .select()
      .single();
    if (data && !error) {
      setActiveConvId(data.id);
      setConversations((prev) => [data as ConversationRow, ...prev]);
      setShowNewChat(false);
      setGuestName("");
      await supabase.from("chat_messages").insert({
        conversation_id: data.id,
        sender_type: "admin",
        content: greeting.replace(/\{name\}/gi, name),
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConvId) return;
    const content = input.trim();
    setInput("");
    await supabase.from("chat_messages").insert({
      conversation_id: activeConvId,
      sender_type: "guest",
      content,
    });
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-foreground/20 backdrop-blur-[2px] animate-fade-in"
      />
      {/* Panel */}
      <div className="fixed z-[61] animate-scale-in bg-background shadow-2xl flex flex-col
        inset-x-3 bottom-3 top-14 rounded-[24px]
        md:inset-auto md:right-6 md:bottom-6 md:top-auto md:left-auto md:w-[400px] md:h-[600px]
        overflow-hidden border border-border/40">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2.5 bg-card/60">
          {activeConvId ? (
            <button onClick={() => { setActiveConvId(null); setMessages([]); }} className="p-1.5 rounded-xl active:scale-90 hover:bg-secondary/60">
              <ArrowLeft className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
            </button>
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <Headphones className="w-4.5 h-4.5 text-primary" strokeWidth={2} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-foreground tracking-tight leading-tight">Champa Support</p>
            <p className="text-[10px] text-success font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> Online now
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl active:scale-90 hover:bg-secondary/60">
            <X className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        {activeConvId ? (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 bg-background">
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
            <div className="border-t border-border/40 px-3 py-2.5 flex items-center gap-2 bg-card/40">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border/40 text-[14px] focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 active:scale-90 transition-all"
              >
                <Send className="w-4 h-4" strokeWidth={2.2} />
              </button>
            </div>
          </>
        ) : showNewChat ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <p className="text-[15px] font-bold text-foreground tracking-tight mb-1">Start a conversation</p>
              <p className="text-[12px] text-muted-foreground">Our team typically replies within a few minutes.</p>
            </div>
            <input
              type="text"
              placeholder="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startNewChat()}
              className="input-field"
              autoFocus
            />
            <div className="flex gap-2">
              {user && (
                <button onClick={() => setShowNewChat(false)} className="btn-secondary flex-1 py-2.5 text-[13px]">Cancel</button>
              )}
              <button onClick={startNewChat} className="btn-primary flex-1 py-2.5 text-[13px]">Start Chat</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <button
              onClick={() => setShowNewChat(true)}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                <Plus className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="text-left flex-1">
                <p className="text-[14px] font-bold text-foreground">New conversation</p>
                <p className="text-[11px] text-muted-foreground">Send us a message</p>
              </div>
            </button>
            {conversations.length === 0 ? (
              <div className="text-center py-10">
                <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[13px] text-muted-foreground">No conversations yet</p>
              </div>
            ) : conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className="w-full text-left p-3 rounded-2xl hover:bg-secondary/60 flex items-center gap-3 active:scale-[0.98] transition-transform"
              >
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{conv.subject || "Support Chat"}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {conv.status === "active" ? "Active" : "Closed"} · {new Date(conv.updated_at).toLocaleDateString()}
                  </p>
                </div>
                {conv.status === "active" && <div className="w-2 h-2 rounded-full bg-success shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
