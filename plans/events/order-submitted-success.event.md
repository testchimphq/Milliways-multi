---
title: order-submitted-success
description: Fires immediately after the backend accepts an order (successful `submitOrder` / create order API) and before the delivery UI is shown.
added-on: 2026-05-11
significance: 5
---

## Rationale

**Runtime emit title (exact, for TrueCoverage):** `order_submitted_success` — emitted from `OrderView.placeOrder()` in `OrderView.swift` after `orderManager.submitOrder(token:)` succeeds.

This is the primary **conversion** signal for the ordering journey: payment processing log line is diagnostic only; the emit marks committed order creation. Metadata captures cart size bucket and whether a coupon was applied so TrueCoverage can compare completion rates and coupon slices without leaking codes (only boolean `order.has_coupon`).

**Questions we want TrueCoverage to answer:** Do `order.has_coupon=true` sessions show different follow-on behavior? Are large carts (`6_plus`) rare in production but missing from automated coverage?

**Business criticality:** Directly reflects successful transactions; highest priority for funnel depth and regression detection.

**Requirement links:** Maps to `plans/stories/orders/order-food.md`, `plans/scenarios/orders/submit-order-delivery.md`, coupon scenarios under `plans/scenarios/promotions/`, and post-submit navigation such as `plans/scenarios/navigation/cart-cleared-after-order.md`.

## Metadata keys

| Key | Meaning | Allowed values |
|-----|---------|----------------|
| `cart.line_item_count_bucket` | Distinct line items at submit time | `0`, `1`, `2_5`, `6_plus` |
| `order.has_coupon` | Whether a coupon was applied before submit | `true`, `false` (string values as emitted) |
| `platform` | Client platform | `ios` |

Coupon **codes** are not emitted—only the boolean slice. No order IDs or user identifiers.
