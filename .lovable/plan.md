

## Redesign Home Page as a Mobile App (DJI Mimo Style)

The current design is a traditional web page layout. This plan transforms it into a **mobile-first app experience** with a card-based, scrollable home screen matching the DJI Mimo reference -- deep black background, large rounded cards, yellow accents, bottom tab navigation, and generous spacing.

---

### Key Design Changes

**From web page to app:**
- Remove the announcement bar, desktop top nav, and footer from the mobile view
- Add a **fixed bottom tab bar** (Home, Shop, Services, Contact, Dashboard) with icons -- just like DJI Mimo's bottom nav
- Home page becomes a **vertical scroll feed of cards** instead of traditional sections
- Desktop keeps the existing layout; the app style is mobile-only

---

### Layout Changes (`src/components/Layout.tsx`)

1. **Remove announcement bar on mobile** (keep on desktop)
2. **Replace mobile top header** with a simpler app-style header:
   - Left: Logo + "CHAMPA" brand name + tagline underneath
   - Right: Bell icon (notification) + User icon (profile/dashboard)
   - Optional: "Online Support" yellow outline pill badge
3. **Add fixed bottom tab bar** on mobile (5 tabs):
   - Home (House icon) | Shop (ShoppingBag) | Services (Wrench) | Contact (MessageCircle) | Dashboard (LayoutDashboard)
   - Active tab highlighted in yellow, inactive in gray
   - Styled like the DJI Mimo bottom nav with rounded icons
4. **Hide footer on mobile** (keep for desktop)
5. Add `pb-20` to main content to account for bottom nav height

---

### Home Page Redesign (`src/pages/About.tsx`)

Rebuild from scratch as a **mobile app home screen** with these sections:

#### 1. Hero Carousel (Embla Carousel)
- Horizontal swipeable carousel using the existing `embla-carousel-react` dependency
- 4-5 promo cards, each a large rounded rectangle (border-radius 20px)
- Card style: charcoal/dark gradient background with a subtle yellow gradient highlight on left edge
- Each card contains: bold title, subtitle text, and a CTA button
- Cards:
  1. "New Arrivals" / "Latest enterprise hardware" / "Shop Now" button
  2. "Request a Quote" / "Get a fast estimate from our sales team" / "Get Quote" button
  3. "Talk to Sales" / "Live chat with our engineers" / "Start Chat" button
  4. "Flash Deals" / "Up to 20% off select products" / "View Deals" button
- Dot indicators below the carousel (yellow active dot, gray inactive)
- Aspect ratio roughly 16:9 or 2:1

#### 2. Quick Actions Grid
- Section header: "Quick Actions" (left) -- no "More" link
- 2x3 or 3x2 grid of rounded icon cards
- Each card: icon + label, tapping navigates
- Items: Shop, Services, Get Quote, Live Chat, Deals, Dashboard
- Card style: dark charcoal (`card` color), subtle border, yellow icon

#### 3. Featured Products (horizontal scroll)
- Section header: "Featured Products" (left) + "More >" (right, links to /shop)
- Horizontally scrollable row of product cards (no grid -- horizontal scroll like DJI Store section)
- Each card: large rounded rectangle, product initial letter icon, name, price, rating
- Shows 3-4 products from mock data

#### 4. Services Card (single large card like "Academy" in reference)
- One big rounded card spanning full width
- Title: "IT Consulting & Managed Services"
- Subtitle: "Infrastructure assessments, cloud migration, 24/7 support"
- Yellow badge pill: "6 Services"
- "Learn More" button
- Links to /services

#### 5. Today's Deals (horizontal scroll)
- Section header: "Today's Deals" (left) + "More >" (right)
- Similar horizontal scroll layout to Featured Products
- Show deal products with discount badge and sale price

#### 6. Stats Row
- Compact horizontal row of 4 stats (500+ Clients, 24/7 Support, 99.9% SLA, 50+ Partners)
- Smaller card style, gold gradient numbers

#### 7. Partners Row
- Simple horizontal scroll of partner name badges
- Subtle charcoal pills

---

### CSS Updates (`src/index.css`)

- Add `.app-card` class: `border-radius: 20px`, charcoal bg, subtle border, no hover lift on mobile
- Add `.bottom-tab-bar` utility styles
- Increase `--radius` to `1rem` for more rounded feel
- Add smooth scroll-snap for carousels

---

### Technical Details

**Files to modify:**
- `src/components/Layout.tsx` -- Add bottom tab bar, simplify mobile header, hide footer on mobile
- `src/pages/About.tsx` -- Complete rewrite as mobile app home screen
- `src/index.css` -- Add app-card styles, bottom nav styles, scroll-snap utilities

**Dependencies used (already installed):**
- `embla-carousel-react` -- for the hero carousel (swipeable)
- `lucide-react` -- icons for bottom nav and quick actions

**Responsive strategy:**
- Mobile (default): App-style layout with bottom nav, card feed, no footer
- Desktop (md+): Keep existing web layout with top nav, footer, but home page also uses the new card-based sections (adapted to grid)

**No new dependencies needed.**

