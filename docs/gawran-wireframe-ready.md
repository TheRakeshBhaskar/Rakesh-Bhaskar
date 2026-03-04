# Gawran App Wireframe-Ready UI Blueprint

Tagline: **खरे गावरान, खरे ऑर्गेनिक**

## 1) Product + UX Goal
- App type: Organic grocery marketplace connecting customers and verified local farmers.
- Primary user outcome: Find trusted organic products quickly and place an order in minimal steps.
- UX principle: Trust-first design (certification, farmer identity, freshness cues).

## 2) End-to-End User Flow (IA)
1. Splash
2. Language Selection
3. Onboarding (3 slides)
4. Login / Signup / Guest
5. Home
6. Category Listing / Search Results
7. Product Detail
8. Cart
9. Address + Delivery Slot
10. Payment
11. Order Success
12. Track Order
13. Profile + Support

---

## 3) Wireframe Specifications (Frame-by-Frame)

## F1 — Splash
**Frame name:** `01_Splash`
**Device frame:** 390 x 844 (iPhone 13 baseline) / 360 x 800 (Android alt)

**Layout blocks (top→bottom):**
- Full-screen background (subtle green→cream gradient)
- Center logo lockup
- Tagline text under logo
- Bottom loading indicator (optional)

**Interactions:** Auto-transition in 2–3 sec to Language Selection.

---

## F2 — Language Selection
**Frame name:** `02_Language_Select`

**Layout blocks:**
- Top: Title `भाषा निवडा / Select Language`
- Middle: 3 large language buttons/cards
  - मराठी
  - हिंदी
  - English
- Bottom sticky CTA: `Continue`

**States:**
- Default: CTA disabled
- Selected language: highlighted card + CTA enabled

---

## F3-F5 — Onboarding Carousel
**Frame names:**
- `03_Onboarding_PureOrganic`
- `04_Onboarding_TrustedFarmers`
- `05_Onboarding_FastDelivery`

**Common layout:**
- Top: Skip action
- Middle: Illustration block
- Lower-middle: Headline + 2-line description
- Bottom: Dots indicator + Next / Get Started CTA

**Slide copy (sample):**
1. शेतातून थेट तुमच्या घरी
2. विश्वासार्ह शेतकऱ्यांकडून
3. ताजे उत्पादन, जलद डिलिव्हरी

---

## F6 — Login / Signup
**Frame name:** `06_Login_OTP`

**Layout blocks:**
- App brand mark
- Mobile number input (+91)
- CTA: `Send OTP`
- OTP input (4/6 digits) on next state
- Optional social buttons: Google / Apple
- Tertiary action: Continue as Guest
- Trust badges row:
  - 100% Organic
  - Farm Verified

**Validation states:**
- Invalid number
- Wrong OTP
- Resend OTP timer

---

## F7 — Home
**Frame name:** `07_Home`

**Top app bar:**
- Location selector (left)
- Notification icon (right)

**Section stack:**
1. Search bar (`भाजी, धान्य, तूप शोधा`)
2. Hero banner carousel (offers/festivals/farmer story)
3. Category grid (2 rows)
4. Today Fresh Picks (horizontal cards)
5. Best Sellers (horizontal cards)
6. Nearby Farmer Specials (horizontal cards)

**Bottom nav:** Home | Categories | Cart | Orders | Profile

---

## F8 — Category / Product Listing
**Frame name:** `08_Listing`

**Layout blocks:**
- Top: Back + category title
- Filter/sort row (chips + sort icon)
- Product list (vertical cards)
- Sticky mini-cart bar (appears when cart count > 0)

**Product card anatomy:**
- Product image
- Name (MR/EN optional)
- Farmer name
- Price + MRP strike-through
- Unit selector (500g/1kg)
- `Add` button

**Bottom sheet:** Filters
- Organic Certified toggle
- Price range slider
- Sort (Price / Popularity / Freshness)

---

## F9 — Product Detail
**Frame name:** `09_Product_Detail`

