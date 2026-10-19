# Security and dependency review

Reviewed 2026-10-19 against upstream commit `c2f8235e1f3ea903ad8b7f61447c4f74164b5c58`. No external credentials or customer data were supplied.

## Dependency baseline

The upstream lockfile resolves 885 dependency entries in this environment. `pnpm audit --json` reports **6 critical, 32 high, 55 moderate and 12 low** advisory entries. Counts are the registry's report, not a determination that every path is exploitable. No dependencies have been silently upgraded or audit rules disabled. The added support engine has no new runtime dependency.

### Critical advisories returned by the registry

| Package | Advisory | Patched versions reported | Reference |
| --- | --- | --- | --- |
| next-auth | Auth.js: Configuration errors can cause existence-based auth checks to fail open (auth object populated with an error) | No patched version reported | https://github.com/advisories/GHSA-8fpg-xm3f-6cx3 |
| next-auth | Auth.js: Email normalizer validates the address before Unicode normalization, allowing a homoglyph @ bypass | No patched version reported | https://github.com/advisories/GHSA-7rqj-j65f-68wh |
| @auth/core | Auth.js: Email normalizer validates the address before Unicode normalization, allowing a homoglyph @ bypass | >=0.41.3 | https://github.com/advisories/GHSA-7rqj-j65f-68wh |
| next | Next.js: Unauthenticated Remote Code Execution on windows-hosted servers | >=16.3.3 | https://github.com/advisories/GHSA-p293-qw3h-jr36 |
| next | Next.js: Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used | >=16.3.3 | https://github.com/advisories/GHSA-2xp9-vwfh-vxw4 |
| next | Next.js: Remote Code Execution in next/og ImageResponse | >=16.3.6 | https://github.com/advisories/GHSA-vcvr-r3jv-pc5j |

## Current remediation result

The frozen dependency graph was refreshed with Next.js 16.4.2, next-auth 5.0.0-beta.32 / Auth.js core 0.41.3, Blob 2.8.x, KaTeX 0.18.x and documented compatible transitive patches. Current `pnpm audit --json`: **0 critical, 0 high, 3 moderate, 1 low**, 856 records. The original table above is historical baseline evidence, not the current release state. See [remediation details](DEPENDENCY_REMEDIATION.md).

Remaining findings: esbuild 0.18.20 in Drizzle migration tooling (moderate), OpenTelemetry core 1.30.1 via Vercel telemetry (moderate), postcss-selector-parser 6.0.10 via Tailwind typography (moderate), and KaTeX 0.16.47 via Streamdown math (low). Major transitive API changes were not forced merely to reduce counts. The audit gate still rejects high/critical findings.

## Release gates

1. Resolve remaining findings and review deployment-specific exploitability before using the complete upstream backend.
2. Clear BotID SDK redistribution terms and exercise original chat/storage/auth integrations with dedicated disposable services.
3. Implement server-side identity, authorization, persistence and privacy controls before introducing real data.
4. The independent static artifact is a synthetic demonstration only: allowlisted client inputs and React runtime, full applicable notices, no original server/provider SDK, and CSP `connect-src 'none'`. Static isolation does not establish backend readiness.

## License review

The repository's own LICENSE states Copyright 2024 Vercel, Inc. and Apache License 2.0. The original notice and full Git history are retained. Additions and modifications are identified in README and NOTICE; no upstream author or date was rewritten.

`pnpm licenses list --json` primarily reports MIT/Apache/ISC/BSD packages. It also reports LGPL-3.0-or-later (`@img/sharp-libvips-linux-x64`), MPL-2.0 (`lightningcss` and its native binding) and CC-BY-4.0 (`caniuse-lite`). These components keep their own notices and obligations; the root project's license does not relicense them.

Two package metadata entries originally reported **Unknown** license: `botid` and `khroma`. khroma is now verified MIT from its authoritative source, with the full notice preserved under `licenses/`; see THIRD_PARTY_NOTICES.md. BotID remains unresolved. The installed botid package has no license field or top-level LICENSE file. Treat commercial-use and redistribution clearance as unresolved; do not assume Apache permission covers BotID. This is a release blocker requiring authoritative upstream terms or removal/replacement and compatibility testing. No package tarball or node_modules is committed or redistributed.

This is an initial inventory, not a completed dependency-license clearance. See `license-inventory.json` for the generated list. No service account was created and no paid terms were accepted.

## Added code threat boundary

- Public route contains synthetic data only; it exposes no API mutation or server credential.
- Business scoping is tested in retrieval but is not an authorization control, because fixtures ship to the browser.
- User input is plain React text; no raw HTML, command execution, URL fetch, document upload or external tools are introduced.
- Agent assignment is a local state-machine invariant, not a verified identity.
- Unsupported or tied retrieval is escalated. A handoff prevents automatic replies until explicit resume.
- No model, external transport or production system has been security-tested as part of this slice.
