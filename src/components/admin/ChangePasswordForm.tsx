"use client";

import { useForm } from "react-hook-form";
import { AdminButton } from "@/components/admin/ui";
import { TextField } from "@/components/admin/form/fields";
import { useToast } from "@/components/admin/Toast";
import { zodResolver } from "@/lib/admin/resolver";
import { changePassword } from "@/lib/admin/auth";
import { useAuth } from "@/lib/admin/AuthProvider";
import { changePasswordSchema, type ChangePasswordFormInput } from "@/lib/admin/authSchemas";
import { ApiError } from "@/lib/api/client";

export default function ChangePasswordForm({ onDone }: { onDone?: () => void }) {
  const { setUser } = useAuth();
  const { push } = useToast();
  const form = useForm<ChangePasswordFormInput>({
    resolver: zodResolver<ChangePasswordFormInput>(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const { register, formState } = form;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await changePassword(values.currentPassword, values.newPassword);
      setUser(user);
      push("success", "Password updated");
      form.reset();
      onDone?.();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to update password";
      form.setError("currentPassword", { message });
      push("error", message);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <TextField
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={formState.errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="8+ chars with upper, lower, number & symbol"
        error={formState.errors.newPassword?.message}
        {...register("newPassword")}
      />
      <TextField
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={formState.errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <div className="flex justify-end pt-2">
        <AdminButton type="submit" loading={formState.isSubmitting}>
          Update Password
        </AdminButton>
      </div>
    </form>
  );
}
