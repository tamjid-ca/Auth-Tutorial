import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "AuthHub — Next.js & Express Authentication Tutorial",
  description:
    "A production-ready authentication frontend built with Next.js App Router, Tailwind CSS, shadcn/ui and Express JWT backend.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
              <div className="container mx-auto px-4">
                Node.js Express + MongoDB + Next.js App Router Authentication Tutorial
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
