/** Deterministic support policy, shared by the synthetic UI and tests. No network IO. */
export type Locale = "en" | "ar" | "fa";
export type Status = "automated" | "waiting" | "human" | "resolved";
export type KnowledgeArticle = {
  id: string;
  businessId: string;
  title: Record<Locale, string>;
  answer: Record<Locale, string>;
  keywords: string[];
};
export type Message = {
  id: string;
  role: "customer" | "assistant" | "agent" | "system";
  text: string;
  sourceIds: string[];
};
export type Conversation = {
  id: string;
  businessId: string;
  customer: string;
  locale: Locale;
  status: Status;
  agent: string | null;
  messages: Message[];
};

export const copy = {
  ar: {
    fallback: "لم أجد إجابة موثوقة. سيراجع أحد الموظفين طلبك.",
    handoff: "سيتم تحويلك إلى موظف. تم إيقاف الردود الآلية.",
    resolved: "تم إغلاق المحادثة.",
    resumed: "تم استئناف الردود الآلية.",
  },
  en: {
    fallback:
      "I could not find a reliable answer. A human agent will review this.",
    handoff: "A human agent will take over. Automated replies are paused.",
    resolved: "Conversation resolved.",
    resumed: "Automated support resumed.",
  },
  fa: {
    fallback: "پاسخ مطمئنی پیدا نکردم. یک کارشناس درخواست شما را بررسی می‌کند.",
    handoff: "مکالمه به کارشناس ارجاع شد. پاسخ خودکار متوقف است.",
    resolved: "مکالمه بسته شد.",
    resumed: "پاسخ خودکار فعال شد.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064B-\u065F\u0670]/g, "");
}

/** Exact normalized token overlap; no generated answers and no semantic-search claims. */
export function retrieve(
  query: string,
  businessId: string,
  articles: KnowledgeArticle[]
) {
  const tokens = new Set(normalize(query).match(/[\p{L}\p{N}]+/gu) ?? []);
  return articles
    .filter((article) => article.businessId === businessId)
    .map((article) => {
      const terms = new Set(
        normalize(article.keywords.join(" ")).match(/[\p{L}\p{N}]+/gu) ?? []
      );
      const score = [...tokens].filter((token) => terms.has(token)).length;
      return { article, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) => b.score - a.score || a.article.id.localeCompare(b.article.id)
    );
}

function append(
  conversation: Conversation,
  role: Message["role"],
  text: string,
  sourceIds: string[] = []
): Conversation {
  return {
    ...conversation,
    messages: [
      ...conversation.messages,
      {
        id: `${conversation.id}-${conversation.messages.length + 1}`,
        role,
        sourceIds,
        text,
      },
    ],
  };
}

function validateText(text: string) {
  if (!text.trim() || text.length > 2000) {
    throw new Error("Message must contain 1–2000 characters.");
  }
}

export function requestHandoff(conversation: Conversation): Conversation {
  if (conversation.status === "resolved") {
    throw new Error("Reopen the conversation first.");
  }
  if (conversation.status !== "automated") {
    return conversation;
  }
  return append(
    { ...conversation, status: "waiting" },
    "system",
    copy[conversation.locale].handoff
  );
}

export function receiveCustomer(
  conversation: Conversation,
  text: string,
  articles: KnowledgeArticle[]
): Conversation {
  validateText(text);
  if (conversation.status === "resolved") {
    throw new Error("Reopen the conversation first.");
  }
  const next = append(conversation, "customer", text.trim());
  // Never reply automatically after a handoff, even if knowledge matches.
  if (conversation.status !== "automated") {
    return next;
  }
  const handoffTerms = [
    "human",
    "agent",
    "complaint",
    "refund",
    "موظف",
    "شكوى",
    "شکوی",
    "استرجاع",
    "کارشناس",
    "شکایت",
    "بازپرداخت",
  ];
  const normalized = normalize(text);
  if (handoffTerms.some((term) => normalized.includes(normalize(term)))) {
    return requestHandoff(next);
  }
  const matches = retrieve(text, conversation.businessId, articles);
  // Ambiguous equal-ranking articles are escalated instead of guessing.
  if (!matches[0] || matches[0].score === matches[1]?.score) {
    return append(
      { ...next, status: "waiting" },
      "assistant",
      copy[conversation.locale].fallback
    );
  }
  return append(
    next,
    "assistant",
    matches[0].article.answer[conversation.locale],
    [matches[0].article.id]
  );
}

export function claim(conversation: Conversation, agent: string): Conversation {
  validateText(agent);
  if (conversation.status !== "waiting") {
    throw new Error("Only waiting conversations can be claimed.");
  }
  return { ...conversation, agent: agent.trim(), status: "human" };
}

export function agentReply(
  conversation: Conversation,
  agent: string,
  text: string
): Conversation {
  validateText(text);
  if (conversation.status !== "human" || conversation.agent !== agent) {
    throw new Error("Only the assigned agent can reply.");
  }
  return append(conversation, "agent", text.trim());
}

export function transition(
  conversation: Conversation,
  action: "resolve" | "resume"
): Conversation {
  if (action === "resolve") {
    if (conversation.status === "resolved") {
      return conversation;
    }
    return append(
      { ...conversation, agent: null, status: "resolved" },
      "system",
      copy[conversation.locale].resolved
    );
  }
  if (conversation.status === "automated") {
    return conversation;
  }
  return append(
    { ...conversation, agent: null, status: "automated" },
    "system",
    copy[conversation.locale].resumed
  );
}

export function metrics(conversations: Conversation[]) {
  return {
    citedAnswers: conversations
      .flatMap((c) => c.messages)
      .filter((m) => m.role === "assistant" && m.sourceIds.length > 0).length,
    human: conversations.filter((c) => c.status === "human").length,
    resolved: conversations.filter((c) => c.status === "resolved").length,
    total: conversations.length,
    waiting: conversations.filter((c) => c.status === "waiting").length,
  };
}
