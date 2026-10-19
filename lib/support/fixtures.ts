import type { Conversation, KnowledgeArticle } from "./engine";

// Entirely fictional businesses, policies and customers. No Smart Visions data.
export const articles: KnowledgeArticle[] = [
  {
    answer: {
      ar: "يوصل متجر العرض خلال يومين إلى ثلاثة أيام عمل. تكلفة التوصيل وحدتان تجريبيتان.",
      en: "Demo Shop delivers in 2–3 business days. Delivery costs 2 demo credits.",
      fa: "فروشگاه نمونه طی ۲ تا ۳ روز کاری ارسال می‌کند. هزینه ارسال ۲ اعتبار نمایشی است.",
    },
    businessId: "demo-shop",
    id: "delivery",
    keywords: ["delivery shipping deliver توصيل التوصيل شحن ارسال تحویل"],
    title: { ar: "سياسة التوصيل", en: "Delivery policy", fa: "شرایط ارسال" },
  },
  {
    answer: {
      ar: "متجر العرض مفتوح من الأحد إلى الخميس، من ٩ صباحاً إلى ٥ مساءً بتوقيت UTC.",
      en: "Demo Shop is open Sunday–Thursday, 09:00–17:00 (UTC).",
      fa: "فروشگاه نمونه یکشنبه تا پنجشنبه از ساعت ۹ تا ۱۷ به وقت UTC باز است.",
    },
    businessId: "demo-shop",
    id: "hours",
    keywords: ["hours opening open time ساعات دوام مفتوح ساعت کاری"],
    title: { ar: "ساعات العمل", en: "Opening hours", fa: "ساعات کاری" },
  },
  {
    answer: {
      ar: "يجب حجز موعد الاستوديو التجريبي قبل يوم واحد.",
      en: "Demo Studio appointments must be booked one day in advance.",
      fa: "نوبت استودیوی نمونه باید یک روز زودتر رزرو شود.",
    },
    businessId: "demo-studio",
    id: "appointment",
    keywords: ["booking appointment حجز موعد رزرو نوبت"],
    title: { ar: "سياسة الحجز", en: "Booking policy", fa: "شرایط رزرو" },
  },
];

export function initialConversations(): Conversation[] {
  return [
    {
      agent: null,
      businessId: "demo-shop",
      customer: "Demo customer A",
      id: "demo-101",
      locale: "en",
      messages: [],
      status: "automated",
    },
    {
      agent: null,
      businessId: "demo-shop",
      customer: "عميل تجريبي ب",
      id: "demo-102",
      locale: "ar",
      messages: [
        {
          id: "demo-102-1",
          role: "customer",
          sourceIds: [],
          text: "أريد التحدث مع موظف",
        },
      ],
      status: "waiting",
    },
    {
      agent: null,
      businessId: "demo-studio",
      customer: "مشتری نمونه ج",
      id: "demo-201",
      locale: "fa",
      messages: [],
      status: "automated",
    },
  ];
}
