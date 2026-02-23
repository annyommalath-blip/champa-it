

# Champa Private Enterprise -- Full Rebuild Plan

This is a major rebuild that transforms the current single-user app into a **dual-sided platform** with authentication, role-based access, and a full Admin Portal. Below is a phased plan.

---

## Phase 1: Database Schema and Authentication

### New Database Tables

1. **profiles** -- stores user metadata linked to `auth.users`
   - `id` (uuid, FK to auth.users), `email`, `full_name`, `avatar_url`, `role` (customer/pending_admin/approved_admin/super_admin), `status` (active/disabled), `created_at`
   - NOTE: Per security requirements, roles will be stored in a **separate `user_roles` table** using an enum, with a `has_role()` security definer function to avoid RLS recursion.

2. **user_roles** -- role assignments
   - `id`, `user_id` (FK auth.users), `role` (app_role enum: customer, pending_admin, approved_admin, super_admin), unique(user_id, role)

3. **admin_requests** -- tracks admin access requests
   - `id`, `user_id`, `reason`, `status` (pending/approved/rejected), `reviewed_by`, `reviewed_at`, `created_at`

4. **products** -- replaces mock data
   - `id`, `name`, `description`, `long_description`, `price`, `category`, `images` (text[]), `specs` (jsonb), `in_stock`, `rating`, `created_by`, `created_at`, `updated_at`

5. **orders** -- customer orders / quote requests
   - `id`, `user_id`, `items` (jsonb), `total`, `status` (pending/confirmed/processing/shipped/delivered/picked_up), `notes`, `customer_info` (jsonb), `created_at`, `updated_at`

6. **conversations** -- live chat (update existing table)
   - Add `user_id`, `assigned_admin_id`, `subject` columns to existing `chat_conversations`

7. **chat_messages** -- already exists, update with `sender_name`

8. **notifications** -- persistent notifications
   - `id`, `user_id`, `type`, `title`, `message`, `reference_id`, `is_read`, `created_at`

9. **audit_logs** -- tracks role changes/approvals
   - `id`, `actor_id`, `action`, `target_user_id`, `details` (jsonb), `created_at`

10. **settings** -- company info, banners
    - `id`, `key`, `value` (jsonb), `updated_at`

### Auth Setup
- Enable email/password authentication (no auto-confirm -- users verify email)
- On signup, a database trigger creates a profile + assigns "customer" role by default
- Special handling: if email = `annyommalath@gmail.com`, auto-assign `super_admin` role
- RLS policies on all tables using the `has_role()` security definer function

### Seed Data
- Migrate the existing mock products into the `products` table

---

## Phase 2: Authentication UI

### New Pages/Components
- **`/auth`** -- Login / Sign Up page with tabs
  - Email + password fields
  - "Sign up as Champa Admin" checkbox (sets role to pending_admin instead of customer)
  - Reason field appears when admin checkbox is checked
- **`/auth/reset-password`** -- Password reset page
- **Auth context** (`src/context/AuthContext.tsx`) -- replaces the current mock login
  - `onAuthStateChange` listener
  - Fetch user role from `user_roles` table
  - Expose `user`, `role`, `isLoading`, `signIn`, `signUp`, `signOut`

### Route Protection
- **`ProtectedRoute`** component wrapping admin routes
- **`RoleGuard`** component checking specific roles
- Routing logic:
  - Not logged in -> can browse Customer App (public pages)
  - Logged in as `customer` -> Customer App with profile features
  - Logged in as `pending_admin` -> redirect to "Awaiting Approval" page
  - Logged in as `approved_admin` -> Admin Portal
  - Logged in as `super_admin` -> Admin Portal + Admin Management

---

## Phase 3: Customer App Updates

### Updated Navigation
- Tabs: **Home**, **Shop**, **Services**, **Profile**
- Profile tab behavior:
  - If not logged in: show Sign In / Sign Up buttons
  - If logged in: show greeting, orders, account settings

### Updated Pages
- **Home (`/`)** -- keep existing DJI Mimo-style layout, but pull featured products from database
- **Shop (`/shop`)** -- fetch products from database instead of mock data
- **Product Detail (`/shop/:id`)** -- fetch from database
- **Cart (`/cart`)** -- on checkout, create an order in the database (requires login)
- **Services (`/services`)** -- keep existing, quote form writes to orders table
- **Contact (`/contact`)** -- keep existing, chat uses database conversations
- **Profile (`/profile`)** -- show real orders from database, account management
- **Notifications (`/notifications`)** -- fetch from database notifications table

