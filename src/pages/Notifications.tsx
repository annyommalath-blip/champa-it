import { Bell } from "lucide-react";

export default function Notifications() {
  return (
    <div className="px-5 py-5 space-y-4 md:max-w-2xl md:mx-auto md:px-8 md:py-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground">Your notifications will appear here</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Bell className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">No notifications yet</p>
        <p className="text-xs text-muted-foreground mt-1">Sign in to receive order updates and messages</p>
      </div>
    </div>
  );
}
