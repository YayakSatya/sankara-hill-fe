# PRD — The Sankara Hill Penida Website (Phase 1: Landing Page)

**Document owner:** TBD
**Status:** Draft
**Date:** 2026-08-10

---

## 1. Overview

**Product:** Official website for The Sankara Hill Penida, a 5-star hilltop resort in Nusa Penida, Bali.

**Phase 1 scope:** A single-page landing page that introduces the resort and captures reservation/inquiry leads. This is the foundation for **Phase 2**, which will expand into a full multi-page website (dedicated room pages, booking engine, activities pages, gallery, etc.).

**Content source:** `TSH_Hotel_Information_Presentation.md` (hotel fact sheet / internal PPT export). All factual content (rooms, facilities, distances, hours) in this PRD is sourced from that document.

---

## 2. Goals

- **Primary goal:** Generate qualified reservation/inquiry leads via a contact form (name, dates, contact info, preferences) that routes to the reservations team.
- **Secondary goal:** Establish brand presence and communicate the resort's positioning (hilltop, ocean view, luxury, private pool villas) clearly enough to justify a booking inquiry over a generic OTA search.

This is **not** a booking-engine page in Phase 1 — no real-time availability or payment. The form is an inquiry/lead form; reservations team follows up manually.

---

## 3. Target Audience

- International and domestic leisure travelers researching Nusa Penida stays, price-comparing on OTAs (Booking.com, Agoda) and searching directly for a more premium/private alternative.
- Couples / honeymooners (villa product is explicitly positioned this way in source content).
- Small groups booking via travel agents or planning weddings/events (Wedding Chapel, Function Room facilities exist).
- Visits primarily via mobile (assume mobile-first design), often from Instagram/social referral or Google search.

---

## 4. Tone of Voice / Brand Direction

- Luxury, serene, editorial — matches source copy ("sanctuary of serenity," "breathtaking ocean views," "refined island sanctuary").
- Visual-led: large imagery of ocean/hilltop views, pool villas, minimal dense text blocks.
- Avoid generic hotel-brochure clichés beyond what's already in the source copy; keep the existing copy's register when localizing to Indonesian.

---

## 5. Page Sections (Phase 1 — Single Landing Page)

Each section below is an anchor/block on one scrolling page.

### 5.1 Header / Navigation (sticky)
- Logo (The Sankara Hill Penida)
- Anchor nav links: About · Accommodations · Facilities · Location · Contact
- Language switcher: ID / EN
- Primary CTA button: "Enquire Now" / "Tanya & Pesan" → scrolls to Reservation Inquiry section (5.7)

### 5.2 Hero Section
- Full-bleed hero image/video (hilltop + ocean view)
- Headline: "A New Hilltop Retreat in Paradise"
- Sub-headline: "The Sankara Hill Penida"
- Location line: "Nusa Penida, Bali"
- Primary CTA: "Enquire Now" (scrolls to form)
- Secondary CTA (optional): WhatsApp icon/link for direct contact
- **Open question:** Should WhatsApp be a persistent floating button across the whole page (common for Bali resort sites), or only in header/footer? Recommend floating button given lead-gen goal — confirm before Figma.

### 5.3 Welcome / About Section
- Source copy: *"Discover a sanctuary of serenity where modern luxury meets breathtaking ocean views..."*
- Hotel Rating badge: 5 Stars
- Quick facts strip: 41 Rooms (16 Suites + 25 Villas) · Check-in 2 PM / Check-out 12 PM · No Pets

### 5.4 Accommodations
- Section intro copy (from source: "41 exclusive accommodations...")
- 3 room-type cards, each with: image, name, size (sqm), unit count, 2–3 line description, **expandable room features list**, "Enquire" CTA that pre-fills room type in the form

**1. Ocean Hill Suite — 16 rooms, 41 sqm**
Room features: Double/Twin-size Bed · Premium Mattress & Linen · Balcony with View · Writing Desk · Smart TV · Air Conditioning · Wardrobe · Safety Deposit Box · Mini Refrigerator · Coffee Table · Full-Length Mirror · High-Speed Wi-Fi · Telephone · USB Charging Port · Luggage Rack · Bedside Reading Lamp · Bluetooth Speakers

**2. Garden Hill Pool Villa — 4 units, 47 sqm**
Room features: *not listed in source document* — only a general description ("spacious bedroom, living area, private pool overlooking rolling hills") is available. **Open question:** need the full feature list for this villa type from the hotel before this card can match the other two in detail.

**3. Ocean Hill Pool Villa — 21 units, 51 sqm**
Room features: King-size Bed · Premium Mattress & Linen · Private Terrace Deck · Plunge Pool · Outdoor Sundeck · Writing Desk · Smart TV · Air Conditioning · Wardrobe · Safety Deposit Box · Mini Refrigerator · Coffee Table · Full-Length Mirror · High-Speed Wi-Fi · Telephone · USB Charging Port · Luggage Rack · Bedside Reading Lamp · Bluetooth Speakers

- **Open question:** In Phase 1, should the full feature list show inline on each card (accordion/"show more"), or stay collapsed with only a 2–3 line description and defer the full list to the Phase 2 detail page? Recommend accordion/"show more" on the card so Phase 1 doesn't lose this detail while still keeping cards scannable — confirm before wireframing.
- Full photo galleries per room remain Phase 2 scope (Phase 1 uses one hero image per card).

