import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      items,
      deliveryFee = 0,
      currency = "usd",
      customerEmail,
      userId,
      orderId,
      returnUrl,
      environment,
    }: {
      items: CartItem[];
      deliveryFee?: number;
      currency?: string;
      customerEmail?: string;
      userId?: string;
      orderId: string;
      returnUrl: string;
      environment: StripeEnv;
    } = body;

    if (!items?.length) throw new Error("No items");
    if (!orderId) throw new Error("Missing orderId");
    if (environment !== "sandbox" && environment !== "live") throw new Error("Invalid environment");

    const stripe = createStripeClient(environment);

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (deliveryFee > 0) {
      line_items.push({
        price_data: {
          currency,
          product_data: { name: "Delivery" },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(customerEmail && { customer_email: customerEmail }),
      payment_intent_data: { description: `Champa Order ${orderId.slice(0, 8)}` },
      metadata: { orderId, ...(userId && { userId }) },
    });

    // Store session id on the order for later reconciliation
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
