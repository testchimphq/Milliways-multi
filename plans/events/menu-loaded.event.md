---
title: menu-loaded
description: Fires after the menu API returns successfully and sections are shown on the Menu screen (happy path only; not emitted on load errors).
added-on: 2026-05-11
significance: 4
---

## Rationale

**Runtime emit title (exact, for TrueCoverage):** `menu_loaded` — emitted from `MenuView.loadMenu()` in `MenuView.swift` after `APIClient.shared.fetchMenu()` succeeds.

This captures the moment the user can browse purchasable items. It pairs **menu breadth** (section count bucket) with **cart state** (line item count bucket) so TrueCoverage can highlight drop-offs between “menu available” and checkout, and compare production vs automation coverage for common cart/menu combinations.

**Questions we want TrueCoverage to answer:** For sessions that reach `menu_loaded`, what `cart.line_item_count_bucket` distributions appear before `order_submitted_success`? Are high line-item buckets under-tested in SmartTests?

**Business criticality:** Menu discovery is core to the ordering funnel; missing coverage here means blind spots on catalog load and early abandonment.

**Requirement links:** Aligns with `plans/stories/menu/menu-discovery.md`, `plans/scenarios/menu/main-dishes-listed.md`, `plans/scenarios/menu/shipping-disclaimer.md`, and broader order stories under `plans/stories/orders/`.

## Metadata keys

| Key | Meaning | Allowed values |
|-----|---------|----------------|
| `menu.section_count_bucket` | Number of menu sections returned | `0`, `1`, `2_5`, `6_plus` (from `MilliwaysRum.menuSectionCountBucket`) |
| `cart.line_item_count_bucket` | Distinct line items in cart when menu loaded | `0`, `1`, `2_5`, `6_plus` (from `MilliwaysRum.lineItemCountBucket`) |
| `platform` | Client platform | `ios` |

Buckets are low-cardinality by design; no SKU or item IDs are emitted.
