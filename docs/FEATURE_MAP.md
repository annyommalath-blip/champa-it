# Feature map

Open this file before implementing or editing a feature. Read **only** the matching domain section (plus the cross-cutting checklist). Do not scan the whole repository to find owners.

Full system context: [ARCHITECTURE.md](ARCHITECTURE.md). How to write code: [CODING_PRINCIPLES.md](CODING_PRINCIPLES.md).

---

## Cross-cutting checklist

Use this for every non-trivial change:

1. **Page / component** — screen or shared UI that owns the behavior
2. **Route** — [`src/App.tsx`](../src/App.tsx) if the URL surface changes
3. **Nav** — [`Layout.tsx`](../src/components/Layout.tsx) `navKeys` / `desktopNavKeys`, [`Profile.tsx`](../src/pages/Profile.tsx) menu, or [`AdminLayout.tsx`](../src/components/AdminLayout.tsx) `adminNav`
4. **i18n** — both `en` and `lo` in [`LanguageContext.tsx`](../src/context/LanguageContext.tsx) when using `t()`
5. **Data** — new migration + RLS under `supabase/migrations/` if persisted; update generated types for new columns/tables
6. **Admin** — staff-facing screen under `src/pages/admin/` if admins must manage it
7. **Privileged API** — Edge Function under `supabase/functions/` for money, deletion, email, or service-role writes
8. **Email** — template + entry in [`registry.ts`](../supabase/functions/_shared/transactional-email-templates/registry.ts) if the user is notified by mail
9. **Realtime / badges** — [`Layout.tsx`](../src/components/Layout.tsx) (or admin equivalent) if unread counts change
10. **iOS chrome** — safe-area / status bar via [`native.ts`](../src/lib/native.ts), CSS tokens, [AGENTS.md](../AGENTS.md); run `npm run ios:sync` before TestFlight

---

## Catalog (products)

| Concern | Owner |
| --- | --- |
| Shop list | [`src/pages/Shop.tsx`](../src/pages/Shop.tsx) |
| Product detail + add to cart | [`src/pages/ProductDetail.tsx`](../src/pages/ProductDetail.tsx) |
| Home featured / deals | [`src/pages/About.tsx`](../src/pages/About.tsx) |
| Saved / bookmarked products | [`src/pages/Saved.tsx`](../src/pages/Saved.tsx) |
| Admin CRUD | [`src/pages/admin/AdminProducts.tsx`](../src/pages/admin/AdminProducts.tsx) |
| Table | `products` |
| Domain types | [`src/types/index.ts`](../src/types/index.ts) (`Product`, …) |

**When changing catalog:** shop + detail + home queries, admin products, and any select column lists that assume product shape.

---

## Cart and payments

| Concern | Owner |
| --- | --- |
| In-memory cart | [`src/context/AppContext.tsx`](../src/context/AppContext.tsx) |
| Cart UI + order create + payment method | [`src/pages/Cart.tsx`](../src/pages/Cart.tsx) |
| Stripe embedded checkout | [`src/components/StripeEmbeddedCheckout.tsx`](../src/components/StripeEmbeddedCheckout.tsx) |
| Return / poll payment status | [`src/pages/CheckoutReturn.tsx`](../src/pages/CheckoutReturn.tsx) |
| Currency helpers | [`src/lib/currency.ts`](../src/lib/currency.ts) |
| Client Stripe helpers | [`src/lib/stripe.ts`](../src/lib/stripe.ts) |
| Test-mode banner | [`src/components/PaymentTestModeBanner.tsx`](../src/components/PaymentTestModeBanner.tsx) |
| Create Checkout session | `supabase/functions/create-checkout` |
| Webhook → `payment_status` | `supabase/functions/payments-webhook` |
| Shared Stripe helper | `supabase/functions/_shared/stripe.ts` |
| Table | `orders` (+ `settings` key `payment_info` for bank/manual copy) |

