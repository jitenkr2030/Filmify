import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import LayoutClient from "./layout-client";
import { I18nProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Filmify - Launch Your Movie Online in Minutes",
  description: "Automatically create official movie websites and mobile apps. Enable secure streaming, manage promotions, and analyze performance - all in one powerful platform.",
  keywords: ["Filmify", "movie platform", "film launch", "streaming", "movie website", "mobile app", "film distribution", "digital cinema"],
  authors: [{ name: "Filmify Team" }],
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Filmify",
  },
  openGraph: {
    title: "Filmify - Digital Movie Platform",
    description: "Launch your movie online in minutes with official websites and mobile apps",
    url: "https://filmify.app",
    siteName: "Filmify",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Filmify - Digital Movie Platform",
    description: "Launch your movie online in minutes with official websites and mobile apps",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#9333ea" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Filmify" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <I18nProvider>
          <LayoutClient>
            {children}
            <Toaster />
          </LayoutClient>
        </I18nProvider>
      </body>
    </html>
  );
}