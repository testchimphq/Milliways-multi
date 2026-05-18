---
type: scenario
id: TS-102
title: Multi-item cart totals are accurate
story: US-100
status: active
---

## Prerequisites

- Signed-in user on menu.

## Test steps

1. Add several different menu items without changing per-item quantity beyond defaults.
2. Verify sticky footer item count and total.
3. Open cart and verify the grand total matches the sum of lines.

## Expected behaviour

- Totals match the combination of item prices shown in the cart.