**Rules:** client creates the pending order row; Stripe session via `create-checkout`; paid/failed via webhook. Single-currency cart enforced in `AppContext`.

---

## Orders (fulfillment)

| Concern | Owner |
| --- | --- |
| Customer list | [`src/pages/MyOrders.tsx`](../src/pages/MyOrders.tsx) |
| Customer detail | [`src/pages/OrderDetail.tsx`](../src/pages/OrderDetail.tsx) |
| Admin list / status / payment override | [`src/pages/admin/AdminOrders.tsx`](../src/pages/admin/AdminOrders.tsx) |
| Recent activity snippets | [`src/components/RecentActivity.tsx`](../src/components/RecentActivity.tsx) |
| Order confirmation email | template `order-confirmation` + `send-transactional-email` |
| Table | `orders` |

**Profile nav:** `/profile/orders` from [`Profile.tsx`](../src/pages/Profile.tsx).

---

## Services (IT intake)

| Concern | Owner |
| --- | --- |
| Service catalog + request wizard | [`src/pages/Services.tsx`](../src/pages/Services.tsx) |
| Quotes placeholder | `/profile/quotes` → [`ComingSoon`](../src/pages/ComingSoon.tsx) in `App.tsx` |
| Service requests placeholder | `/profile/service-requests` → `ComingSoon` |
| Billing placeholder | `/profile/billing` → `ComingSoon` |
| Profile menu links | [`src/pages/Profile.tsx`](../src/pages/Profile.tsx) |

**Status:** wizard submits a toast only (not persisted). Future persistence should be a **new** domain/tables, not reuse of `products` without an Architecture update.

---

## Chat

| Concern | Owner |
| --- | --- |
| Full-page chat | [`src/pages/Chat.tsx`](../src/pages/Chat.tsx) |
| FAB / widget | [`src/components/ChatWidget.tsx`](../src/components/ChatWidget.tsx) |
| Popup helper | [`src/components/ChatPopup.tsx`](../src/components/ChatPopup.tsx) |
| Admin inbox | [`src/pages/admin/AdminMessages.tsx`](../src/pages/admin/AdminMessages.tsx) |
| Unread badge (customer) | [`src/components/Layout.tsx`](../src/components/Layout.tsx) |
| Greeting copy | `settings` key `chat_greeting` |
| Tables | `chat_conversations`, `chat_messages` |

---

## Notifications

| Concern | Owner |
| --- | --- |
| Customer list | [`src/pages/Notifications.tsx`](../src/pages/Notifications.tsx) |
| Admin list | [`src/pages/admin/AdminNotifications.tsx`](../src/pages/admin/AdminNotifications.tsx) |
| Unread badge | [`src/components/Layout.tsx`](../src/components/Layout.tsx) |
| Table | `notifications` |

---

## Auth, roles, account

| Concern | Owner |
| --- | --- |
| Session, role, profile, sign-in/up | [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx) |
| Auth screens | [`src/pages/Auth.tsx`](../src/pages/Auth.tsx), [`ResetPassword.tsx`](../src/pages/ResetPassword.tsx), [`PendingApproval.tsx`](../src/pages/PendingApproval.tsx) |
| Route guard | [`src/components/ProtectedRoute.tsx`](../src/components/ProtectedRoute.tsx) |
| Account settings + delete | [`src/pages/AccountSettings.tsx`](../src/pages/AccountSettings.tsx) → `delete-account` function |
| Admin approve/invite | [`src/pages/admin/AdminManagement.tsx`](../src/pages/admin/AdminManagement.tsx) |
| Supabase client | [`src/integrations/supabase/client.ts`](../src/integrations/supabase/client.ts) |
| Tables | `profiles`, `user_roles`, `admin_requests`, `admin_invites`, `audit_logs` |
| Email | `admin-invite` template, `auth-email-hook` |

---

## Profile shell

