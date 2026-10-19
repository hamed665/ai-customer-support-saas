Adds a synthetic customer-support workspace at `/support-demo` on top of Vercel Chatbot, preserving its original code and history. Users can switch English/Arabic/Persian interfaces, retrieve business-scoped policy answers with citations, hand off a conversation, claim it as a simulated agent, reply manually, resolve, and resume automation.

Validation: 18 policy tests pass; full TypeScript, targeted Biome checks, optimized build and built-server HTTP smoke pass locally. Five browser cases are present but blocked locally by the unavailable Chromium binary. Remote CI has not run.

This is a portfolio prototype. Added data is fictional and in browser memory. It is not integrated with upstream LLM chat or durable operator transport. Inherited dependency audit reports 6 critical and 32 high entries; unresolved package license metadata is documented. Security CI is intentionally blocking. Do not merge or deploy as production-ready without remediation and browser verification.

See README, docs/support/VERIFICATION.md, docs/support/SECURITY_REVIEW.md and NOTICE for attribution, reproducible commands and limitations.
