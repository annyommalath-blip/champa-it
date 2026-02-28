import { useState, useEffect, useRef } from "react";
import { X, Send, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  sender_type: "guest" | "admin";
  created_at: string;
}

export default function ChatPopup({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startChat = async () => {
    const name = guestName.trim() || "Guest";
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ guest_name: name })
      .select()
      .single();
    if (data && !error) {
      setConversationId(data.id);
      setStarted(true);
      await supabase.from("chat_messages").insert({
        conversation_id: data.id,
        sender_type: "admin",
        content: `Hi ${name}! 👋 Welcome to Champa Support. An agent will be with you shortly.`,
      });
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;
    const content = input.trim();
    setInput("");
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      sender_type: "guest",
      content,
    });
  };

  return (
    <div className="fixed bottom-24 right-4 z-[60] w-[calc(100%-2rem)] max-w-sm animate-fade-in md:right-8 md:bottom-8">
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: "420px" }}>
        {/* Header — neutral, not yellow */}
        <div className="bg-foreground px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-background/15 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-background" />
            </div>
            <div>
              <span className="text-caption font-semibold text-background block leading-tight">Champa Support</span>
              <span className="text-micro text-background/60">Live Agent</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background/10 transition-colors">
            <X className="w-4 h-4 text-background" />
          </button>
        </div>

        {!started ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <Headphones className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h4 className="text-body font-semibold text-foreground">Start Live Chat</h4>
              <p className="text-caption text-muted-foreground mt-1">Enter your name to connect with an agent</p>
            </div>
            <input
              type="text"
              placeholder="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startChat()}
              className="input-field"
            />
            <button onClick={startChat} className="btn-primary w-full">
              Start Chat
            </button>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === "guest" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-caption leading-relaxed ${
                    msg.sender_type === "guest"
                      ? "bg-foreground text-background rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-secondary border-none text-caption text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button onClick={sendMessage} disabled={!input.trim()} className="p-2.5 rounded-xl bg-foreground text-background disabled:opacity-30 transition-all active:scale-90">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