---

## Phase 4: Admin Portal

### New Admin Layout
- **`/admin`** route prefix with separate sidebar/nav layout
- Dark background with #ECC61D accents
- Sidebar navigation: Dashboard, Products, Orders, Messages, Notifications, Admin Mgmt (super admin only), Settings

### Admin Pages

1. **Dashboard (`/admin`)** -- summary cards (total orders, pending quotes, active chats, unread notifications), recent activity feed

2. **Products (`/admin/products`)** -- CRUD interface
   - Table listing all products with search/filter
   - Create/Edit form: name, description, price, category, images (file upload to storage bucket), specs, stock toggle
   - Delete with confirmation
   - Changes appear instantly in Customer Shop

3. **Orders (`/admin/orders`)** -- manage orders and quote requests
   - Table with status filters (pending, confirmed, processing, shipped, delivered)
   - Click to view details, update status, add notes
   - Status changes trigger notifications to customers

4. **Messages (`/admin/messages`)** -- live chat management
   - List of conversations with unread counts
   - Click to open chat, reply to customers in real-time
   - Assign conversations to admins

5. **Notifications (`/admin/notifications`)** -- admin notification feed
   - New chats, new orders, new quote requests

6. **Admin Management (`/admin/admins`)** -- super admin only
   - List of admin requests (pending/approved/rejected)
   - Approve / Reject / Disable buttons
   - Audit log of role changes

7. **Settings (`/admin/settings`)** -- company info, banner promos, contact info

---

## Phase 5: Real-time Features

- Enable Supabase Realtime on: `chat_messages`, `notifications`, `orders`
- Admin sees new messages instantly
- Customer sees order status changes instantly
- Notification badges update in real-time

---

## Technical Details

### File Structure (new/modified)

```text
src/
  context/
    AuthContext.tsx          (NEW - replaces mock auth)
    AppContext.tsx           (MODIFIED - remove mock auth, keep cart logic)
  components/
    Layout.tsx              (MODIFIED - role-based nav)
    CustomerLayout.tsx      (NEW - customer shell)
    AdminLayout.tsx         (NEW - admin sidebar shell)
    ProtectedRoute.tsx      (NEW - auth guard)
    RoleGuard.tsx           (NEW - role check)
    ChatPopup.tsx           (MODIFIED - link to auth user)
  pages/
    Auth.tsx                (NEW - login/signup)
    ResetPassword.tsx       (NEW)
    PendingApproval.tsx     (NEW - waiting screen)
    Profile.tsx             (MODIFIED - real data)
    admin/
      AdminDashboard.tsx    (NEW)
      AdminProducts.tsx     (NEW)
      AdminOrders.tsx       (NEW)
      AdminMessages.tsx     (NEW)
      AdminNotifications.tsx(NEW)
      AdminManagement.tsx   (NEW)
      AdminSettings.tsx     (NEW)
  hooks/
    useAuth.ts              (NEW)
    useProducts.ts          (NEW - CRUD hooks)
    useOrders.ts            (NEW)
    useNotifications.ts     (NEW)
```

### Database Migration Sequence
1. Create enum `app_role` and `user_roles` table
2. Create `profiles` table with trigger for auto-creation on signup
3. Create `has_role()` security definer function
4. Create `products`, `orders`, `notifications`, `admin_requests`, `audit_logs`, `settings` tables
5. Update existing `chat_conversations` and `chat_messages` tables
6. Add RLS policies to all tables
7. Seed initial product data
8. Create storage bucket for product images
9. Enable realtime on key tables

### Security
- All tables have RLS enabled
- `has_role()` function prevents RLS recursion
- Super admin email hardcoded in database trigger (not client-side)
- Admin routes protected both client-side and via RLS
- Audit log tracks all role changes

---

## Implementation Order

Due to the scope, this will be built incrementally:

1. Database migrations (all tables, RLS, triggers, seed data)
2. Auth context + Auth pages (login, signup, reset password)
3. Route restructuring with role-based guards
4. Customer app updates (fetch from DB instead of mocks)
5. Admin layout + Dashboard
6. Admin Products CRUD
7. Admin Orders management
8. Admin Messages/Chat
9. Admin Management (super admin)
10. Admin Settings
11. Real-time subscriptions
12. Polish and testing

