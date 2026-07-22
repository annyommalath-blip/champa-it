import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"loading" | "valid" | "already" | "invalid" | "success" | "error">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } },
        );
        const data = await res.json();
        if (data.valid) setState("valid");
        else if (data.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      } catch {
        setState("error");
      }
    })();
  }, [token]);

  const confirm = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
    setBusy(false);
    if (error) return setState("error");
    if (data?.success) setState("success");
    else if (data?.reason === "already_unsubscribed") setState("already");
    else setState("error");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F8] px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm border border-black/5 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">Unsubscribe</h1>
        <p className="mt-2 text-sm text-neutral-500">Champa Enterprise emails</p>

        <div className="mt-6 text-neutral-700 text-[15px]">
          {state === "loading" && "Checking your link…"}
          {state === "valid" && "Click below to confirm you want to stop receiving emails from Champa Enterprise."}
          {state === "already" && "You've already unsubscribed. You won't receive further emails."}
          {state === "invalid" && "This unsubscribe link is invalid or has expired."}
          {state === "success" && "You've been unsubscribed. Sorry to see you go."}
          {state === "error" && "Something went wrong. Please try again later."}
        </div>

        {state === "valid" && (
          <Button onClick={confirm} disabled={busy} className="mt-6 w-full rounded-2xl bg-[#ECC61D] text-black hover:bg-[#d9b418]">
            {busy ? "Processing…" : "Confirm unsubscribe"}
          </Button>
        )}
      </div>
    </div>
  );
}
