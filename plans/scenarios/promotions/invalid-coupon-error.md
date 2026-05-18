---
type: scenario
id: TS-108
title: Invalid coupon code shows error message
story: US-102
status: active
---

## Prerequisites

- Cart has at least one item.

## Test steps

1. Open cart, enter a known-invalid code (e.g. ZAPHOD), apply.

## Expected behaviour

- User sees an invalid coupon message; cart totals remain sensible.
