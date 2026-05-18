---
type: scenario
id: TS-116
title: Checkout after coupon and line removal handles totals safely
story: US-105
status: active
---

## Prerequisites

- Cart with multiple lines suitable for coupon then partial removal.

## Test steps

1. Apply a large fixed coupon, then remove high-value lines until total could go negative.
2. Attempt checkout.

## Expected behaviour

- App prevents unsafe checkout or recalculates discount; no hard crash (document product decision).
