/** Kecilkan gambar di browser sebelum diunggah (GIF dibiarkan agar animasi tetap). */
export async function prepareImage(file: File, maxSize = 1440): Promise<Blob> {
  if (file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal memproses gambar"))), "image/jpeg", 0.88),
  );
}

export function extensionFor(blob: Blob) {
  return blob.type === "image/gif" ? "gif" : "jpg";
}
