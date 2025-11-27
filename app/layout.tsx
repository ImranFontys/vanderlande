import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "Vanderlande | Track & Trace",
  description: "iOS-style logistics dashboard with live KPI's and track & trace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className="scroll-smooth">
      <body className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 text-text antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
