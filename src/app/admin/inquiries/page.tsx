"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, Trash2, Download, Phone, Mail, Clock } from "lucide-react";
import DataTable, { FilterSelect } from "@/components/admin/DataTable";
import Modal, { ConfirmDialog } from "@/components/admin/Modal";
import { AdminButton, IconButton, Badge } from "@/components/admin/ui";
import { TextareaField, SelectField, FieldGrid } from "@/components/admin/form/fields";
import { adminApi } from "@/lib/admin/api";
import { useAdminList, useCrudMutations, useUsersList, useInquiryHistory, adminKeys } from "@/lib/admin/hooks";
import { timeAgo, fmtDate, downloadCSV } from "@/lib/admin/format";
import { INQUIRY_STATUSES, type AdminInquiry, type InquiryStatusValue } from "@/lib/admin/types";
import type { InquiryInput } from "@/lib/admin/schemas";

const STATUS_TONE: Record<InquiryStatusValue, "gold" | "blue" | "green" | "red" | "neutral"> = {
  NEW: "gold",
  CONTACTED: "blue",
  QUALIFIED: "blue",
  VISIT_SCHEDULED: "green",
  NEGOTIATION: "gold",
  CLOSED_WON: "green",
  CLOSED_LOST: "red",
};

const STATUS_LABEL: Record<InquiryStatusValue, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  VISIT_SCHEDULED: "Visit Scheduled",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

