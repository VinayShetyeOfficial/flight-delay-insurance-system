import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/SessionProvider";
import type React from "react"; // Added import for React

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flight Delay Insurance",
  description: "Book flights and get insurance for delays",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ErrorBoundary>
            <div className="min-h-screen bg-[#F7F9FC] text-[#333333]">
              {children}
            </div>
            <Toaster />
          </ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  );
}

import "./globals.css";
