import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteOrigin } from "@/domains/weddings/site-origin";
import { DyraneMotionProvider } from "@/ui/motion";
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
  metadataBase: getSiteOrigin(),
  title: {
    default: "Dyrane Weddings",
    template: "%s · Dyrane Weddings",
  },
  description: "Personal invitations, beautifully told.",
  ...(process.env.NODE_ENV === "development"
    ? { other: { "codex-preview": "development" } }
    : {}),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#120e17",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DyraneMotionProvider>{children}</DyraneMotionProvider>
      </body>
    </html>
  );
}
