"use client";

/**
 * =====================================================
 * AdminCrmPage
 * صفحة مركزية لإدارة رسائل التواصل وطلبات عروض الأسعار كـ CRM مصغّر
 * =====================================================
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { addQuoteNote, listAdminItems, updateAdminItem } from "@/shared/api/admin-client";
import { useAdminAuth } from "@/shared/auth/AdminAuthProvider";
import { valueToText } from "@/shared/admin/admin-formatters";
import { AppBadge } from "@/shared/design-system/components/AppBadge";
import { AppButton } from "@/shared/design-system/components/AppButton";
import { AppCard } from "@/shared/design-system/components/AppCard";
import { AppEmptyState } from "@/shared/design-system/components/AppEmptyState";
import { AppErrorState } from "@/shared/design-system/components/AppErrorState";
import { AppIcon } from "@/shared/design-system/components/AppIcon";
import { AppInput } from "@/shared/design-system/components/AppInput";
import { AppLoadingState } from "@/shared/design-system/components/AppLoadingState";
import { AppModal } from "@/shared/design-system/components/AppModal";
import { AppPageHeader } from "@/shared/design-system/components/AppPageHeader";
import { AppSelect } from "@/shared/design-system/components/AppSelect";
import { AppTable } from "@/shared/design-system/components/AppTable";
import { AppTextarea } from "@/shared/design-system/components/AppTextarea";

type CrmKind = "contact" | "quote" | "support";

type CrmRow = Record<string, unknown> & {
  id?: string;
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  description?: string | null;
  status?: string;
  priority?: string;
  project_type?: string;
  app_name?: string | null;
  preferred_contact_method?: string;
  internal_note?: string | null;
  notes?: Array<Record<string, unknown>>;
};

type Option = {
  label: string;
  value: string;
};

type Labels = {
  title: string;
  description: string;
  search: string;
  searchPlaceholder: string;
  refresh: string;
  loading: string;
  emptyTitle: string;
  emptyDescription: string;
  error: string;
  details: string;
  save: string;
  close: string;
  actions: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  note: string;
  addNote: string;
  projectType: string;
  contactMethod: string;
  createdAt: string;
};

type AdminCrmPageProps = {
  kind: CrmKind;
  endpoint: string;
  labels: Labels;
};

const contactStatuses: Option[] = [
  { label: "New", value: "new" },
  { label: "Read", value: "read" },
  { label: "Replied", value: "replied" },
  { label: "Archived", value: "archived" }
];

const quoteStatuses: Option[] = [
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Contacted", value: "contacted" },
  { label: "Waiting customer", value: "waiting_customer" },
  { label: "Proposal sent", value: "proposal_sent" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" }
];

const supportStatuses: Option[] = [
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "In progress", value: "in_progress" },
  { label: "Waiting customer", value: "waiting_customer" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
  { label: "Archived", value: "archived" }
];

const quotePriorities: Option[] = [
  { label: "Low", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" }
];

function badgeTone(value: string | undefined) {
  if (["new", "reviewing", "normal", "read"].includes(value ?? "")) {
    return "primary" as const;
  }

  if (["accepted", "completed", "replied", "contacted", "resolved", "closed"].includes(value ?? "")) {
    return "success" as const;
  }

  if (["high", "urgent", "waiting_customer", "proposal_sent"].includes(value ?? "")) {
    return "warning" as const;
  }

  if (["rejected"].includes(value ?? "")) {
    return "danger" as const;
  }

  return "neutral" as const;
}

function DetailLine({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="grid gap-1 rounded-appMd border border-app-border bg-app-surface p-3">
      <span className="text-xs font-semibold text-app-muted">{label}</span>
      <span className="break-words text-sm font-semibold text-app-foreground">{valueToText(value)}</span>
    </div>
  );
}

export function AdminCrmPage({ kind, endpoint, labels }: AdminCrmPageProps) {
  const { tokens } = useAdminAuth();
  const queryClient = useQueryClient();
  const token = tokens?.access_token ?? "";

  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<CrmRow | null>(null);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("normal");
  const [internalNote, setInternalNote] = useState("");
  const [newQuoteNote, setNewQuoteNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [endpoint, search],
    queryFn: () => listAdminItems(endpoint, { token, search, skip: 0, limit: 100 }),
    enabled: Boolean(token)
  });

  const rows = (query.data ?? []) as CrmRow[];
  const filteredRows = rows.filter((row) => {
    const haystack = [row.full_name, row.email, row.phone, row.subject, row.project_type, row.app_name, row.status]
      .map((value) => String(value ?? "").toLowerCase())
      .join(" ");
    return haystack.includes(search.toLowerCase());
  });

  const openDetails = (row: CrmRow) => {
    setError(null);
    setSelectedRow(row);
    setStatus(row.status ?? "new");
    setPriority(row.priority ?? "normal");
    setInternalNote(row.internal_note ?? "");
    setNewQuoteNote("");
  };

  const closeDetails = () => {
    setSelectedRow(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!selectedRow?.id) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (kind === "contact" || kind === "support") {
        await updateAdminItem(`${endpoint}/${selectedRow.id}`, token, {
          status,
          priority: kind === "support" ? priority : undefined,
          internal_note: internalNote || null
        });
      } else {
        await updateAdminItem(`${endpoint}/${selectedRow.id}`, token, {
          status,
          priority
        });

        if (newQuoteNote.trim()) {
          await addQuoteNote(token, selectedRow.id, newQuoteNote.trim());
        }
      }

      await queryClient.invalidateQueries({ queryKey: [endpoint] });
      closeDetails();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : labels.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <AppPageHeader title={labels.title} description={labels.description} />

      <AppCard className="grid gap-4 p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <AppInput
            label={labels.search}
            placeholder={labels.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="md:min-w-80"
          />
          <AppButton variant="secondary" onClick={() => query.refetch()} icon={<AppIcon name="refresh" size={17} />}>
            {labels.refresh}
          </AppButton>
        </div>
      </AppCard>

      <AppCard className="p-4 md:p-5">
        {query.isLoading ? <AppLoadingState text={labels.loading} /> : null}
        {query.isError ? <AppErrorState title={labels.error} description={String(query.error)} /> : null}
        {!query.isLoading && !query.isError && filteredRows.length === 0 ? (
          <AppEmptyState title={labels.emptyTitle} description={labels.emptyDescription} icon={kind === "contact" ? "email" : kind === "support" ? "support" : "messages"} />
        ) : null}
        {!query.isLoading && !query.isError && filteredRows.length > 0 ? (
          <AppTable
            rows={filteredRows}
            getRowKey={(row) => String(row.id)}
            columns={[
              { key: "full_name", header: labels.fullName, render: (row) => <span className="font-semibold">{valueToText(row.full_name)}</span> },
              { key: "email", header: labels.email, render: (row) => <span>{valueToText(row.email)}</span> },
              { key: "phone", header: labels.phone, render: (row) => <span>{valueToText(row.phone)}</span> },
              {
                key: kind === "contact" ? "subject" : "project_type",
                header: kind === "quote" ? labels.projectType : labels.subject,
                render: (row) => <span>{valueToText(kind === "quote" ? row.project_type : row.subject)}</span>
              },
              {
                key: "status",
                header: labels.status,
                render: (row) => <AppBadge tone={badgeTone(row.status)}>{valueToText(row.status)}</AppBadge>
              },
              ...(kind !== "contact"
                ? [{
                    key: "priority",
                    header: labels.priority,
                    render: (row: CrmRow) => <AppBadge tone={badgeTone(row.priority)}>{valueToText(row.priority)}</AppBadge>
                  }]
                : []),
              {
                key: "actions",
                header: labels.actions,
                render: (row) => (
                  <AppButton variant="secondary" className="min-h-10 px-3" onClick={() => openDetails(row)} icon={<AppIcon name="edit" size={16} />}>
                    {labels.details}
                  </AppButton>
                )
              }
            ]}
          />
        ) : null}
      </AppCard>

      <AppModal open={Boolean(selectedRow)} title={labels.details} onClose={closeDetails} size="xl">
        {selectedRow ? (
          <div className="grid gap-5">
            {error ? <AppErrorState title={labels.error} description={error} /> : null}

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailLine label={labels.fullName} value={selectedRow.full_name} />
              <DetailLine label={labels.email} value={selectedRow.email} />
              <DetailLine label={labels.phone} value={selectedRow.phone} />
              <DetailLine label={labels.createdAt} value={selectedRow.created_at} />
              {kind === "quote" ? <DetailLine label={labels.contactMethod} value={selectedRow.preferred_contact_method} /> : null}
              {kind === "support" ? <DetailLine label={labels.projectType} value={selectedRow.app_name} /> : null}
            </div>

            <AppTextarea
              label={labels.message}
              value={String(kind === "quote" ? selectedRow.description ?? "" : selectedRow.message ?? "")}
              readOnly
            />

            <div className="grid gap-4 md:grid-cols-2">
              <AppSelect label={labels.status} value={status} onChange={(event) => setStatus(event.target.value)}>
                {(kind === "contact" ? contactStatuses : kind === "support" ? supportStatuses : quoteStatuses).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </AppSelect>
              {kind !== "contact" ? (
                <AppSelect label={labels.priority} value={priority} onChange={(event) => setPriority(event.target.value)}>
                  {quotePriorities.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </AppSelect>
              ) : null}
            </div>

            {kind === "contact" || kind === "support" ? (
              <AppTextarea label={labels.note} value={internalNote} onChange={(event) => setInternalNote(event.target.value)} />
            ) : (
              <div className="grid gap-4">
                <AppTextarea label={labels.addNote} value={newQuoteNote} onChange={(event) => setNewQuoteNote(event.target.value)} />
                {selectedRow.notes && selectedRow.notes.length > 0 ? (
                  <div className="grid gap-2 rounded-appLg border border-app-border bg-app-surfaceElevated p-4">
                    {selectedRow.notes.map((note) => (
                      <p key={String(note.id ?? note.created_at)} className="rounded-appMd bg-app-surface p-3 text-sm text-app-muted">
                        {valueToText(note.note)}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 border-t border-app-border pt-4">
              <AppButton variant="ghost" onClick={closeDetails}>{labels.close}</AppButton>
              <AppButton disabled={isSubmitting} onClick={handleSave} icon={<AppIcon name="save" size={17} />}>
                {labels.save}
              </AppButton>
            </div>
          </div>
        ) : null}
      </AppModal>
    </div>
  );
}
