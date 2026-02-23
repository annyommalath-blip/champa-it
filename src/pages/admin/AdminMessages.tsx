import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft } from "lucide-react";

interface Conversation {
  id: string;
  guest_name: string;
  subject: string | null;
  status: string;
  updated_at: string;
  user_id: string | null;
}

interface Message {
  id: string;
  content: string;
  sender_type: string;
  sender_name: string | null;
  created_at: string;
}

export default function AdminMessages() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("chat_conversations").select("*").order("updated_at", { ascending: false })
      .then(({ data }) => setConversations((data as Conversation[]) || []));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const load = async () => {
      const { data } = await supabase.from("chat_messages").select("*")
        .eq("conversation_id", selected.id).order("created_at", { ascending: true });
      setMessages((data as Message[]) || []);
    };
    load();

    const channel = supabase
      .channel(`chat-${selected.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${selected.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selected]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !selected || !user) return;
    await supabase.from("chat_messages").insert({
      conversation_id: selected.id,
      content: input.trim(),
      sender_type: "admin",
      sender_id: user.id,
      sender_name: profile?.full_name || "Admin",
    });
    setInput("");
  };

  if (selected) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <p className="font-semibold text-sm">{selected.guest_name}</p>
            <p className="text-xs text-muted-foreground">{selected.subject || "No subject"}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                m.sender_type === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                <p className="text-[10px] font-medium mb-0.5 opacity-70">{m.sender_name}</p>
                <p>{m.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 pt-3 border-t border-border">
          <Input
            placeholder="Type a reply..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button onClick={send} size="icon"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground">{conversations.length} conversations</p>
      </div>

      <div className="space-y-3">
        {conversations.map((c) => (
          <Card key={c.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelected(c)}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{c.guest_name}</p>
                  <p className="text-xs text-muted-foreground">{c.subject || "No subject"}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {c.status}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(c.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {conversations.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No conversations yet.</p>
        )}
      </div>
    </div>
  );
}
