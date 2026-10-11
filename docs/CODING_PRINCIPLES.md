# Coding principles

Rules that keep Champa maintainable. Prefer extending the existing layout over inventing new layers.

## Structure

1. **Put new code where the domain already lives.** Pages own screens. Context owns session/cart/language. Edge Functions own secrets and privileged writes. See [FEATURE_MAP.md](FEATURE_MAP.md) before adding files.
2. **One page file ≈ one route.** Keep screen-specific queries and UI in that page. Extract to `src/hooks/` or a shared component only when a second screen needs the same logic.
3. **Do not invent folders** (`services/`, `repositories/`, `stores/`) unless the team agrees to a documented migration. Growth happens inside the current tree.
4. **`src/components/ui/` is shadcn primitives.** Use them; do not put product business logic or one-off feature styling into those files.
5. **Shared domain types** go in [`src/types/index.ts`](../src/types/index.ts). DB row shapes come from generated Supabase types.

## Frontend

1. **Functional components + hooks.** Match neighboring file style (imports, naming, Tailwind class patterns).
2. **Customer-facing copy that uses `t()`** must add both `en` and `lo` keys in [`src/context/LanguageContext.tsx`](../src/context/LanguageContext.tsx).
3. **Cart currency:** a cart is single-currency. Mixing currencies is blocked in [`AppContext`](../src/context/AppContext.tsx) — keep that rule there.
4. **Toast feedback** uses `sonner` (already wired in `App.tsx`). Prefer existing patterns over new toast systems.
5. **Auth and role checks** go through `useAuth` / `ProtectedRoute`. Do not re-query `user_roles` ad hoc for the same purpose.
6. **Native vs web:** use helpers in [`src/lib/native.ts`](../src/lib/native.ts). Never assume Capacitor APIs exist in the browser.

## Data and backend

1. **New persisted data = new migration** under `supabase/migrations/`. Never edit a migration that has already been applied.
2. **RLS for every client-readable table.** The anon key is public in the WebView.
3. **Regenerate / update** [`src/integrations/supabase/types.ts`](../src/integrations/supabase/types.ts) when the schema changes. Look up one table; do not paste or rewrite the whole file by hand.
4. **Money, account deletion, and email sending** go through Edge Functions. The client calls `supabase.functions.invoke(...)`.
5. **Stripe secrets** stay in Edge Function env. Payment status on `orders` is written by `payments-webhook`, not by client `update`.
6. **Transactional email templates** live under `supabase/functions/_shared/transactional-email-templates/` and must be registered in [`registry.ts`](../supabase/functions/_shared/transactional-email-templates/registry.ts).
7. **Single merchant.** Do not introduce Stripe Connect or multi-seller payout models.

## Domains

1. **Products ≠ services.** Catalog/checkout is `products` + `orders`. Services intake, quotes, and bookings are a separate domain (wizard today is local-only; profile routes are `ComingSoon`).
2. **Settings keys** (`hero_slides`, `payment_info`, `chat_greeting`, …) are CMS-style JSON in `settings`. Add keys via admin settings patterns; document new keys in the Feature Map settings section when you add them.

## Quality bar

1. **Touch every owner.** A feature that adds a screen also updates route, nav (if needed), i18n, RLS/migration (if stored), admin (if staff need it), and email (if the user is notified). Use the checklist in [FEATURE_MAP.md](FEATURE_MAP.md).
2. **Match existing patterns** in the nearest similar page before inventing a new one.
3. **Keep diffs focused.** No drive-by refactors or unrelated formatting.
4. **iOS chrome changes** follow [AGENTS.md](../AGENTS.md) (safe-area tokens, `ios:sync`, TestFlight QA).
5. **Tests:** prefer Vitest for pure helpers and critical logic when you add new shared code; pages today are largely integration-tested manually.

## Anti-patterns

- Reading the whole repo or `types.ts` to discover owners — open Feature Map first.
- Putting Stripe secret keys or service-role keys in `src/`.
- Editing applied migrations.
- Duplicating cart, auth, or i18n state outside their contexts.
- Customizing `components/ui/*` for a single feature.
- Persisting services/quotes into `products` or overloading `orders` without a clear schema decision documented in Architecture / Feature Map.
