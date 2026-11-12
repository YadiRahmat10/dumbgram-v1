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
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5">
        <div className="leading-tight">
          <h1 className="font-bold">Buat post baru</h1>
          <p className="text-xs text-muted">JPG, PNG, WEBP, atau GIF · maks 10 MB</p>
        </div>
        <button type="button" onClick={submit} disabled={!file || pending} className="btn-primary min-w-28">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Bagikan
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
          className={`flex aspect-square items-center justify-center bg-background transition ${
            dragging ? "bg-accent/10 ring-2 ring-inset ring-accent" : ""
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Pratinjau" className="h-full w-full object-contain" />
          ) : (
            <div className="m-4 flex flex-1 flex-col items-center justify-center gap-4 self-stretch md:m-6 rounded-2xl border-2 border-dashed border-border p-6 text-center">
              <span className="gradient-border rounded-full p-5">
                <ImagePlus className="h-10 w-10 text-accent" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-lg font-bold">Seret foto ke sini</p>
                <p className="mt-1 text-sm text-muted">atau pilih langsung dari perangkatmu</p>
              </div>
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
            className="flex-1 resize-none bg-transparent p-5 text-sm leading-relaxed outline-none placeholder:text-muted"
          />
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted">
            {preview ? (
              <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-accent hover:text-accent-hover">
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
