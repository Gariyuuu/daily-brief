import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://daily-brief-lovat.vercel.app";
const description =
  "A one-click daily briefing combining weather, news, sports, stocks, crypto, and tech updates into a single archived digest, refreshed every day.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Daily Brief — Weather, News & Markets Digest",
    template: "%s · Daily Brief",
  },
  description,
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Daily Brief",
    title: "Daily Brief — Weather, News & Markets Digest",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Brief — Weather, News & Markets Digest",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-input bg-[var(--background)]/90 backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight text-lg">
              🗞️ Daily Brief
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:underline underline-offset-4">
                Today
              </Link>
              <Link href="/archive" className="hover:underline underline-offset-4">
                Archive
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
        <ChatWidget />
      </body>
    </html>
  );
}
