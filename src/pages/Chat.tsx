import { useState, useEffect, useRef } from "react";
import { Send, Headphones, Plus, ArrowLeft, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

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

export default function ChatPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [guestName, setGuestName] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (user) {
        const { data } = await supabase
          .from("chat_conversations")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });
        if (data) setConversations(data as ConversationRow[]);
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!activeConvId) return;
    const load = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", activeConvId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    load();

    const channel = supabase
      .channel(`chat-${activeConvId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${activeConvId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConvId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
        content: `Hi ${name}! 👋 Welcome to Champa Support. An agent will be with you shortly.`,
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

  // Thread view
  if (activeConvId) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] md:max-w-3xl md:mx-auto animate-fade-in">
        <div className="px-5 py-4 border-b border-border/30 flex items-center gap-3">
          <button onClick={() => { setActiveConvId(null); setMessages([]); }} className="p-1.5 rounded-xl active:scale-90 transition-transform hover:bg-secondary/50">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
          </button>
          <div className="flex-1">
            <p className="text-[15px] font-bold text-foreground tracking-tight">Support Chat</p>
            <p className="text-[11px] text-muted-foreground/50 font-medium">Live Agent</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" style={{ animation: "pulse-soft 2s infinite" }} />
            <span className="text-[10px] text-success font-bold uppercase tracking-wider">Online</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_type === "guest" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-3 text-[15px] leading-relaxed ${
                msg.sender_type === "guest"
                  ? "bg-foreground text-background rounded-[20px] rounded-br-md"
                  : "bg-card rounded-[20px] rounded-bl-md text-foreground"
              }`}
              style={{ boxShadow: msg.sender_type === "admin" ? "var(--shadow-card)" : "none" }}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border/30 px-4 py-3.5 flex items-center gap-2.5">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-5 py-3 rounded-full bg-card text-[15px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors"
            style={{ boxShadow: "var(--shadow-card)" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-20 transition-all active:scale-90"
          >
            <Send className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="md:max-w-3xl md:mx-auto animate-fade-in">
      <div className="px-5 pt-5 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-foreground">Chat</h1>
          <p className="text-caption text-muted-foreground/60 mt-0.5">Talk to our sales & support team</p>
        </div>
        <button
          onClick={() => setShowNewChat(true)}
          className="w-11 h-11 rounded-2xl bg-foreground text-background flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {showNewChat && (
        <div className="px-5 pb-5 animate-scale-in">
          <div className="bento-card p-6 space-y-4">
            <p className="text-[16px] font-bold text-foreground tracking-tight">Start a new conversation</p>
            <input
              type="text"
              placeholder="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startNewChat()}
              className="input-field"
            />
            <div className="flex gap-2.5">
              <button onClick={() => setShowNewChat(false)} className="btn-secondary flex-1 py-3 text-[14px]">Cancel</button>
              <button onClick={startNewChat} className="btn-primary flex-1 py-3 text-[14px]">Start Chat</button>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pb-12">
        {conversations.length === 0 && !showNewChat ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto mb-6 mesh-gradient">
              <MessageCircle className="w-9 h-9 text-muted-foreground/20" strokeWidth={1.5} />
            </div>
            <p className="text-[18px] font-bold text-foreground mb-1.5 tracking-tight">No conversations yet</p>
            <p className="text-caption text-muted-foreground/60 mb-6">Start a chat with our support team</p>
            <button onClick={() => setShowNewChat(true)} className="btn-primary py-3 px-8 text-[14px]">
              New Chat
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv, idx) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className="bento-card w-full text-left p-5 flex items-center gap-4 active:scale-[0.98] transition-transform animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="w-11 h-11 rounded-2xl bg-secondary/60 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-foreground truncate tracking-tight">
                    {conv.subject || "Support Chat"}
                  </p>
                  <p className="text-[11px] text-muted-foreground/40 font-medium">
                    {conv.status === "active" ? "Active" : "Closed"} · {new Date(conv.updated_at).toLocaleDateString()}
                  </p>
                </div>
                {conv.status === "active" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-success shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
