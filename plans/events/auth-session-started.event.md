---
title: auth-session-started
description: Fires after a successful sign-in or sign-up when a demo auth session is established (not on sign-out or failed auth).
added-on: 2026-05-11
significance: 4
---

## Rationale

**Runtime emit title (exact, for TrueCoverage):** `auth_session_started` — passed to `MilliwaysRum.emit` in `SessionManager.swift` after `authenticate` succeeds.

This marks the start of an authenticated session for the Milliways demo app. It is the natural funnel entry for anything that requires a token (cart persistence in-session, order submission). Instrumenting here (rather than on every keystroke in the auth form) keeps volume low and cardinality bounded while still separating **sign-in** vs **sign-up** acquisition paths via metadata.

**Questions we want TrueCoverage to answer:** Do sign-ups vs sign-ins differ in downstream completion (e.g. `menu_loaded` → `order_submitted_success`)? Are automated tests exercising both `entry.auth_kind` slices under `automationEmitsOnly` coverage?

**Business criticality:** Session establishment gates ordering and account-scoped flows; gaps here indicate broken activation or under-tested auth paths.

**Requirement links:** Relates to account and order journeys — see `plans/stories/account/my-account.md`, `plans/stories/orders/order-food.md`, and scenarios under `plans/scenarios/account/` and `plans/scenarios/orders/` that depend on being signed in. Add `#US-…` / `#TS-…` links when those IDs exist in TestChimp.

## Metadata keys

| Key | Meaning | Allowed values |
|-----|---------|----------------|
| `entry.auth_kind` | How the session was started | `sign_in`, `sign_up` (matches `AuthKind.rawValue` in iOS) |
| `platform` | Client platform (merged by `MilliwaysRum.emit`) | `ios` |

No user identifiers or free-text emails are emitted.
