import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const [status, setStatus] = useState<"loading" | "paid" | "pending">("loading");
  const { clearCart } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) return;
    let attempts = 0;
    const poll = async () => {
      const { data } = await supabase.from("orders").select("payment_status").eq("id", orderId).maybeSingle();
      if (data?.payment_status === "paid") {
        setStatus("paid");
        clearCart();
        return;
      }
      attempts++;
      if (attempts < 8) setTimeout(poll, 1500);
      else setStatus("pending");
    };
    poll();
  }, [orderId, clearCart]);

  return (
    <div className="px-5 py-16 min-h-[70vh] flex flex-col items-center justify-center text-center">
      {status === "loading" && (
        <>
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <h1 className="text-page-title mb-2">Confirming your payment…</h1>
          <p className="text-caption text-muted-foreground">This only takes a moment.</p>
        </>
      )}
      {status === "paid" && (
        <>
          <CheckCircle className="w-14 h-14 text-success mb-4" />
          <h1 className="text-page-title mb-2">Payment successful</h1>
          <p className="text-caption text-muted-foreground mb-6">
            Order {orderId?.slice(0, 8)} confirmed. We'll email your receipt shortly.
          </p>
          <div className="flex gap-3">
            <Link to={`/profile/orders/${orderId}`} className="btn-primary">Track order</Link>
            <button onClick={() => navigate("/shop")} className="btn-secondary">Keep shopping</button>
          </div>
        </>
      )}
      {status === "pending" && (
        <>
          <h1 className="text-page-title mb-2">Payment processing</h1>
          <p className="text-caption text-muted-foreground mb-6">
            We'll update your order as soon as the payment confirms.
          </p>
          <Link to="/profile" className="btn-primary">Back to profile</Link>
        </>
      )}
    </div>
  );
}
