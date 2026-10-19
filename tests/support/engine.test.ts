import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentReply,
  claim,
  metrics,
  normalize,
  receiveCustomer,
  requestHandoff,
  retrieve,
  transition,
} from "../../lib/support/engine";
import { articles, initialConversations } from "../../lib/support/fixtures";

test("retrieval is scoped to business, including identical keywords in another tenant", () => {
  const foreign = {
    ...articles[0],
    businessId: "foreign-business",
    id: "private-policy",
  };
  assert.deepEqual(
    retrieve("delivery", "demo-shop", [...articles, foreign]).map(
      (r) => r.article.id
    ),
    ["delivery"]
  );
  assert.deepEqual(retrieve("delivery", "demo-studio", articles), []);
});

for (const [locale, question] of [
  ["en", "What are your delivery options?"],
  ["ar", "التوصيل"],
  ["fa", "ارسال"],
] as const) {
  test(`${locale}: returns localized knowledge with a citation`, () => {
    const c = { ...initialConversations()[0], locale };
    const result = receiveCustomer(c, question, articles);
    assert.equal(result.messages.at(-1)?.text, articles[0].answer[locale]);
    assert.deepEqual(result.messages.at(-1)?.sourceIds, ["delivery"]);
    assert.equal(result.status, "automated");
    assert.equal(c.messages.length, 0, "input must not be mutated");
  });
}

test("Arabic orthographic variants normalize consistently", () => {
  assert.equal(normalize("إِرْسَال ك ي"), normalize("ارسال ک ی"));
});

test("unknown knowledge escalates, with no fabricated citation", () => {
  const result = receiveCustomer(
    initialConversations()[0],
    "quantum telescope",
    articles
  );
  assert.equal(result.status, "waiting");
  assert.deepEqual(result.messages.at(-1)?.sourceIds, []);
});

test("equally ranked conflicting knowledge escalates", () => {
  const result = receiveCustomer(
    initialConversations()[0],
    "delivery hours",
    articles
  );
  assert.equal(result.status, "waiting");
  assert.deepEqual(result.messages.at(-1)?.sourceIds, []);
});

for (const text of [
  "I want a human",
  "refund delivery",
  "أريد موظف",
  "شكوى",
  "کارشناس می‌خواهم",
  "شکایت",
]) {
  test(`sensitive request hands off before retrieval: ${text}`, () => {
    assert.equal(
      receiveCustomer(initialConversations()[0], text, articles).status,
      "waiting"
    );
  });
}

test("handoff is idempotent and suppresses replies throughout human ownership", () => {
  const waiting = requestHandoff(initialConversations()[0]);
  assert.deepEqual(requestHandoff(waiting), waiting);
  const pending = receiveCustomer(waiting, "delivery", articles);
  assert.equal(pending.messages.length, waiting.messages.length + 1);
  const assigned = claim(pending, "Demo Agent");
  const next = receiveCustomer(assigned, "hours", articles);
  assert.equal(next.messages.at(-1)?.role, "customer");
  assert.throws(() => agentReply(next, "Someone Else", "Hi"), /assigned/);
  const replied = agentReply(next, "Demo Agent", "I am reviewing this.");
  assert.equal(replied.messages.at(-1)?.role, "agent");
  assert.equal(replied.status, "human");
});

test("invalid state transitions are rejected and resolve/resume preserves transcript", () => {
  const [base] = initialConversations();
  assert.throws(() => claim(base, "Agent"), /waiting/);
  assert.throws(() => agentReply(base, "Agent", "Hi"), /assigned/);
  const done = transition(receiveCustomer(base, "hours", articles), "resolve");
  assert.equal(done.status, "resolved");
  assert.deepEqual(transition(done, "resolve"), done);
  assert.throws(() => receiveCustomer(done, "hello", articles), /Reopen/);
  assert.throws(() => requestHandoff(done), /Reopen/);
  const reopened = transition(done, "resume");
  assert.equal(reopened.status, "automated");
  assert.equal(reopened.agent, null);
  assert.deepEqual(
    reopened.messages.slice(0, done.messages.length),
    done.messages
  );
});

test("blank and oversized input cannot modify conversations", () => {
  const [c] = initialConversations();
  for (const text of ["  ", "x".repeat(2001)]) {
    assert.throws(() => receiveCustomer(c, text, articles), /1–2000/);
  }
  assert.throws(() => claim(requestHandoff(c), ""), /1–2000/);
  assert.equal(c.messages.length, 0);
});

test("HTML-like user input is stored as data, with no executable rendering", () => {
  const result = receiveCustomer(
    initialConversations()[0],
    '<script>alert("demo")</script>',
    articles
  );
  assert.equal(result.messages[0].text, '<script>alert("demo")</script>');
  assert.equal(result.status, "waiting");
});

test("dashboard counts derive from actual state changes", () => {
  const conversations = initialConversations();
  assert.deepEqual(metrics(conversations), {
    citedAnswers: 0,
    human: 0,
    resolved: 0,
    total: 3,
    waiting: 1,
  });
  conversations[0] = receiveCustomer(conversations[0], "delivery", articles);
  conversations[1] = claim(conversations[1], "Agent");
  assert.deepEqual(metrics(conversations), {
    citedAnswers: 1,
    human: 1,
    resolved: 0,
    total: 3,
    waiting: 0,
  });
});
