---
type: scenario
id: TS-100
title: Add menu item and change quantity before checkout
story: US-100
status: active
---

## Prerequisites

- Seeded user signed in; app on welcome or home flow.

## Test steps

1. Open New Order and reach the main menu.
2. Open an item detail, increase and decrease quantity with +/−, then add to order.
3. Open cart and verify line totals match quantity and unit price.

## Expected behaviour

- Quantities and footer/cart prices stay consistent through detail and cart views.
