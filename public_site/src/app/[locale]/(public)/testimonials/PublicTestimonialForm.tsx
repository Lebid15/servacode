"use client";

/**
 * =====================================================
 * PublicTestimonialForm
 * نموذج إرسال رأي عميل من الموقع العام.
 * الرأي يبقى بانتظار مراجعة الإدارة قبل النشر.
 * =====================================================
 */

import { FormEvent, useState } from "react";

import { ApiClientError } from "@/shared/api/api-client";
import { submitCustomerTestimonial } from "@/shared/api/public-client";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import type { Locale } from "@/shared/design-system/utils/direction";

type PublicTestimonialFormProps = {
  locale: Locale;
};

function labels(locale: Locale) {
  const isAr = locale === "ar";

  return {
    title: isAr ? "أضف رأيك وتجربتك" : "Share your experience",
    description: isAr
      ? "اكتب رأيك وتقييمك للخدمة. لن يظهر الرأي مباشرة، بل تتم مراجعته من الإدارة قبل النشر."
      : "Share your testimonial and rating. It will be reviewed by the admin before being published.",
    name: isAr ? "اسمك" : "Your name",
    namePlaceholder: isAr ? "مثال: أحمد محمد" : "Example: John Smith",
    rating: isAr ? "التقييم" : "Rating",
    text: isAr ? "رأيك وتجربتك" : "Your testimonial",
    textPlaceholder: isAr ? "اكتب رأيك بوضوح عن الخدمة أو التجربة..." : "Write your experience clearly...",
    submit: isAr ? "إرسال الرأي" : "Submit testimonial",
    submitting: isAr ? "جاري الإرسال..." : "Submitting...",
    success: isAr ? "تم إرسال رأيك بنجاح، وسيظهر بعد مراجعته من الإدارة." : "Your testimonial was submitted and will be published after review.",
    failed: isAr ? "تعذر إرسال الرأي. حاول مرة أخرى." : "Could not submit your testimonial. Please try again.",
    required: isAr ? "يرجى إدخال الاسم والرأي." : "Please enter your name and testimonial.",
    reviewNote: isAr ? "ملاحظة: تتم مراجعة الآراء قبل نشرها في الموقع." : "Note: testimonials are reviewed before publication."
  };
}

export function PublicTestimonialForm({ locale }: PublicTestimonialFormProps) {
  const t = labels(locale);
  const [clientName, setClientName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!clientName.trim() || !text.trim()) {
      setMessage({ tone: "error", text: t.required });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitCustomerTestimonial({
        client_name: clientName.trim(),
        rating,
        text: text.trim(),
        website
      });

      setClientName("");
      setRating(5);
      setText("");
      setWebsite("");
      setMessage({ tone: "success", text: t.success });
    } catch (error) {
      const errorMessage = error instanceof ApiClientError ? error.message : t.failed;
      setMessage({ tone: "error", text: errorMessage || t.failed });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppCard className="relative overflow-hidden p-6 sm:p-7">
      <div className="pointer-events-none absolute -top-24 end-10 size-56 rounded-full bg-app-primary/10 blur-3xl" />
      <form className="relative grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-app-border bg-app-surfaceElevated px-3 py-1 text-xs font-black text-app-primary">
            <AppIcon name="star" size={14} />
            {t.rating}
          </span>
          <h2 className="text-2xl font-black text-app-foreground">{t.title}</h2>
          <p className="max-w-3xl text-sm leading-7 text-app-muted">{t.description}</p>
        </div>

        <input
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          name="website"
          aria-hidden="true"
        />

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
          <label className="grid gap-2 text-sm font-bold text-app-foreground">
            {t.name}
            <input
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              placeholder={t.namePlaceholder}
              maxLength={160}
              required
              className="min-h-12 rounded-appLg border border-app-border bg-app-surfaceElevated px-4 text-sm font-semibold outline-none transition focus:border-app-primary"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-app-foreground">
            {t.rating}
            <select
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="min-h-12 rounded-appLg border border-app-border bg-app-surfaceElevated px-4 text-sm font-black outline-none transition focus:border-app-primary"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {"★".repeat(value)}{" "}
                  {value}/5
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm font-bold text-app-foreground">
          {t.text}
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t.textPlaceholder}
            minLength={10}
            rows={5}
            required
            className="resize-y rounded-appLg border border-app-border bg-app-surfaceElevated px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-app-primary"
          />
        </label>

        {message ? (
          <div
            className={[
              "rounded-appLg border px-4 py-3 text-sm font-bold",
              message.tone === "success"
                ? "border-app-success/30 bg-app-success/10 text-app-success"
                : "border-app-danger/30 bg-app-danger/10 text-app-danger"
            ].join(" ")}
          >
            {message.text}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold leading-6 text-app-muted">{t.reviewNote}</p>
          <AppButton type="submit" disabled={isSubmitting} icon={<AppIcon name="message" size={17} />}>
            {isSubmitting ? t.submitting : t.submit}
          </AppButton>
        </div>
      </form>
    </AppCard>
  );
}
