"use client";

/**
 * =====================================================
 * ContactForm
 * نموذج التواصل العام مرتبط بـ Public API
 * =====================================================
 */

import { FormEvent, useState } from "react";

import { submitContactMessage } from "@/shared/api/public-client";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppTextarea } from "@/shared/design-system/components/AppTextarea";
import type { Locale } from "@/shared/design-system/utils/direction";
import { contactSchema, zodFieldErrors } from "@/shared/public/form-validation";

type ContactFormProps = {
  locale: Locale;
  labels: {
    title: string;
    description: string;
    fullName: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
    submit: string;
    loading: string;
    success: string;
    error: string;
    privacyNote: string;
  };
};

type ContactValues = {
  full_name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

export function ContactForm({ locale, labels }: ContactFormProps) {
  const [values, setValues] = useState({
    full_name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
    website: ""
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ContactValues, string>>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (key: keyof ContactValues, value: string) => {
    setStatus("idle");
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setFieldErrors({});

    const parsed = contactSchema(locale).safeParse(values);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors<keyof ContactValues>(parsed.error));
      setIsSubmitting(false);
      return;
    }

    if (parsed.data.website) {
      setStatus("success");
      setValues({ full_name: "", phone: "", email: "", subject: "", message: "", website: "" });
      setIsSubmitting(false);
      return;
    }

    try {
      await submitContactMessage(parsed.data);
      setStatus("success");
      setValues({ full_name: "", phone: "", email: "", subject: "", message: "", website: "" });
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppCard className="p-6 md:p-7">
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <input
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => setValue("website", event.target.value)}
        />

        <div className="grid gap-2">
          <h2 className="text-2xl font-black">{labels.title}</h2>
          <p className="leading-7 text-app-muted">{labels.description}</p>
        </div>

        <AppInput
          label={labels.fullName}
          value={values.full_name}
          onChange={(event) => setValue("full_name", event.target.value)}
          error={fieldErrors.full_name}
          required
          autoComplete="name"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <AppInput
            label={labels.phone}
            value={values.phone}
            onChange={(event) => setValue("phone", event.target.value)}
            error={fieldErrors.phone}
            autoComplete="tel"
          />
          <AppInput
            label={labels.email}
            value={values.email}
            onChange={(event) => setValue("email", event.target.value)}
            error={fieldErrors.email}
            type="email"
            autoComplete="email"
          />
        </div>

        <AppInput
          label={labels.subject}
          value={values.subject}
          onChange={(event) => setValue("subject", event.target.value)}
          error={fieldErrors.subject}
        />

        <AppTextarea
          label={labels.message}
          value={values.message}
          onChange={(event) => setValue("message", event.target.value)}
          error={fieldErrors.message}
          required
        />

        {status === "success" ? (
          <div className="flex items-start gap-3 rounded-appLg border border-[hsl(var(--color-success)/0.32)] bg-[hsl(var(--color-success)/0.10)] p-4 text-app-success">
            <AppIcon name="check" size={18} />
            <span className="text-sm font-bold">{labels.success}</span>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex items-start gap-3 rounded-appLg border border-[hsl(var(--color-danger)/0.32)] bg-[hsl(var(--color-danger)/0.10)] p-4 text-app-danger">
            <AppIcon name="message" size={18} />
            <span className="text-sm font-bold">{labels.error}</span>
          </div>
        ) : null}

        <div className="grid gap-3">
          <AppButton type="submit" disabled={isSubmitting} size="lg" className="w-full">
            {isSubmitting ? labels.loading : labels.submit}
            <AppIcon name="arrowUpRight" size={17} />
          </AppButton>
          <p className="text-center text-xs leading-6 text-app-muted">{labels.privacyNote}</p>
        </div>
      </form>
    </AppCard>
  );
}
