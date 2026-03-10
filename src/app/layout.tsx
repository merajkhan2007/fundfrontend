import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MAQASIDFund",
  description: "Manage MAQASIDFund deposits, and loans.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-background via-muted to-background bg-gradient-animate pb-12">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
