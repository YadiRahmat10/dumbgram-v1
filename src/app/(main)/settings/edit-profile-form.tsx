"use client";

import { useActionState, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { Avatar } from "@/components/avatar";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/client";
import { extensionFor, prepareImage } from "@/lib/image";
import type { Profile } from "@/lib/types";

export function EditProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateProfile, undefined);
  const [avatarPath, setAvatarPath] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [bio, setBio] = useState(profile.bio ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onAvatarChange(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Gunakan JPG, PNG, atau WEBP.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const blob = await prepareImage(file, 400);
      const path = `${profile.id}/avatar-${Date.now()}.${extensionFor(blob)}`;
      const { error } = await createClient()
        .storage.from("avatars")
        .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (error) throw error;
      setAvatarPath(path);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Gagal mengunggah foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="flex items-center gap-4 rounded-2xl bg-surface p-4">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Pratinjau avatar" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <Avatar profile={profile} size={56} />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{profile.username}</p>
          <p className="truncate text-sm text-muted">{profile.full_name}</p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-primary"
        >
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          Ganti foto
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onAvatarChange(e.target.files?.[0])}
        />
        <input type="hidden" name="avatar_path" value={avatarPath} />
      </div>
      {uploadError && <p className="-mt-3 text-sm text-danger">{uploadError}</p>}

      <Field label="Username">
        <input
          className="input"
          name="username"
          defaultValue={profile.username}
          pattern="[a-zA-Z0-9._]{3,30}"
          autoCapitalize="none"
          required
        />
      </Field>
      <Field label="Nama">
        <input className="input" name="full_name" defaultValue={profile.full_name ?? ""} maxLength={60} />
      </Field>
      <Field label="Situs web">
        <input className="input" name="website" defaultValue={profile.website ?? ""} placeholder="https://" />
      </Field>
      <Field label="Bio">
        <textarea
          className="input resize-none"
          name="bio"
          rows={3}
          maxLength={150}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <span className="mt-1 block text-right text-xs text-muted">{bio.length}/150</span>
      </Field>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="flex justify-end">
        <SubmitButton className="btn-primary min-w-40" disabled={uploading}>
          Simpan
        </SubmitButton>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-semibold">{label}</span>
      {children}
    </label>
  );
}
