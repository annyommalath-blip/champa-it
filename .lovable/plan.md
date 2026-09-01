# Add In-App Account Deletion (Apple Guideline 5.1.1(v))

Give signed-in users a way to permanently delete their account and personal data from inside the app, with a confirmation step — no email or phone support required.

## What the user will see

1. Profile > Account Settings gains a "Danger zone" section at the bottom with a **Delete Account** button (destructive styling, clearly labeled permanent).
2. Tapping it opens a confirmation dialog that explains what is removed, and requires the user to type `DELETE` to enable the confirm button.
3. On confirm: account and personal data are deleted, the session is signed out, and the user lands on the home screen with a "Your account has been deleted" toast.
4. Errors show a clear message and leave the account untouched.

## What gets deleted vs kept

- Deleted: the auth user, profile (name, phone, address, avatar), role assignment, notifications, saved items, chat conversations/messages, and any pending admin request/invite.
- Kept but anonymized: past orders are retained for legal/accounting reasons with the user link removed and customer contact details stripped. This is stated in the confirmation dialog so the user knows.

## Technical approach

- New edge function `supabase/functions/delete-account/index.ts`:
  - CORS via `npm:@supabase/supabase-js@2/cors`, POST only.
  - Validates the caller's JWT in code (`getUser` with the request bearer token) — the user can only delete themselves; no user id is accepted from the client.
  - Uses the service-role client to: null out `orders.user_id` and clear `customer_info`/`guest_email`/`guest_phone` for that user, delete rows in `notifications`, `chat_messages` + `chat_conversations`, `admin_requests`, `user_roles`, `profiles`, remove that user's files from the `payment-screenshots` and product/avatar paths they own, then `auth.admin.deleteUser(userId)`.
  - Returns `{ success: true }` or a 4xx/5xx with a message.
- Frontend: `src/pages/AccountSettings.tsx` gains the danger-zone UI + shadcn `AlertDialog`, calls `supabase.functions.invoke("delete-account")`, then `signOut()` and navigate to `/`.
- Super Admin guard: the super admin account cannot delete itself through this flow (would lock the store out); it shows an explanatory message instead. Regular admins and customers can delete.
- No schema migration needed — all deletions use existing tables.
