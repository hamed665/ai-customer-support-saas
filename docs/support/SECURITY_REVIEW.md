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

## Release gates

1. Upgrade affected Next.js and transitive libraries using current advisory guidance and rerun full compatibility tests.
2. Resolve Auth.js beta findings; the audit reports no patched next-auth version for some findings. The demo's exact public-route exception does not resolve authentication-library vulnerabilities elsewhere in the application.
3. Rerun package audits after remediation. The CI security job intentionally fails for unresolved high/critical advisories.
4. Review deployment-specific exploitability and configure only disposable services before any upstream integration test.
5. Implement server-side identity, authorization and persistence before replacing synthetic fixtures with any real data.

## License review

The repository's own LICENSE states Copyright 2024 Vercel, Inc. and Apache License 2.0. The original notice and full Git history are retained. Additions and modifications are identified in README and NOTICE; no upstream author or date was rewritten.

`pnpm licenses list --json` primarily reports MIT/Apache/ISC/BSD packages. It also reports LGPL-3.0-or-later (`@img/sharp-libvips-linux-x64`), MPL-2.0 (`lightningcss` and its native binding) and CC-BY-4.0 (`caniuse-lite`). These components keep their own notices and obligations; the root project's license does not relicense them.

Two package metadata entries have **Unknown** license: `botid` and `khroma`. The installed botid package has no license field or top-level LICENSE file. Treat commercial-use and redistribution clearance as unresolved; do not assume Apache permission covers these packages. This is a release blocker requiring authoritative upstream terms or removal/replacement and compatibility testing. No package tarball or node_modules is committed or redistributed.

This is an initial inventory, not a completed dependency-license clearance. See `license-inventory.json` for the generated list. No service account was created and no paid terms were accepted.

## Added code threat boundary

- Public route contains synthetic data only; it exposes no API mutation or server credential.
- Business scoping is tested in retrieval but is not an authorization control, because fixtures ship to the browser.
- User input is plain React text; no raw HTML, command execution, URL fetch, document upload or external tools are introduced.
- Agent assignment is a local state-machine invariant, not a verified identity.
- Unsupported or tied retrieval is escalated. A handoff prevents automatic replies until explicit resume.
- No model, external transport or production system has been security-tested as part of this slice.
