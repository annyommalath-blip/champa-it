import { useState, useEffect, useRef } from "react";
import { Send, Headphones, Plus } from "lucide-react";
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

  // Load conversations
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

  // Load messages for active conv
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

  // Chat thread view
  if (activeConvId) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] md:max-w-3xl md:mx-auto">
        {/* Thread header */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
          <button onClick={() => { setActiveConvId(null); setMessages([]); }} className="text-caption font-medium text-primary">
            ← Back
          </button>
          <div className="flex-1">
            <p className="text-body font-semibold text-foreground">Support Chat</p>
            <p className="text-micro text-muted-foreground">Live Agent</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_type === "guest" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 text-body leading-relaxed ${
                msg.sender_type === "guest"
                  ? "bg-foreground text-background rounded-[18px] rounded-br-md"
                  : "bg-card border border-border rounded-[18px] rounded-bl-md text-foreground"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-border px-4 py-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-2.5 rounded-full bg-card border border-border text-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 transition-all active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Chat list view
  return (
    <div className="md:max-w-3xl md:mx-auto">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-page-title text-foreground">Chat</h1>
          <p className="text-caption text-muted-foreground mt-0.5">Talk to our sales & support team</p>
        </div>
        <button
          onClick={() => setShowNewChat(true)}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-90 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* New chat prompt */}
      {showNewChat && (
        <div className="px-5 pb-4 animate-fade-in">
          <div className="app-card p-5 space-y-3">
            <p className="text-body font-semibold text-foreground">Start a new conversation</p>
            <input
              type="text"
              placeholder="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startNewChat()}
              className="input-field"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowNewChat(false)} className="btn-secondary flex-1 py-2.5 text-caption">Cancel</button>
              <button onClick={startNewChat} className="btn-primary flex-1 py-2.5 text-caption">Start Chat</button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation list */}
      <div className="px-5 pb-8">
        {conversations.length === 0 && !showNewChat ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-body font-medium text-foreground mb-1">No conversations yet</p>
            <p className="text-caption text-muted-foreground mb-5">Start a chat with our support team</p>
            <button onClick={() => setShowNewChat(true)} className="btn-primary py-2.5 px-6 text-caption">
              New Chat
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className="app-card-interactive w-full text-left p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-semibold text-foreground truncate">
                    {conv.subject || "Support Chat"}
                  </p>
                  <p className="text-micro text-muted-foreground">
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
