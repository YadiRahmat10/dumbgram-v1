"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

const inputClass =
  "w-full rounded-md border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted focus:border-[#8a8dff] focus:ring-2 focus:ring-[#8a8dff]/25";

export function AuthForm({ mode, notice }: { mode: "login" | "signup"; notice?: string }) {
  const [state, action] = useActionState(mode === "login" ? signIn : signUp, undefined);
  const isLogin = mode === "login";

  if (state?.message) {
    return (
      <div className="flex flex-col items-start gap-5">
        <p className="rounded-md border border-border bg-surface p-4 text-sm">{state.message}</p>
        <Link href="/login" className="btn-gradient">
          Login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input className={inputClass} name="email" type="email" placeholder="Email" autoComplete="email" required />
      {!isLogin && (
        <>
          <input
            className={inputClass}
            name="full_name"
            placeholder="Full name"
            autoComplete="name"
            maxLength={60}
          />
          <input
            className={inputClass}
            name="username"
            placeholder="Username"
            autoComplete="username"
            autoCapitalize="none"
            pattern="[a-zA-Z0-9._]{3,30}"
            title="3–30 karakter: huruf, angka, titik, garis bawah"
            required
          />
        </>
      )}
      <input
        className={inputClass}
        name="password"
        type="password"
        placeholder="Password"
        autoComplete={isLogin ? "current-password" : "new-password"}
        minLength={6}
        required
      />

      {(state?.error || notice) && (
        <p className="text-sm text-danger" role="alert">
          {state?.error ?? notice}
        </p>
      )}

      <div className="mt-4 flex items-center gap-8">
        <SubmitButton className="btn-gradient">{isLogin ? "Login" : "Register"}</SubmitButton>
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="text-sm font-semibold text-neutral-300 transition hover:text-white"
        >
          {isLogin ? "Register" : "Login"}
        </Link>
      </div>
    </form>
  );
}
