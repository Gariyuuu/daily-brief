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

export const metadata: Metadata = {
  title: "Daily Brief",
  description: "Your one-click daily briefing: weather, news, sports, markets, and more.",
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
        <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-[var(--background)]/90 backdrop-blur">
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
