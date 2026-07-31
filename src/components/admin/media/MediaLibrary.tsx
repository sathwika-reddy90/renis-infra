"use client";

import { useCallback, useRef, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  Film,
  Loader2,
  Pencil,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { SearchInput, PaginationBar } from "@/components/admin/DataTable";
import { AdminButton, IconButton } from "@/components/admin/ui";
import { ConfirmDialog } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { useMediaLibrary, useMediaMutations } from "@/lib/admin/mediaHooks";
import type { AdminMedia } from "@/lib/admin/types";

const PAGE_SIZE = 24;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Thumb({ item }: { item: AdminMedia }) {
  if (item.type === "IMAGE") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.thumbnailUrl ?? item.url}
        alt={item.fileName}
        loading="lazy"
        className="h-full w-full object-cover"
      />
    );
  }
  const Icon = item.type === "VIDEO" ? Film : FileText;
  return (
    <div className="flex h-full w-full items-center justify-center bg-cream">
      <Icon size={28} className="text-muted/50" />
    </div>
  );
}

function MediaCard({
  item,
  selectable,
  selected,
  onSelect,
  onRename,
  onReplace,
  onDelete,
}: {
  item: AdminMedia;
  selectable: boolean;
  selected: boolean;
  onSelect: () => void;
  onRename: () => void;
  onReplace: (file: File) => void;
  onDelete: () => void;
}) {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();

  const copyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(item.url);
    push("success", "URL copied");
  };

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={cn(
        "group relative flex flex-col border bg-white transition-colors",
        selectable && "cursor-pointer",
        selected ? "border-gold ring-1 ring-gold" : "border-line hover:border-gold/60",
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-cream">
        <Thumb item={item} />
        {selected && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-white">
            <Check size={14} />
          </span>
        )}
      </div>
      <div className="space-y-1 p-2.5">
        <p className="truncate text-xs font-medium text-ink" title={item.fileName}>
          {item.fileName}
        </p>
        <p className="text-[0.62rem] uppercase tracking-[0.1em] text-muted">
          {formatBytes(item.size)}
          {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
        </p>
      </div>
      <div
        className="flex items-center justify-end gap-1 border-t border-line p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton title="Copy URL" onClick={copyUrl}>
          <Copy size={13} />
        </IconButton>
        <IconButton title="Rename" onClick={onRename}>
          <Pencil size={13} />
        </IconButton>
        <IconButton title="Replace file" onClick={() => replaceInputRef.current?.click()}>
          <UploadCloud size={13} />
        </IconButton>
        <input
          ref={replaceInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onReplace(file);
            e.target.value = "";
          }}
        />
        <IconButton title="Delete" danger onClick={onDelete}>
          <Trash2 size={13} />
        </IconButton>
      </div>
    </div>
  );
}

export interface MediaLibraryProps {
  /** Picker mode: clicking a card selects it instead of just managing it. */
  selectable?: boolean;
  onSelect?: (item: AdminMedia) => void;
  /**
   * Multi-select mode: cards accumulate into a selection that is committed in
   * one go, instead of firing `onSelect` per click. Building a 20-image
   * gallery one modal round-trip at a time is otherwise painful.
   */
  multiple?: boolean;
  onSelectMany?: (items: AdminMedia[]) => void;
}

export default function MediaLibrary({
  selectable = false,
  onSelect,
  multiple = false,
  onSelectMany,
}: MediaLibraryProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [renaming, setRenaming] = useState<AdminMedia | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleting, setDeleting] = useState<AdminMedia | null>(null);
  const [dragOver, setDragOver] = useState(false);
  // Keyed by id, but holds the whole record so a selection can span pages.
  const [picked, setPicked] = useState<Record<string, AdminMedia>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { push } = useToast();

  const pickedList = Object.values(picked);

  const togglePicked = (item: AdminMedia) =>
    setPicked((prev) => {
      const next = { ...prev };
      if (next[item.id]) delete next[item.id];
      else next[item.id] = item;
      return next;
    });

  const query = useMediaLibrary({ page, limit: PAGE_SIZE, search: search || undefined });
  const { upload, rename, replace, remove } = useMediaMutations();

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      upload.mutate(files);
    },
    [upload],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search files…"
          className="sm:max-w-xs"
        />
        <AdminButton onClick={() => fileInputRef.current?.click()} loading={upload.isPending}>
          <UploadCloud size={14} /> Upload
        </AdminButton>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-none border-2 border-dashed p-4 text-center text-xs uppercase tracking-[0.14em] text-muted transition-colors",
          dragOver ? "border-gold bg-gold/5 text-gold" : "border-line",
        )}
      >
        Drag & drop files here, or use the Upload button
      </div>

      {query.isPending ? (
        <div className="flex h-40 items-center justify-center text-muted">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No media files yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              selectable={selectable}
              selected={Boolean(picked[item.id])}
              onSelect={() => (multiple ? togglePicked(item) : onSelect?.(item))}
              onRename={() => {
                setRenaming(item);
                setRenameValue(item.fileName);
              }}
              onReplace={(file) => replace.mutate({ id: item.id, file })}
              onDelete={() => setDeleting(item)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <PaginationBar page={page} pageCount={pageCount} onPage={setPage} />
      </div>

      {/* Commit bar — only in multi-select picker mode. */}
      {multiple && (
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-line bg-white/95 py-3 backdrop-blur-sm">
          <p className="text-xs text-muted">
            {pickedList.length === 0
              ? "Select one or more files"
              : `${pickedList.length} selected`}
          </p>
          <div className="flex gap-2">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => setPicked({})}
              disabled={pickedList.length === 0}
            >
              Clear
            </AdminButton>
            <AdminButton
              size="sm"
              disabled={pickedList.length === 0}
              onClick={() => {
                onSelectMany?.(pickedList);
                setPicked({});
              }}
            >
              Insert {pickedList.length > 0 ? pickedList.length : ""}
            </AdminButton>
          </div>
        </div>
      )}

      {renaming && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm space-y-4 bg-white p-6">
            <h3 className="font-display text-lg font-light">Rename file</h3>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-gold"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <AdminButton variant="ghost" onClick={() => setRenaming(null)}>
                Cancel
              </AdminButton>
              <AdminButton
                loading={rename.isPending}
                onClick={() => {
                  const fileName = renameValue.trim();
                  if (!fileName) {
                    push("error", "File name is required");
                    return;
                  }
                  rename.mutate(
                    { id: renaming.id, fileName },
                    { onSuccess: () => setRenaming(null) },
                  );
                }}
              >
                Save
              </AdminButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete file"
        message={`Delete "${deleting?.fileName}"? This cannot be undone.`}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
        }}
      />
    </div>
  );
}
