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
        {/* Ambient Background Splashes */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="bg-blob bg-primary/30 w-[500px] h-[500px] top-[-10%] left-[-10%]" />
          <div className="bg-blob bg-secondary/20 w-[600px] h-[600px] bottom-[-20%] right-[-10%] animation-delay-2000" />
          <div className="bg-blob bg-accent/20 w-[400px] h-[400px] top-[40%] left-[60%] animation-delay-4000" />
        </div>
        
        <Navbar />
        <main className="min-h-screen bg-background/40 pb-12">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