**Layout blocks:**
- Image gallery (swipe)
- Product title + trust badges
- Price, quantity stepper, stock status
- Tabs/sections:
  - About this product
  - Farm source details
  - Nutritional info
  - Reviews
- Sticky dual CTA:
  - Add to Cart
  - Buy Now

---

## F10 — Cart
**Frame name:** `10_Cart`

**Layout blocks:**
- Cart item list (qty stepper, remove, save for later)
- Coupon/apply offer input
- Bill summary card
  - Subtotal
  - Delivery
  - Discount
  - Grand Total
- Sticky CTA: `Proceed to Checkout`

**Empty state:** Illustration + `Start Shopping` button.

---

## F11 — Address + Slot
**Frame name:** `11_Address_Slot`

**Layout blocks:**
- Saved address list
- `Add New Address`
- Delivery slot selector (chips/cards)
- CTA: `Continue to Payment`

**Add address form fields:**
Name, Phone, House/Flat, Street, Landmark, Pincode, City.

---

## F12 — Payment
**Frame name:** `12_Payment`

**Layout blocks:**
- Payment method list:
  - UPI
  - Card
  - Net Banking
  - COD
- Order summary accordion
- Sticky CTA: `Place Order`

**State variations:**
- UPI success
- Payment failed + retry

---

## F13 — Order Success
**Frame name:** `13_Order_Success`

**Layout blocks:**
- Success icon/illustration
- Message + Order ID
- ETA text
- CTAs:
  - Track Order
  - Continue Shopping

---

## F14 — Track Order
**Frame name:** `14_Track_Order`

**Layout blocks:**
- Order header (ID, ETA)
- Status timeline:
  1. Confirmed
  2. Packed
  3. Out for Delivery
  4. Delivered
- Delivery partner info + Call action
- Optional mini-map block

---

## F15 — Profile
**Frame name:** `15_Profile`

**Layout blocks:**
- User card (name/phone)
- Menu list:
  - My Orders
  - Saved Addresses
  - Wishlist
  - Language
  - Help & Support
  - About Gawran
  - Logout

---

## 4) Reusable Components (for Figma + Dev Handoff)
- `Button/Primary`
- `Button/Secondary`
- `Input/TextField`
- `Card/Product`
- `Chip/Category`
- `Chip/Filter`
- `Badge/Trust`
- `Sheet/BottomFilter`
- `Nav/BottomTab`
- `State/Empty`
- `State/LoadingSkeleton`
- `Toast/Snackbar`

Use component variants (`default`, `active`, `disabled`, `error`) to reduce duplicated frames.

## 5) Grid, Spacing, and Type Tokens

## Spacing scale
- 4, 8, 12, 16, 20, 24, 32

## Corner radius
- Cards: 12
- Buttons: 10
- Chips: 999 (pill)

## Typography (Marathi-friendly)
- Font family: Noto Sans Devanagari (fallback: system sans)
- H1: 24/32 Semibold
- H2: 20/28 Semibold
- Body: 16/24 Regular
- Caption: 12/16 Medium

## Color tokens
- `green-600` (primary CTA)
- `green-100` (light backgrounds)
- `brown-600` (secondary accent)
- `cream-50` (app background)
- `gray-900` (text)
- `red-500` (error)

## 6) Prototype Links to Build in Figma
- Main happy path:
  Splash → Language → Onboarding → Login → Home → Listing → PDP → Cart → Address → Payment → Success → Track.
- Add back-navigation from every internal screen.
- Add loading + empty + error states at least for Listing, Cart, Payment.

## 7) Developer Handoff Checklist
- Provide frame names exactly as above (`01_...15_...`).
- Export asset folder:
  - App logo (SVG)
  - Category icons (SVG)
  - Trust badges (SVG/PNG)
- Document microcopy in Marathi + English fallback.
- Attach interaction notes for:
  - OTP timers
  - Quantity updates
  - Filter apply/reset
  - Payment retry flow

## 8) Optional V2 Screens (if scope allows)
- Wishlist full flow
- Referral/Rewards
- Farmer profile page
- Subscription baskets (weekly milk/vegetable box)
