import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "thnk — Getting Things Done",
  description:
    "A GTD-inspired task tracker for tasks captured by voice into Supabase.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <header className="sticky top-0 z-10 border-b border-card-border bg-background/90 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
              <Link href="/" className="flex items-baseline gap-2">
                <span className="text-lg font-semibold tracking-tight">
                  thnk
                </span>
                <span className="hidden text-xs text-muted sm:inline">
                  Getting Things Done
                </span>
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <Show when="signed-in">
                  <Link href="/" className="text-muted hover:text-foreground">
                    Dashboard
                  </Link>
                  <Link
                    href="/review"
                    className="text-muted hover:text-foreground"
                  >
                    Weekly Review
                  </Link>
                  <Link
                    href="/horizons"
                    className="text-muted hover:text-foreground"
                  >
                    Horizons
                  </Link>
                  <Link
                    href="/history"
                    className="text-muted hover:text-foreground"
                  >
                    History
                  </Link>
                  <UserButton />
                </Show>
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="rounded-md bg-accent px-3 py-1.5 font-medium text-accent-foreground hover:opacity-90">
                      Sign in
                    </button>
                  </SignInButton>
                </Show>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
