import type { Metadata, Viewport } from "next";
import { Geist_Mono, Montserrat, Pacifico } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const brand = Pacifico({ variable: "--font-brand", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "DumbGram", template: "%s • DumbGram" },
  description: "Bagikan foto terbaikmu dan nikmati karya orang lain di DumbGram.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} ${geistMono.variable} ${brand.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
