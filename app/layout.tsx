import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Signature from "@/components/Signature";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ADNTC Survey Platform — Enterprise Survey Response Management",
  description:
    "Enterprise platform for survey creation, distribution, response collection, and analytics. Abu Dhabi National Takaful Co. P.S.C.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Signature />
      </body>
    </html>
  );
}
