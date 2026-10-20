# Engineering contributions — Hamed Minaei

**Project:** Customer Support Workspace  
**Role:** Support-workflow design, React implementation, retrieval policy, test automation and static demo delivery  
**Portfolio:** https://github.com/hamed665

I developed this portfolio edition as an extension of Vercel Chatbot. The original foundation, copyright, license notices and Git ancestry are preserved. The work described below is my added integration and application development.

## My implementation

Multilingual inbox (EN/AR/FA), business metrics, cited retrieval and human handoff.

**Primary code:** `app/support-demo/`, `lib/support/`, support tests, static build and CI.

## Review the work

- [Implementation pull request](https://github.com/hamed665/ai-customer-support-saas/pull/1): inspect the actual added code and reviewable history.
- [Testing instructions](README.md#testing): reproduce the relevant checks.
- **Verification evidence:** 18 engine tests; Next build, TypeScript and HTTP smoke; 5 Next browser cases and 6 static browser cases.
- **Demonstration:** [Live synthetic demo](https://hamed665.github.io/ai-customer-support-saas/support-demo/).

## Engineering boundary

The hosted demo uses deterministic retrieval and browser-memory fixtures. Full backend identity, persistence, provider integration and BotID SDK license clearance remain outside its verified scope.

This is a portfolio preview. The test evidence describes the checks performed and does not establish production readiness.

## Foundation and attribution

Vercel Chatbot supplies the original project foundation. My contribution is the extension and integration scope above; I do not claim original authorship of the upstream platform, SDKs or conversion libraries. See [Attribution](README.md#attribution), the retained root license and the project's dependency-license notes for exact provenance and applicable terms.
