---
type: scenario
id: TS-103
title: Add multiple quantities from menu list updates price
story: US-100
status: active
---

## Prerequisites

- Signed-in user on menu.

## Test steps

1. Add the same menu item multiple times using + on list/detail flow (per app UX).
2. Confirm footer shows expected item count and monetary total.
3. Open cart and verify line breakdown (e.g. N × unit price).

## Expected behaviour

- Quantity and price scale correctly for repeated adds.
