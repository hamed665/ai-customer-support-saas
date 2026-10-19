# Baseline and verification

Recorded 2026-10-19. Source: `vercel/chatbot`, main at `c2f8235e1f3ea903ad8b7f61447c4f74164b5c58` (2026-07-08). Full upstream history cloned, with an independent detached worktree used to probe the original application.

## Upstream baseline

| Check | Observed result |
| --- | --- |
| Repository metadata | Public, not archived, default branch main |
| Install | Frozen lockfile install with scripts disabled succeeded; 754 installed packages, 885 lockfile entries checked |
| TypeScript before changes | `tsc --noEmit` exit 0 |
| Runtime probe on original SHA | `/ping` HTTP 200; `/` HTTP 307 to `/api/auth/guest?redirectUrl=%2F` |
| Configured external services | None; original chat login/model/database flow not tested |
| Default build command | Local tsx CLI IPC pipe rejected by runtime (`EPERM`); `node --import tsx lib/db/migrate.ts` runs and reports missing POSTGRES_URL, skipping migrations |
| Default dev command | Local network-interface enumeration fails; explicitly binding 127.0.0.1 starts successfully |
| Audit | 6 critical, 32 high, 55 moderate, 12 low registry advisory entries |

The baseline worktree initially used a node_modules symlink, which Turbopack rejected as outside the filesystem root. Repeating with a local hard-linked installation succeeded. This workaround did not modify upstream source.

## Added support workspace

| Check | Status and evidence |
| --- | --- |
| Policy tests | PASS: 18 tests, 0 failures, no external services |
| Full project typecheck | PASS: `pnpm typecheck` |
| Added files / proxy lint | PASS: Biome targeted checks |
| Optimized application build | PASS: `pnpm exec next build`; new `/support-demo` statically rendered |
| Built-server smoke | PASS: `/support-demo` HTTP 200 with expected HTML; existing `/` HTTP 307 |
| Browser tests | PASS in GitHub CI: all 5 browser cases. Local browser launch was blocked by missing Chromium. |
| Browser installation | BLOCKED: `playwright install chromium` download failed in this environment |
| Screenshots | PASS: four real viewport screenshots committed in screenshots/ and visually inspected. |
| External LLM / real operator transport | NOT IMPLEMENTED for added workspace |
| Hosted demo | NOT DEPLOYED; unresolved critical dependency / license findings |
| GitHub PR / remote CI | Published: Draft PR #1; latest implementation run 39250345600 verify job passed, dependency-security failed. |

Runtime used Node 24.19.0 and the environment-provided pnpm 11.25.0 fallback. Repository and CI pin pnpm 10.32.1; remote CI confirmed the pinned toolchain as detailed below.

The UI uses the upstream React Compiler. Its native DOM event handlers have one documented file-level Biome exception for `noJsxPropsBind`; all other targeted checks remain enabled.

## Reproduction

Run the commands in the main README. Unit tests are independent of network, database and API keys. Build may need network access to fetch the inherited Google fonts. HTTP smoke starts and terminates its own built server. Browser tests require a successful Chromium installation and produce viewport screenshots as CI artifacts. Security checks must remain blocking until dependencies are remediated.

## GitHub verification follow-up

Published as https://github.com/hamed665/ai-customer-support-saas/pull/1 (Draft). Run https://github.com/hamed665/ai-customer-support-saas/actions/runs/39249234636 completed the `verify` job successfully using pnpm 10.32.1 / Node 24.21.0, including all 18 policy tests and all 5 browser cases. Four real screenshots were downloaded from artifact 12184368401 and retained in `screenshots/`. The dependency-security job failed as expected. These results supersede the earlier local-only browser/publication blockers.

CI exposed harmless upstream auth-session requests on the public demo (MissingSecret). A route-aware provider now omits the auth provider only on the exact synthetic demo path; upstream auth pages keep it. The original upstream lint workflow also caught formatting in the new smoke script/inventory; full `pnpm check` now passes locally after correction. Latest implementation commit 43710341d87d27927407f75deef02bc82b31c3a4 was inspected: run 39250345600 verify passed; dependency-security failed. The inherited Playwright Tests workflow run 39250345648 was cancelled, and is not counted as a passing result. This follow-up changes documentation only.

## Remediation and isolated static build follow-up

The historical failures above are retained as baseline records. Current local checks: full `pnpm check`, full TypeScript check, optimized Next build, HTTP demo/root/auth regression smoke, and static build pass. Malformed bearer values %, %ZZ and an empty bearer retain authentication redirects. Frozen-graph audit now reports **0 critical / 0 high / 3 moderate / 1 low**. The high/critical CI gate remains blocking. License inventory was regenerated; khroma MIT was verified from source, BotID clearance for the full backend remains unresolved.

The static artifact contains 17 allowlisted inputs (own client/engine/fixtures and React runtime), original and runtime license notices, no backend/provider SDK, and a network-blocking CSP. New static-browser isolation coverage and deployment are not yet verified; remote results will be recorded after CI. No live model, real operator transport, production account or full upstream service integration was tested. See DEPENDENCY_REMEDIATION.md for compatibility decisions.
