// biome-ignore-all lint/performance/noJsxPropsBind: Native DOM event handlers; upstream React Compiler memoizes this small demo.
"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useState,
} from "react";
import {
  agentReply,
  type Conversation,
  claim,
  type Locale,
  metrics,
  receiveCustomer,
  requestHandoff,
  type Status,
  transition,
} from "@/lib/support/engine";
import { articles, initialConversations } from "@/lib/support/fixtures";
import { labels } from "./i18n";
import styles from "./workspace.module.css";

export function SupportWorkspace() {
  const [conversations, setConversations] = useState(initialConversations);
  const [locale, setLocale] = useState<Locale>("en");
  const [business, setBusiness] = useState("demo-shop");
  const [selectedId, setSelectedId] = useState("demo-101");
  const [filter, setFilter] = useState<Status | "all">("all");
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"customer" | "agent">("customer");
  const [error, setError] = useState("");
  const t = labels[locale];
  const scoped = conversations.filter((c) => c.businessId === business);
  const visible = scoped.filter((c) => filter === "all" || c.status === filter);
  const selected = visible.find((c) => c.id === selectedId) ?? visible[0];
  const stats = metrics(scoped);

  function update(change: (conversation: Conversation) => Conversation) {
    if (!selected) {
      return;
    }
    try {
      const next = change(selected);
      setConversations((current) =>
        current.map((c) => (c.id === selected.id ? next : c))
      );
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update conversation."
      );
    }
  }

  function select(id: string) {
    setSelectedId(id);
    setDraft("");
    setMode("customer");
    setError("");
  }

  function changeBusiness(e: ChangeEvent<HTMLSelectElement>) {
    setBusiness(e.target.value);
    setFilter("all");
    select("");
  }
  function changeLocale(e: ChangeEvent<HTMLSelectElement>) {
    setLocale(e.target.value as Locale);
  }
  function resetDemo() {
    setConversations(initialConversations());
    setFilter("all");
    select("");
  }
  function changeFilter(e: ChangeEvent<HTMLSelectElement>) {
    setFilter(e.target.value as Status | "all");
    select("");
  }
  function selectConversation(e: MouseEvent<HTMLButtonElement>) {
    select(e.currentTarget.dataset.id ?? "");
  }
  function changeReplyLocale(e: ChangeEvent<HTMLSelectElement>) {
    update((c) => ({ ...c, locale: e.target.value as Locale }));
  }
  function handoff() {
    update(requestHandoff);
  }
  function claimConversation() {
    update((c) => claim(c, "Demo Agent"));
  }
  function resolveConversation() {
    update((c) => transition(c, "resolve"));
    setMode("customer");
  }
  function resumeConversation() {
    update((c) => transition(c, "resume"));
    setMode("customer");
  }
  function changeMode(e: ChangeEvent<HTMLSelectElement>) {
    setMode(e.target.value as "customer" | "agent");
  }
  function changeDraft(e: ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value);
  }
  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update((c) =>
      mode === "agent"
        ? agentReply(c, "Demo Agent", draft)
        : receiveCustomer(c, draft, articles)
    );
    setDraft("");
  }

  return (
    <main
      className={styles.workspace}
      dir={locale === "en" ? "ltr" : "rtl"}
      lang={locale}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>HAMED MINAEI / PORTFOLIO 01</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className={styles.controls}>
          <label>
            {t.business}
            <select onChange={changeBusiness} value={business}>
              <option value="demo-shop">Demo Shop</option>
              <option value="demo-studio">Demo Studio</option>
            </select>
          </label>
          <label>
            {t.language}
            <select onChange={changeLocale} value={locale}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="fa">فارسی</option>
            </select>
          </label>
        </div>
      </header>
      <div className={styles.notice}>
        {t.demo}
        <button onClick={resetDemo} type="button">
          {t.reset}
        </button>
      </div>
      <section aria-label={t.title} className={styles.metrics}>
        {(Object.keys(stats) as (keyof typeof stats)[]).map((key) => (
          <div key={key}>
            <span>{t[key]}</span>
            <strong>{stats[key]}</strong>
          </div>
        ))}
      </section>
      <div className={styles.columns}>
        <aside className={styles.inbox}>
          <h2>{t.inbox}</h2>
          <label className={styles.filter}>
            {t.inbox}
            <select onChange={changeFilter} value={filter}>
              <option value="all">{t.all}</option>
              {(["automated", "waiting", "human", "resolved"] as Status[]).map(
                (s) => (
                  <option key={s} value={s}>
                    {t[s]}
                  </option>
                )
              )}
            </select>
          </label>
          {visible.length === 0 && <p role="status">{t.noResults}</p>}
          {visible.map((c) => (
            <button
              aria-pressed={selected?.id === c.id}
              className={styles.conversation}
              data-id={c.id}
              key={c.id}
              onClick={selectConversation}
              type="button"
            >
              <strong>{c.customer}</strong>
              <span>
                {c.id} · {c.locale.toUpperCase()}
              </span>
              <span>{t[c.status]}</span>
            </button>
          ))}
        </aside>
        <section aria-label={t.inbox} className={styles.thread}>
          {selected ? (
            <>
              <div className={styles.threadHeader}>
                <h2>{selected.customer}</h2>
                <span>{t[selected.status]}</span>
              </div>
              <div className={styles.actions}>
                <label>
                  {t.conversationLanguage}
                  <select onChange={changeReplyLocale} value={selected.locale}>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                    <option value="fa">فارسی</option>
                  </select>
                </label>
                {selected.status === "automated" && (
                  <button onClick={handoff} type="button">
                    {t.handoff}
                  </button>
                )}
                {selected.status === "waiting" && (
                  <button onClick={claimConversation} type="button">
                    {t.claim}
                  </button>
                )}
                {selected.status !== "resolved" && (
                  <button onClick={resolveConversation} type="button">
                    {t.resolve}
                  </button>
                )}
                {selected.status !== "automated" && (
                  <button onClick={resumeConversation} type="button">
                    {t.resume}
                  </button>
                )}
              </div>
              <ol
                aria-live="polite"
                aria-relevant="additions"
                className={styles.messages}
                dir={selected.locale === "en" ? "ltr" : "rtl"}
                lang={selected.locale}
              >
                {selected.messages.length === 0 && (
                  <li className={styles.empty}>{t.empty}</li>
                )}
                {selected.messages.map((m) => (
                  <li data-role={m.role} key={m.id}>
                    <span className={styles.role}>{t.role[m.role]}</span>
                    <p>{m.text}</p>
                    {m.sourceIds.map((id) => (
                      <a href={`#source-${id}`} key={id}>
                        {t.sources}:{" "}
                        {
                          articles.find((a) => a.id === id)?.title[
                            selected.locale
                          ]
                        }
                      </a>
                    ))}
                  </li>
                ))}
              </ol>
              <form className={styles.composer} onSubmit={sendMessage}>
                <label>
                  {t.message}
                  <select onChange={changeMode} value={mode}>
                    <option value="customer">{t.customer}</option>
                    <option
                      disabled={selected.status !== "human"}
                      value="agent"
                    >
                      {t.agent}
                    </option>
                  </select>
                </label>
                <textarea
                  aria-label={t.message}
                  disabled={selected.status === "resolved"}
                  maxLength={2000}
                  onChange={changeDraft}
                  required
                  rows={3}
                  value={draft}
                />
                {Boolean(error) && <p role="alert">{error}</p>}
                <button
                  className={styles.primary}
                  disabled={
                    !draft.trim() ||
                    selected.status === "resolved" ||
                    (mode === "agent" && selected.status !== "human")
                  }
                  type="submit"
                >
                  {t.send}
                </button>
              </form>
            </>
          ) : (
            <p className={styles.empty}>{t.noResults}</p>
          )}
        </section>
        <aside className={styles.knowledge}>
          <h2>{t.knowledge}</h2>
          {articles
            .filter((a) => a.businessId === business)
            .map((a) => (
              <article id={`source-${a.id}`} key={a.id} tabIndex={-1}>
                <h3>{a.title[locale]}</h3>
                <p>{a.answer[locale]}</p>
                <small>
                  demo://{a.businessId}/{a.id}
                </small>
              </article>
            ))}
        </aside>
      </div>
    </main>
  );
}
