"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/types";
import { addComment } from "@/app/actions/posts";

export function CommentForm({
  postId,
  inputId,
  variant = "inline",
}: {
  postId: string;
  inputId?: string;
  variant?: "inline" | "bordered";
}) {
  const [value, setValue] = useState("");
  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await addComment(postId, prev, formData);
      if (result?.message === "ok") setValue("");
      return result;
    },
    undefined,
  );

  return (
    <form
      action={action}
      className={`flex items-center gap-2 ${
        variant === "bordered" ? "border-t border-border px-4 py-3" : "px-1 pt-1"
      }`}
    >
      <input
        id={inputId}
        name="body"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tambahkan komentar…"
        autoComplete="off"
        maxLength={2200}
        className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted"
      />
      {value.trim() && (
        <button
          type="submit"
          disabled={pending}
          className="text-brand-gradient text-sm font-bold transition hover:brightness-125 disabled:opacity-50"
        >
          Kirim
        </button>
      )}
      {state?.error && <span className="text-xs text-danger">{state.error}</span>}
    </form>
  );
}