| Concern | Owner |
| --- | --- |
| Profile hub + menu | [`src/pages/Profile.tsx`](../src/pages/Profile.tsx) |
| FAQ | [`src/pages/FAQ.tsx`](../src/pages/FAQ.tsx) |
| Contact | [`src/pages/Contact.tsx`](../src/pages/Contact.tsx) |
| Language toggle | [`src/context/LanguageContext.tsx`](../src/context/LanguageContext.tsx) + Profile UI |

New profile destinations: add route in `App.tsx` **and** a menu row in `Profile.tsx`.

---

## Admin shell

| Concern | Owner |
| --- | --- |
| Sidebar / chrome | [`src/components/AdminLayout.tsx`](../src/components/AdminLayout.tsx) (`adminNav`) |
| Dashboard counts | [`src/pages/admin/AdminDashboard.tsx`](../src/pages/admin/AdminDashboard.tsx) |
| Settings CMS UI | [`src/pages/admin/AdminSettings.tsx`](../src/pages/admin/AdminSettings.tsx) |

New admin page: route + `ProtectedRoute` roles + `adminNav` entry (+ `superOnly` if needed).

---

## Settings / CMS keys

Owned by table `settings` and [`AdminSettings.tsx`](../src/pages/admin/AdminSettings.tsx). Known consumers:

| Key | Consumers |
| --- | --- |
| `hero_slides` | `About.tsx` |
| `savings_banners` | `About.tsx` |
| `payment_info` | `Cart.tsx` |
| `chat_greeting` | `ChatWidget.tsx` |

Add new keys in admin settings + document them here + wire the consumer page.

---

## Email

| Concern | Owner |
| --- | --- |
| Template registry | [`supabase/functions/_shared/transactional-email-templates/registry.ts`](../supabase/functions/_shared/transactional-email-templates/registry.ts) |
| Templates | `_shared/transactional-email-templates/*.tsx`, auth templates under `_shared/email-templates/` |
| Send / queue | `send-transactional-email`, `process-email-queue` |
| Unsubscribe UI | [`src/pages/Unsubscribe.tsx`](../src/pages/Unsubscribe.tsx) + `handle-email-unsubscribe` |
| Suppression | `handle-email-suppression` |
| Preview | `preview-transactional-email` |

Registered templates today: `order-confirmation`, `admin-invite`.

---

## Customer shell / iOS

| Concern | Owner |
| --- | --- |
| Tab bar, header, badges, chat FAB | [`src/components/Layout.tsx`](../src/components/Layout.tsx) |
| Status bar style by path | [`src/lib/native.ts`](../src/lib/native.ts) (`syncStatusBarForPath`) |
| Safe-area CSS tokens | [`src/index.css`](../src/index.css) (`--sat` / `--sab`) |
| Capacitor config | [`capacitor.config.ts`](../capacitor.config.ts) (`contentInset: never`, StatusBar overlay) |
| Native project | `ios/` |
| Release sync | `npm run ios:sync` |
| QA checklist | [AGENTS.md](../AGENTS.md) |

Sheets/toasts that must clear the home indicator or island: [`sheet.tsx`](../src/components/ui/sheet.tsx), [`sonner.tsx`](../src/components/ui/sonner.tsx), [`toast.tsx`](../src/components/ui/toast.tsx).

---

## Quick “where do I start?” index

| I want to… | Start here |
| --- | --- |
| Add a shop filter | Catalog → `Shop.tsx` |
| Change checkout / Stripe | Cart and payments |
| Change order statuses | Orders |
| Persist service requests | Services (+ new migration; update this map) |
| Change chat unread | Chat → `Layout.tsx` + chat pages |
| Add an admin page | Admin shell checklist |
| Add a translated string | `LanguageContext.tsx` (`en` + `lo`) |
| Change safe area / status bar | Customer shell / iOS + AGENTS.md |
| Add a transactional email | Email → registry + function invoke sites |
