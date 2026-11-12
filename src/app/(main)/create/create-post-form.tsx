"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { createPost } from "@/app/actions/posts";
import { createClient } from "@/lib/supabase/client";
import { extensionFor, prepareImage } from "@/lib/image";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function CreatePostForm({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(f: File | undefined | null) {
    if (!f) return;
    if (!ACCEPT.split(",").includes(f.type)) {
      setError("Format tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10 MB.");
      return;
    }
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function submit() {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      let path: string;
      try {
        const blob = await prepareImage(file);
        path = `${userId}/${crypto.randomUUID()}.${extensionFor(blob)}`;
        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
        if (uploadError) throw uploadError;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal mengunggah gambar.");
        return;
      }

      // Sukses -> server action redirect ke halaman post.
      const result = await createPost(path, caption);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex h-11 items-center justify-between border-b border-border px-4">
        <span className="w-16" />
        <h1 className="font-semibold">Buat post baru</h1>
        <button
          type="button"
          onClick={submit}
          disabled={!file || pending}
          className="w-16 text-right text-sm font-semibold text-accent transition hover:text-foreground disabled:opacity-40"
        >
          {pending ? <Loader2 className="ml-auto h-4 w-4 animate-spin" /> : "Bagikan"}
        </button>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_300px]">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          className={`flex aspect-square items-center justify-center bg-surface transition ${
            dragging ? "bg-accent/10" : ""
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Pratinjau" className="h-full w-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <ImagePlus className="h-20 w-20 stroke-1" />
              <p className="text-lg">Seret foto ke sini</p>
              <button type="button" className="btn-primary" onClick={() => inputRef.current?.click()}>
                Pilih dari perangkat
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col border-t border-border md:border-l md:border-t-0">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Tulis keterangan…"
            maxLength={2200}
            rows={6}
            className="flex-1 resize-none bg-transparent p-4 text-sm outline-none placeholder:text-muted"
          />
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted">
            {preview ? (
              <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-accent">
                Ganti foto
              </button>
            ) : (
              <span />
            )}
            <span>{caption.length.toLocaleString("id-ID")}/2.200</span>
          </div>
        </div>
      </div>

      {error && <p className="border-t border-border p-3 text-center text-sm text-danger">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </div>
  );
}
