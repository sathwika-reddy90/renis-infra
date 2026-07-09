"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AdminButton } from "@/components/admin/ui";
import { TextField } from "@/components/admin/form/fields";
import { useAuth } from "@/lib/admin/AuthProvider";
import { zodResolver } from "@/lib/admin/resolver";
import { loginSchema, type LoginFormInput } from "@/lib/admin/authSchemas";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const form = useForm<LoginFormInput>({
    resolver: zodResolver<LoginFormInput>(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { register, formState, setError } = form;

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    try {
      await login(email, password);
      // AuthGate handles a forced password change; otherwise land on the dashboard.
      router.replace("/admin/dashboard");
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 429
          ? error.message
          : "Invalid email or password";
      setError("password", { message });
    }
  });

  return (
    <div className="flex min-h-svh items-center justify-center bg-ink px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-3xl font-semibold tracking-[0.12em] text-white">
            RENIS<span className="text-gold">INFRA</span>
          </span>
          <p className="mt-2 text-[0.62rem] uppercase tracking-[0.3em] text-white/40">Admin CMS</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-5 bg-white p-8">
          <h1 className="font-display text-2xl font-light">Sign in</h1>
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            placeholder="you@renisinfra.com"
            error={formState.errors.email?.message}
            {...register("email")}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={formState.errors.password?.message}
            {...register("password")}
          />
          <AdminButton type="submit" loading={formState.isSubmitting} className="w-full">
            Sign In
          </AdminButton>
        </form>

        <p className="mt-4 text-center text-[0.66rem] leading-relaxed text-white/30">
          Default: admin@renisinfra.com / ChangeMe123!
        </p>
      </div>
    </div>
  );
}
