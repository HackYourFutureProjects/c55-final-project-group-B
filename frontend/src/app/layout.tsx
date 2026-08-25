import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flint — Find your next role in the Netherlands",
  description:
    "Flint is a job search platform with roles across the Netherlands. Search by role, city or province and find your next spark.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
