import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPER_ADMIN_EMAIL = "annyommalath@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ error: "Not authenticated" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate the caller's JWT in code. The user can only delete themselves.
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser();
    const user = userData?.user;
    if (userError || !user) return json({ error: "Not authenticated" }, 401);

    if ((user.email ?? "").toLowerCase() === SUPER_ADMIN_EMAIL) {
      return json(
        { error: "The store owner account cannot be deleted from the app. Contact support to transfer ownership first." },
        403,
      );
    }

    const userId = user.id;
    const admin = createClient(url, serviceKey);

    // 1. Anonymize orders (kept for accounting/legal reasons).
    await admin
      .from("orders")
      .update({ user_id: null, customer_info: null, guest_email: null, guest_phone: null })
      .eq("user_id", userId);

    // 2. Remove this user's payment screenshots (stored under <userId>/...).
    try {
      const { data: files } = await admin.storage.from("payment-screenshots").list(userId);
      if (files?.length) {
        await admin.storage
          .from("payment-screenshots")
          .remove(files.map((f) => `${userId}/${f.name}`));
      }
    } catch (_) {
      // Non-fatal: continue with account deletion.
    }

    // 3. Delete chat conversations + their messages.
    const { data: convos } = await admin
      .from("chat_conversations")
      .select("id")
      .eq("user_id", userId);
    const convoIds = (convos ?? []).map((c: { id: string }) => c.id);
    if (convoIds.length) {
      await admin.from("chat_messages").delete().in("conversation_id", convoIds);
      await admin.from("chat_conversations").delete().in("id", convoIds);
    }
    await admin.from("chat_messages").delete().eq("sender_id", userId);

    // 4. Delete personal records.
    await admin.from("notifications").delete().eq("user_id", userId);
    await admin.from("admin_requests").delete().eq("user_id", userId);
    if (user.email) {
      await admin.from("admin_invites").delete().ilike("email", user.email);
    }
    await admin.from("user_roles").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("user_id", userId);

    // 5. Delete the auth user last.
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) return json({ error: deleteError.message }, 500);

    return json({ success: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
