import Link from "next/link";
import { Fragment } from "react";

/** Ubah @mention menjadi tautan profil. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(@[a-z0-9._]{3,30})/gi);
  return (
    <>
      {parts.map((part, i) =>
        /^@[a-z0-9._]{3,30}$/i.test(part) ? (
          <Link key={i} href={`/${part.slice(1).toLowerCase()}`} className="font-semibold text-accent hover:underline">
            {part}
          </Link>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
