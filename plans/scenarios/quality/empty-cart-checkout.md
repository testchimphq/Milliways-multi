---
type: scenario
id: TS-113
title: Empty cart checkout behavior
story: US-105
status: active
---

## Prerequisites

- Menu reachable; cart has zero items.

## Test steps

1. Open cart from empty state.
2. Attempt Place Order if enabled.

## Expected behaviour

- App does not crash; user receives a blocked flow or safe empty-state handling (document product decision).
