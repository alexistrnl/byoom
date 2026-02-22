import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PocketBaseProvider } from "@/lib/contexts/PocketBaseContext";
import { PreventZoom } from "@/components/PreventZoom";
import { BotanicAssistant } from "@/components/BotanicAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Byoom — Identifie. Soigne. Collectionne.",
  description: "Votre Pokédex végétal intelligent avec IA",
  manifest: "/manifest.json",
  themeColor: "#5B8C5A",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Byoom",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5B8C5A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Byoom" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PreventZoom />
        <PocketBaseProvider>
          {children}
          <BotanicAssistant />
        </PocketBaseProvider>
      </body>
    </html>
  );
}
