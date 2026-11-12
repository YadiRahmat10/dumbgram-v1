"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";

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
      <input className="input" name="email" type="email" placeholder="Email" autoComplete="email" required />
      {!isLogin && (
        <>
          <input
            className="input"
            name="full_name"
            placeholder="Full name"
            autoComplete="name"
            maxLength={60}
          />
          <input
            className="input"
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
        className="input"
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
          className="text-sm font-semibold text-foreground/80 transition hover:text-foreground"
        >
          {isLogin ? "Register" : "Login"}
        </Link>
      </div>
    </form>
  );
}
