"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useForm, type DefaultValues, type FieldValues, type UseFormReturn } from "react-hook-form";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { ZodTypeAny } from "zod";
import DataTable, { type Column } from "./DataTable";
import EntityFormDrawer from "./EntityFormDrawer";
import { ConfirmDialog } from "./Modal";
import { AdminButton, IconButton } from "./ui";
import { zodResolver } from "@/lib/admin/resolver";
import { useAdminList, useCrudMutations } from "@/lib/admin/hooks";
import type { CrudApi } from "@/lib/admin/api";
import type { AdminEntity } from "@/lib/admin/types";

interface ResourceCrudProps<T extends AdminEntity, I extends FieldValues> {
  resource: string;
  singular: string;
  api: CrudApi<T, I>;
  columns: Column<T>[];
  searchText: (row: T) => string;
  searchPlaceholder?: string;
  /** Applied before the table (page-level filter selects). */
  filter?: (row: T) => boolean;
  sort?: (a: T, b: T) => number;
  toolbar?: ReactNode;
  headerExtra?: ReactNode;
  schema: ZodTypeAny;
  defaults: () => DefaultValues<I>;
  toFormValues: (row: T) => DefaultValues<I>;
  /** Pre-submit adjustment (e.g. generated ids). */
  transform?: (values: I) => I;
  Fields: ComponentType<{ form: UseFormReturn<I> }>;
  wide?: boolean;
  /** Extra per-row actions rendered before Edit/Delete. */
  extraActions?: (row: T) => ReactNode;
  emptyMessage?: string;
  pageSize?: number;
}

/**
 * Generic list + create/edit drawer + delete confirmation for one resource.
 * Pages contribute only columns, a zod schema and the form fields.
 */
export default function ResourceCrud<T extends AdminEntity, I extends FieldValues>({
  resource,
  singular,
  api,
  columns,
  searchText,
  searchPlaceholder,
  filter,
  sort,
  toolbar,
  headerExtra,
  schema,
  defaults,
  toFormValues,
  transform,
  Fields,
  wide = false,
  extraActions,
  emptyMessage,
  pageSize,
}: ResourceCrudProps<T, I>) {
  const list = useAdminList(resource, api);
  const { create, update, remove } = useCrudMutations(resource, api, singular);

  const [drawer, setDrawer] = useState<{ row: T | null } | null>(null);
  const [toDelete, setToDelete] = useState<T | null>(null);

  const form = useForm<I>({
    resolver: zodResolver<I>(schema),
    defaultValues: defaults(),
  });

  const rows = useMemo(() => {
    let out = list.data ?? [];
    if (filter) out = out.filter(filter);
    if (sort) out = [...out].sort(sort);
    return out;
  }, [list.data, filter, sort]);

  const openCreate = () => {
    form.reset(defaults());
    setDrawer({ row: null });
  };

  const openEdit = (row: T) => {
    form.reset(toFormValues(row));
    setDrawer({ row });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const data = transform ? transform(values as I) : (values as I);
    try {
      if (drawer?.row) {
        await update.mutateAsync({ id: drawer.row.id, data });
      } else {
        await create.mutateAsync(data);
      }
      setDrawer(null);
    } catch {
      // Error toast already shown by the mutation; keep the drawer open.
    }
  });

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await remove.mutateAsync(toDelete.id);
      setToDelete(null);
    } catch {
      setToDelete(null);
    }
  };

  return (
    <>
      <DataTable<T>
        rows={rows}
        loading={list.isPending}
        error={list.isError}
        onRetry={() => void list.refetch()}
        columns={columns}
        searchText={searchText}
        searchPlaceholder={searchPlaceholder}
        toolbar={toolbar}
        pageSize={pageSize}
        emptyMessage={emptyMessage ?? `No ${resource} yet. Create the first one.`}
        headerActions={
          <>
            {headerExtra}
            <AdminButton onClick={openCreate}>
              <Plus size={14} /> New {singular}
            </AdminButton>
          </>
        }
        actions={(row) => (
          <>
            {extraActions?.(row)}
            <IconButton title={`Edit ${singular.toLowerCase()}`} onClick={() => openEdit(row)}>
              <Pencil size={14} />
            </IconButton>
            <IconButton title={`Delete ${singular.toLowerCase()}`} danger onClick={() => setToDelete(row)}>
              <Trash2 size={14} />
            </IconButton>
          </>
        )}
      />

      <EntityFormDrawer
        open={drawer !== null}
        title={drawer?.row ? `Edit ${singular}` : `New ${singular}`}
        onClose={() => setDrawer(null)}
        onSubmit={onSubmit}
        submitting={create.isPending || update.isPending}
        wide={wide}
      >
        <Fields form={form} />
      </EntityFormDrawer>

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${singular.toLowerCase()}?`}
        message={`This will permanently remove this ${singular.toLowerCase()}. This action cannot be undone.`}
        loading={remove.isPending}
        onConfirm={() => void confirmDelete()}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
