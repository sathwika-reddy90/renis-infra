"use client";

import type { FormEventHandler, ReactNode } from "react";
import Drawer from "./Drawer";
import { AdminButton } from "./ui";

/** Drawer + form chrome shared by every create/edit flow. */
export default function EntityFormDrawer({
  open,
  title,
  onClose,
  onSubmit,
  submitting,
  wide = false,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitting: boolean;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <Drawer open={open} onClose={onClose} title={title} wide={wide}>
      <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">{children}</div>
        <footer className="flex flex-none justify-end gap-3 border-t border-line px-6 py-4">
          <AdminButton variant="ghost" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" loading={submitting}>
            Save
          </AdminButton>
        </footer>
      </form>
    </Drawer>
  );
}