### 5.5 Hotel Facilities
- Icon/grid overview of facility list: Infinity Pool & Private Pool, Restaurant (Puṇṇa), Gym, Room Service, Radha Spa Hill Penida, Yoga Pavilion, Non-Smoking Rooms, Wedding Chapel, Pool Bar, Free WiFi, Function Room, Airport & Harbor Transfer
- Optional 2–3 featured facility highlights with photo + short blurb (e.g. Infinity Pool, Puṇṇa Restaurant, Radha Spa) — pulled from the source's "Facilities Overview" section
- **Open question:** Wedding Chapel and two Experiences items (Canang Sari offering, Balinese Cooking Class) only have placeholder/lorem ipsum copy in the source. Real copy needed before this content goes live — flagging so it isn't missed during content handoff.

### 5.6 Location Section
- Address, phone, email (from source)
- Embedded map (pin at property location)
- Distance table (from source):

| Landmark | Distance | Travel Time |
|---|---|---|
| Ngurah Rai Airport | ± 65 km | 3 hours (incl. fast boat) |
| Nusa Penida Harbor | 5 km | 15–20 min |
| Kelingking Beach | ± 18 km | 45–60 min |
| Diamond Beach | ± 25 km | 60–75 min |
| Angel's Billabong | ± 17 km | 45–60 min |
| Broken Beach | ± 17 km | 45–60 min |

### 5.7 Reservation Inquiry Form (core conversion section)
**Fields:**
- Full name *(required)*
- Email *(required)*
- Phone / WhatsApp number *(required)*
- Check-in date / Check-out date *(required)*
- Number of guests *(required)*
- Preferred room type *(dropdown: Ocean Hill Suite / Garden Hill Pool Villa / Ocean Hill Pool Villa / Not sure yet)* — pre-filled if user arrived via a room card CTA (5.4)
- Message / special requests *(optional)*

**Behavior:**
- On submit: show success confirmation state (inline, not a redirect)
- Submission routes to `reservations@sankarahillpenida.com` (per source contact info)
- **Open question:** Should submissions also go into a CRM/spreadsheet, or is email-only sufficient for Phase 1? Confirm with reservations team before build.
- **Open question:** Any legal/consent requirement (e.g. data privacy checkbox) needed for the region/market this launches in?

### 5.8 Footer
- Address, phone, email, website
- Social media links (if available — not in source, confirm)
- Copyright line
- Repeat of nav links

---

## 6. Non-Functional Requirements

- **Bilingual:** Full ID/EN content parity across every section, including the form. Language switcher persists user's choice across the session.
- **Mobile-first:** Majority of traffic expected on mobile; hero, form, and nav must be fully usable on small viewports.
- **Performance:** Hero imagery/video should be optimized (lazy-load below-the-fold images) given heavy visual content.
- **Accessibility:** Standard web accessibility (alt text on images, form labels, adequate contrast) — no dedicated accessibility program requested.

---

## 7. Out of Scope (Phase 1)

- Real-time booking engine / availability calendar / payment
- Individual detail pages per room type (full amenity lists, photo galleries)
- Full Experiences/Activities section beyond a teaser
- Blog / news / press section
- Guest reviews / testimonials module (not present in source content — add later if supplied)

These are candidate Phase 2 scope items once Phase 1 validates.

---

## 8. Success Metrics

- Number of inquiry form submissions / month
- Form completion rate (started vs. submitted)
- Bounce rate on landing page
- Traffic split mobile vs. desktop (to validate mobile-first priority)

---

## 9. Constraints

- **Design starting point:** None yet — no existing Figma file or DESIGN.md. This PRD defines structure/content only; a design system needs to be created before Figma work starts (see Next Steps).
- Content for Wedding Chapel and two Experiences items is currently placeholder copy in the source document and must be finalized before launch.

---

## 10. Open Questions (summary)

- **Open question:** Floating WhatsApp CTA — always visible, or header/footer only?
- **Open question:** Room feature list display on cards — inline accordion/"show more" vs. deferred to Phase 2 detail page?
- **Open question:** Garden Hill Pool Villa room features are missing from the source document — need the full list from the hotel.
- **Open question:** Real copy needed for Wedding Chapel, Canang Sari offering, and Balinese Cooking Class sections.
- **Open question:** Form submissions — email only, or also CRM/spreadsheet integration?
- **Open question:** Data privacy consent checkbox needed on the form?
- **Open question:** Social media links for footer — not present in source, need to confirm if they exist.

---

## Next Steps

1. Resolve open questions above with stakeholders.
2. Build a `DESIGN.md` (colors, typography, spacing tokens) before Figma work begins — offered separately, not part of this PRD.
3. Wireframe (lo-fi) each section in this PRD.
4. Move to high-fidelity Figma design once wireframe + DESIGN.md are approved.

---

## Changelog
- 2026-08-10: Initial draft (standard sectioned structure).
- 2026-08-10: Added scrollytelling as an alternative structure.
- 2026-08-10: Reverted to standard sectioned structure per stakeholder preference; added full room feature lists to the Accommodations section (5.4). Garden Hill Pool Villa features flagged as missing from source.