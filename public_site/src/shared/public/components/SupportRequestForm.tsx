"use client";

/**
 * =====================================================
 * SupportRequestForm
 * نموذج دعم عام لتطبيقات ومنتجات الشركة
 * =====================================================
 */

import { FormEvent, useState } from "react";

import { submitSupportRequest, type PublicApp } from "@/shared/api/public-client";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { AppTextarea } from "@/shared/design-system/components/AppTextarea";
import type { Locale } from "@/shared/design-system/utils/direction";
import { pickLocalized } from "@/shared/public/public-utils";
import { supportSchema, zodFieldErrors } from "@/shared/public/form-validation";

type SupportRequestFormProps = {
  locale: Locale;
  apps: PublicApp[];
  labels: {
    title: string;
    description: string;
    fullName: string;
    phone: string;
    email: string;
    app: string;
    subject: string;
    message: string;
    priority: string;
    submit: string;
    loading: string;
    success: string;
    error: string;
    privacyNote: string;
    noApp: string;
    priorities: Array<{ value: string; label: string }>;
  };
};

const defaultValues = {
  full_name: "",
  phone: "",
  email: "",
  app_id: "",
  app_name: "",
  subject: "",
  message: "",
  priority: "normal",
  website: ""
};

export function SupportRequestForm({ locale, apps, labels }: SupportRequestFormProps) {
  const [values, setValues] = useState(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof defaultValues, string>>>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (key: keyof typeof defaultValues, value: string) => {
    setStatus("idle");
    setFieldErrors((current) => ({ ...current, [key]: undefined }));

    if (key === "app_id") {
      const selectedApp = apps.find((app) => app.id === value);
      setValues((current) => ({
        ...current,
        app_id: value,
        app_name: selectedApp ? pickLocalized(locale, selectedApp.name_ar, selectedApp.name_en) : ""
      }));
      return;
    }

    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setFieldErrors({});

    const parsed = supportSchema(locale).safeParse(values);
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
      await submitSupportRequest(parsed.data);
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

        <div className="grid gap-4 md:grid-cols-2">
          <AppSelect label={labels.app} value={values.app_id} onChange={(event) => setValue("app_id", event.target.value)}>
            <option value="">{labels.noApp}</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {pickLocalized(locale, app.name_ar, app.name_en)}
              </option>
            ))}
          </AppSelect>
          <AppSelect label={labels.priority} value={values.priority} onChange={(event) => setValue("priority", event.target.value)} error={fieldErrors.priority}>
            {labels.priorities.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </AppSelect>
        </div>

        <AppInput
          label={labels.subject}
          value={values.subject}
          onChange={(event) => setValue("subject", event.target.value)}
          error={fieldErrors.subject}
          required
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
