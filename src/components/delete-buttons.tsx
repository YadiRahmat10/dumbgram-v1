"use client";

import { useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { deleteComment, deletePost } from "@/app/actions/posts";

export function DeletePostButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label="Hapus post"
      title="Hapus post"
      onClick={() => {
        if (confirm("Hapus post ini? Tindakan ini tidak bisa dibatalkan.")) {
          startTransition(() => deletePost(postId));
        }
      }}
      className="rounded p-1 text-muted transition hover:text-danger disabled:opacity-50"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  );
}

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label="Hapus komentar"
      onClick={() => startTransition(() => deleteComment(commentId))}
      className="text-muted opacity-0 transition hover:text-danger group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
