import { useState, useRef, useEffect } from "react";
import { Send, Clock, MessageCircle, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export default function ContactPage() {
  const { addNotification, addMessage, addConversation, guestId, conversations } = useApp();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div>
      <section className="hero-section border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-14 md:py-18 md:px-8 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Sales</h1>
          <p className="text-muted-foreground text-lg">Get in touch with our team. We typically respond within 1 hour.</p>
        </div>
      </section>

      <div className="section-padding">
        <div className="max-w-2xl mx-auto">
          <ContactForm onSubmit={(data) => {
            addNotification({ type: "contact_sales", title: "Sales Request Sent", message: `Your contact request has been submitted. Our team will reach out to ${data.name} soon.`, referenceId: "form-" + Date.now() });
            toast.success("Your message has been sent! Our team will reach out soon.");
          }} />
        </div>
      </div>

      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg z-40"
          style={{ animation: "pulse-glow 2s infinite" }}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {chatOpen && (
        <ChatWidget
          onClose={() => setChatOpen(false)}
          guestId={guestId}
          conversations={conversations}
          addConversation={addConversation}
          addMessage={addMessage}
          addNotification={addNotification}
        />
      )}
    </div>
  );
}

function ContactForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "", preferredContactTime: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Please fill in required fields"); return; }
    onSubmit(form);
    setForm({ name: "", email: "", phone: "", company: "", message: "", preferredContactTime: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="tech-card p-6 md:p-8 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { key: "name", label: "Name", type: "text", required: true },
          { key: "email", label: "Email", type: "email", required: true },
          { key: "phone", label: "Phone", type: "tel" },
          { key: "company", label: "Company", type: "text" },
        ].map((f) => (
          <div key={f.key}>
            <label className="text-sm text-muted-foreground mb-1.5 block">{f.label} {f.required && "*"}</label>
            <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="input-field" />
          </div>
        ))}
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Preferred Contact Time</label>
        <input type="text" placeholder="e.g., 9 AM - 12 PM EST" value={form.preferredContactTime} onChange={(e) => setForm({ ...form, preferredContactTime: e.target.value })} className="input-field" />
      </div>
      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">Message *</label>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="input-field resize-none" />
      </div>
      <button type="submit" className="btn-primary w-full justify-center">Send Message</button>
    </form>
  );
}

function ChatWidget({ onClose, guestId, conversations, addConversation, addMessage, addNotification }: any) {
  const [input, setInput] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const { messages } = useApp();

  let conv = conversations.find((c: any) => c.userId === guestId);
  const convId = conv?.id || "conv-" + guestId;
  const chatMessages = messages.filter((m: any) => m.conversationId === convId);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages.length]);

  const send = () => {
    if (!input.trim()) return;
    if (!conv) {
      addConversation({ id: convId, userId: guestId, userName: "Guest", status: "active" as const, lastMessage: input, lastMessageTime: new Date().toISOString(), unread: 1 });
      addNotification({ type: "chat", title: "New Chat", message: "A guest started a chat.", referenceId: convId });
    }
    addMessage({ conversationId: convId, senderId: guestId, senderName: "You", senderType: "user", content: input });
    setInput("");
    setTimeout(() => {
      addMessage({ conversationId: convId, senderId: "rep1", senderName: "Alex (Sales)", senderType: "sales", content: "Thanks for reaching out! A team member will be with you shortly." });
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 w-[calc(100vw-2rem)] max-w-sm z-50 rounded-xl border border-border bg-card overflow-hidden flex flex-col shadow-2xl" style={{ height: "28rem" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-semibold text-sm">Champa Sales</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
      </div>
      <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 && <p className="text-sm text-muted-foreground text-center mt-8">Send a message to start chatting with our sales team.</p>}
        {chatMessages.map((msg: any) => (
          <div key={msg.id} className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3.5 py-2 rounded-xl text-sm ${msg.senderType === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary rounded-bl-sm"}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message..." className="input-field flex-1" />
        <button onClick={send} className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
