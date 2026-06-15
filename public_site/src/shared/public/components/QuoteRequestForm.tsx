"use client";

/**
 * =====================================================
 * QuoteRequestForm
 * نموذج طلب عرض سعر مرتبط بـ Public API
 * =====================================================
 */

import { FormEvent, useState } from "react";

import { submitQuoteRequest } from "@/shared/api/public-client";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { AppTextarea } from "@/shared/design-system/components/AppTextarea";
import type { Locale } from "@/shared/design-system/utils/direction";
import { quoteSchema, zodFieldErrors } from "@/shared/public/form-validation";

type QuoteOption = {
  value: string;
  label: string;
};

type QuoteRequestFormProps = {
  locale: Locale;
  labels: {
    title: string;
    description: string;
    fullName: string;
    phone: string;
    email: string;
    projectType: string;
    budget: string;
    duration: string;
    preferredContact: string;
    details: string;
    submit: string;
    loading: string;
    success: string;
    error: string;
    privacyNote: string;
    projectTypes: QuoteOption[];
    contactMethods: QuoteOption[];
  };
};

const defaultValues = {
  full_name: "",
  phone: "",
  email: "",
  project_type: "website",
  expected_budget: "",
  expected_duration: "",
  description: "",
  preferred_contact_method: "whatsapp",
  website: ""
};

export function QuoteRequestForm({ locale, labels }: QuoteRequestFormProps) {
  const [values, setValues] = useState(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof defaultValues, string>>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (key: keyof typeof defaultValues, value: string) => {
    setStatus("idle");
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setFieldErrors({});

    const parsed = quoteSchema(locale).safeParse(values);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors<keyof typeof defaultValues>(parsed.error));
      setIsSubmitting(false);
      return;
    }

    if (parsed.data.website) {
      setStatus("success");
      setValues(defaultValues);
      setIsSubmitting(false);
      return;
    }

    try {
      await submitQuoteRequest(parsed.data);
      setStatus("success");
      setValues(defaultValues);
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
            required
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

        <div className="grid gap-4 md:grid-cols-3">
          <AppSelect
            label={labels.projectType}
            value={values.project_type}
            onChange={(event) => setValue("project_type", event.target.value)}
            error={fieldErrors.project_type}
          >
            {labels.projectTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </AppSelect>

          <AppInput
            label={labels.budget}
            type="number"
            min={0}
            value={values.expected_budget}
            onChange={(event) => setValue("expected_budget", event.target.value)}
            error={fieldErrors.expected_budget}
          />

          <AppInput
            label={labels.duration}
            value={values.expected_duration}
            onChange={(event) => setValue("expected_duration", event.target.value)}
            error={fieldErrors.expected_duration}
          />
        </div>

        <AppSelect
          label={labels.preferredContact}
          value={values.preferred_contact_method}
          onChange={(event) => setValue("preferred_contact_method", event.target.value)}
          error={fieldErrors.preferred_contact_method}
        >
          {labels.contactMethods.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </AppSelect>

        <AppTextarea
          label={labels.details}
          value={values.description}
          onChange={(event) => setValue("description", event.target.value)}
          error={fieldErrors.description}
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