function StatusSelect({
  value,
  onChange,
}: {
  value: InquiryStatusValue;
  onChange: (v: InquiryStatusValue) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as InquiryStatusValue)}
      onClick={(e) => e.stopPropagation()}
      className="cursor-pointer border border-line bg-white px-2 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] outline-none transition-colors focus:border-gold"
    >
      {INQUIRY_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

/** Editable CRM fields (assignment, follow-up, visit slot, notes) + status timeline. */
function CrmPanel({ inquiry }: { inquiry: AdminInquiry }) {
  const qc = useQueryClient();
  const users = useUsersList();
  const history = useInquiryHistory(inquiry.id);
  const { update } = useCrudMutations("inquiries", adminApi.inquiries, "Inquiry");

  const [form, setForm] = useState({
    assignedToId: inquiry.assignedToId ?? "",
    followUpDate: inquiry.followUpDate?.slice(0, 10) ?? "",
    visitDate: inquiry.visitDate?.slice(0, 10) ?? "",
    visitTime: inquiry.visitTime ?? "",
    notes: inquiry.notes ?? "",
  });

  const userName = (id: string | null) => users.data?.find((u) => u.id === id)?.name ?? "—";

  const save = () => {
    const data: Partial<InquiryInput> = {
      assignedToId: form.assignedToId || null,
      followUpDate: form.followUpDate || null,
      visitDate: form.visitDate || null,
      visitTime: form.visitTime || null,
      notes: form.notes || null,
    };
    update.mutate({ id: inquiry.id, data });
  };

  const changeStatus = (status: InquiryStatusValue) => {
    update.mutate(
      { id: inquiry.id, data: { status } },
      { onSettled: () => qc.invalidateQueries({ queryKey: adminKeys.inquiryHistory(inquiry.id) }) },
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-t border-line pt-4">
        <p className="text-[0.64rem] uppercase tracking-[0.2em] text-muted">Lead Status</p>
        <StatusSelect value={inquiry.status} onChange={changeStatus} />
      </div>

      <FieldGrid>
        <SelectField
          label="Assigned to"
          placeholder="Unassigned"
          options={(users.data ?? []).map((u) => ({ value: u.id, label: u.name }))}
          value={form.assignedToId}
          onChange={(e) => setForm((f) => ({ ...f, assignedToId: e.target.value }))}
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted">
            Follow-up date
          </span>
          <input
            type="date"
            value={form.followUpDate}
            onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))}
            className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold"
          />
        </label>
      </FieldGrid>

      <FieldGrid>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted">
            Visit date
          </span>
          <input
            type="date"
            value={form.visitDate}
            onChange={(e) => setForm((f) => ({ ...f, visitDate: e.target.value }))}
            className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted">
            Visit time
          </span>
          <input
            type="time"
            value={form.visitTime}
            onChange={(e) => setForm((f) => ({ ...f, visitTime: e.target.value }))}
            className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-gold"
          />
        </label>
      </FieldGrid>

      <TextareaField
        label="Notes"
        rows={3}
        placeholder="Internal notes about this lead…"
        value={form.notes}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
      />

      <div className="flex justify-end">
        <AdminButton size="sm" loading={update.isPending} onClick={save}>
          Save CRM Details
        </AdminButton>
      </div>

      <div className="border-t border-line pt-4">
        <p className="mb-3 flex items-center gap-1.5 text-[0.64rem] uppercase tracking-[0.2em] text-muted">
          <Clock size={12} /> Timeline
        </p>
        {history.isPending ? (
          <p className="text-xs text-muted">Loading timeline…</p>
        ) : !history.data || history.data.length === 0 ? (
          <p className="text-xs text-muted">No status changes yet.</p>
        ) : (
          <ol className="space-y-2.5">
            {[...history.data].reverse().map((entry) => (
              <li key={entry.id} className="flex items-start gap-2.5 text-xs">
                <span className="mt-0.5 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                <div>
                  <p className="text-ink">
                    {entry.fromStatus ? (
                      <>
                        {STATUS_LABEL[entry.fromStatus]} <span className="text-muted">→</span>{" "}
                        {STATUS_LABEL[entry.toStatus]}
                      </>
                    ) : (
                      <>Lead created as {STATUS_LABEL[entry.toStatus]}</>
                    )}
                  </p>
                  <p className="text-muted">
                    {fmtDate(entry.createdAt)}
                    {entry.changedById ? ` · ${userName(entry.changedById)}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export default function InquiriesPage() {
  const list = useAdminList("inquiries", adminApi.inquiries);
  const users = useUsersList();
  const { update, remove } = useCrudMutations("inquiries", adminApi.inquiries, "Inquiry");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [detail, setDetail] = useState<AdminInquiry | null>(null);
  const [toDelete, setToDelete] = useState<AdminInquiry | null>(null);

  // Keep the open detail view in sync with the underlying list data (e.g.
  // after an optimistic status update).
  const detailLive = useMemo(
    () => (detail ? (list.data ?? []).find((i) => i.id === detail.id) ?? detail : null),
    [detail, list.data],
  );

  const userName = (id?: string | null) => users.data?.find((u) => u.id === id)?.name;

  // One filtered set drives both the table and the CSV export.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (list.data ?? []).filter(
      (i) =>
        (!status || i.status === status) &&
        (!q || `${i.name} ${i.email} ${i.phone} ${i.interest ?? ""}`.toLowerCase().includes(q)),
    );
  }, [list.data, search, status]);

  const exportCSV = () =>
    downloadCSV(
      `inquiries-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((i) => ({
        name: i.name,
        email: i.email,
        phone: i.phone,
        interest: i.interest ?? "",
        status: i.status,
        assignedTo: userName(i.assignedToId) ?? "",
        followUpDate: i.followUpDate ?? "",
        visitDate: i.visitDate ?? "",
        visitTime: i.visitTime ?? "",
        notes: i.notes ?? "",
        message: i.message ?? "",
        received: i.createdAt,
      })),
    );

  return (
    <>
      <DataTable<AdminInquiry>
        rows={filtered}
        loading={list.isPending}
        error={list.isError}
        onRetry={() => void list.refetch()}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, phone…"
        emptyMessage="No inquiries match."
        toolbar={
          <FilterSelect
            value={status}
            onChange={setStatus}
            allLabel="All statuses"
            options={INQUIRY_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
          />
        }
        headerActions={
          <AdminButton variant="ghost" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download size={13} /> Export CSV
          </AdminButton>
        }
        columns={[
          {
            key: "name",
            header: "Customer",
            render: (i) => (
              <div>
                <p className="font-medium text-ink">{i.name}</p>
                <p className="text-xs text-muted">{i.email}</p>
              </div>
            ),
          },
          { key: "phone", header: "Phone", render: (i) => <span className="text-muted">{i.phone}</span> },
          {
            key: "interest",
            header: "Interested In",
            render: (i) => <span className="line-clamp-1 max-w-40 text-muted">{i.interest ?? "General"}</span>,
          },
          {
            key: "assigned",
            header: "Assigned To",
            render: (i) => <span className="text-muted">{userName(i.assignedToId) ?? "Unassigned"}</span>,
          },
          {
            key: "status",
            header: "Status",
            className: "w-44",
            render: (i) => (
              <StatusSelect value={i.status} onChange={(s) => update.mutate({ id: i.id, data: { status: s } })} />
            ),
          },
          { key: "at", header: "Received", className: "w-28", render: (i) => <span className="text-muted">{timeAgo(i.createdAt)}</span> },
        ]}
        actions={(i) => (
          <>
            <IconButton title="View details" onClick={() => setDetail(i)}>
              <Eye size={14} />
            </IconButton>
            <IconButton title="Delete inquiry" danger onClick={() => setToDelete(i)}>
              <Trash2 size={14} />
            </IconButton>
          </>
        )}
      />

      {/* Details */}
      <Modal open={detailLive !== null} onClose={() => setDetail(null)} title="Lead Details" size="lg">
        {detailLive && (
          <div className="space-y-5 text-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-2xl font-light">{detailLive.name}</p>
                <p className="mt-1 text-muted">{detailLive.interest ?? "General enquiry"}</p>
              </div>
              <Badge tone={STATUS_TONE[detailLive.status]}>{STATUS_LABEL[detailLive.status]}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 border-y border-line py-4 sm:grid-cols-2">
              <a href={`tel:${detailLive.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-ink hover:text-gold">
                <Phone size={14} className="text-gold" /> {detailLive.phone}
              </a>
              <a href={`mailto:${detailLive.email}`} className="flex items-center gap-2 text-ink hover:text-gold">
                <Mail size={14} className="text-gold" /> {detailLive.email}
              </a>
            </div>
            {(detailLive.visitDate || detailLive.visitTime) && (
              <div className="border-b border-line pb-4 text-xs text-muted">
                Preferred visit: {fmtDate(detailLive.visitDate)}
                {detailLive.visitTime ? ` at ${detailLive.visitTime}` : ""}
              </div>
            )}
            <div>
              <p className="text-[0.64rem] uppercase tracking-[0.2em] text-muted">Message</p>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">
                {detailLive.message || "No message provided."}
              </p>
            </div>
            <p className="text-xs text-muted">Received {fmtDate(detailLive.createdAt)}</p>

            <CrmPanel key={detailLive.id} inquiry={detailLive} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete inquiry?"
        message={`This will permanently remove the inquiry from ${toDelete?.name ?? "this customer"}.`}
        loading={remove.isPending}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await remove.mutateAsync(toDelete.id);
          } finally {
            setToDelete(null);
          }
        }}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
