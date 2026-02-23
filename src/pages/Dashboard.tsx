import { useState } from "react";
import { Bell, MessageSquare, LogIn, LogOut, Send, User, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Dashboard() {
  const { isLoggedIn, repName, login, logout, notifications, markNotificationRead, conversations, messages, addMessage } = useApp();
  const [email, setEmail] = useState("admin@champa.com");
  const [password, setPassword] = useState("champa123");
  const [activeTab, setActiveTab] = useState<"notifications" | "chat">("notifications");
  const [selectedConv, setSelectedConv] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="section-padding flex items-center justify-center min-h-[70vh]">
        <div className="tech-card p-8 w-full max-w-sm">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-center mb-1">Sales Dashboard</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Sign in to manage conversations and notifications.</p>
          <form onSubmit={(e) => { e.preventDefault(); login(email, password); }} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="input-field" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="input-field" />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">Sign In</button>
            <p className="text-xs text-muted-foreground text-center">Demo: admin@champa.com / champa123</p>
          </form>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const convMessages = selectedConv ? messages.filter((m) => m.conversationId === selectedConv) : [];

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Welcome, {repName}</p>
          </div>
          <button onClick={logout} className="btn-outline text-sm py-2 px-4">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "notifications" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            <Bell className="w-4 h-4" />
            Notifications {unreadCount > 0 && <span className="w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">{unreadCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "chat" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            <MessageSquare className="w-4 h-4" /> Conversations
          </button>
        </div>

        {activeTab === "notifications" && (
          <div className="space-y-3">
            {notifications.length === 0 && <p className="text-muted-foreground text-center py-12">No notifications yet.</p>}
            {notifications.map((n) => (
              <button key={n.id} onClick={() => markNotificationRead(n.id)} className={`w-full text-left tech-card p-5 ${!n.read ? "border-l-4 border-l-primary" : "opacity-50"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{n.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: "24rem" }}>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button key={conv.id} onClick={() => setSelectedConv(conv.id)} className={`w-full text-left tech-card p-4 ${selectedConv === conv.id ? "ring-1 ring-primary/30" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{conv.userName}</span>
                        {conv.unread > 0 && <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{conv.unread}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))}
              {conversations.length === 0 && <p className="text-muted-foreground text-center py-8 text-sm">No conversations yet.</p>}
            </div>

            <div className="md:col-span-2 tech-card flex flex-col overflow-hidden">
              {selectedConv ? (
                <>
                  <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="font-semibold text-sm">{conversations.find((c) => c.id === selectedConv)?.userName}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {convMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderType === "sales" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-3.5 py-2 rounded-xl text-sm ${msg.senderType === "sales" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary rounded-bl-sm"}`}>
                          {msg.content}
                          <div className="text-[10px] opacity-60 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <SalesInput conversationId={selectedConv} addMessage={addMessage} repName={repName} />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a conversation</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SalesInput({ conversationId, addMessage, repName }: { conversationId: string; addMessage: any; repName: string }) {
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    addMessage({ conversationId, senderId: "rep1", senderName: repName, senderType: "sales", content: input });
    setInput("");
  };

  return (
    <div className="p-3 border-t border-border flex gap-2">
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Reply..." className="input-field flex-1" />
      <button onClick={send} className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 shrink-0">
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
