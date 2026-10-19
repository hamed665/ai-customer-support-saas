# Dependency remediation — 2026-10-19

## Scope

The original frozen dependency audit was repeated before changes. Its current
registry snapshot reported 6 critical, 37 high, 58 moderate and 13 low entries
across 886 dependency records. The earlier verification record has a different
snapshot; advisory databases and resolved optional records can change.

This patch upgrades Next.js to 16.4.2 and next-auth to 5.0.0-beta.32, including its
patched Auth.js core. Vercel Blob is migrated from 0.24.x to 2.8.x so its HTTP
client can resolve supported security updates. Direct KaTeX CSS is upgraded to
0.18.x. Other updates remain within their declared dependency ranges, unless an
explicit security override is documented here in the final verification record.

The removed `experimental.appNewScrollHandler` setting is no longer accepted by
the installed Next.js configuration type. Other supported settings remain.

## Authentication regression checks

The built-server smoke now supplies a dedicated synthetic signing secret and
checks malformed `Bearer %`, `Bearer %ZZ` and empty bearer values against a
protected API path. Each request must retain the authentication redirect rather
than execute the API or return an uncaught URI decoding error. No valid user
session, database, model or external storage service is used.

## Workflow boundaries

The automatic Support workspace workflow continues to run engine tests, full
project type checking, targeted lint, optimized build, HTTP smoke, real browser
regressions and the high/critical security gate.

The inherited full chat E2E workflow is now manual-only. It previously ran without
its required external services and did not provide a passing integration result.
Manual dispatch requires explicit confirmation that the configured authentication,
PostgreSQL, Blob and Redis credentials belong to disposable test services. The
workflow fails preflight if configuration is absent; it never treats missing
services as a passing test. Node 24 and pnpm 10.32.1 are pinned consistently and
cache actions use the supported v4 line. This change does not claim full original
chat/provider integration has been verified.

## License review

See [third-party notices](THIRD_PARTY_NOTICES.md). khroma's source MIT license was
verified and preserved despite absent package metadata. botid's SDK redistribution
clearance remains unresolved. No public deployment or service activation follows
from a passing package audit.

## Compatibility and final local evidence

- AI SDK provider 4.0.2 and telemetry adapter 1.0.15 retain the existing ai 7.0.15 / React adapter 4.0.16 contract. Newer transitive copies produced incompatible JSON value / telemetry signatures; no SDK behavior is hidden behind type casts.
- Ultracite remains 7.9.0: updating to 7.12.4 introduced an unpatched high-severity braces path. Existing full lint checks remain enabled.
- Explicit overrides patch Kysely to 0.28.17 and scope ws 8.21.0 to @vercel/functions and @vercel/postgres. They retain their existing major API lines.
- Reasoning content derives props directly from Streamdown, matching the actual forwarded component instead of promising unsupported generic div event props.
- Audit: 0 critical, 0 high, 3 moderate, 1 low across 856 dependency records. Remaining paths are listed in SECURITY_REVIEW.md; no audit exclusion was introduced.
- Full lint, TypeScript, optimized Next build and built-server HTTP/auth regressions pass locally. The static build passes its 17-input allowlist. Browser verification of the new static artifact is pending remote CI.

Static hosting is a separate build of the actual support workspace, not a screen mock. Only its own client/engine/fixtures and React runtime enter the artifact. No authentication, BotID, AI, database or storage SDK enters the bundle. Third-party runtime licenses and the original Apache license/NOTICE accompany it. New browser coverage asserts blocked backend connections, no cookies/local storage and reset after reload. Hosting remains unverified until its deployment succeeds.
