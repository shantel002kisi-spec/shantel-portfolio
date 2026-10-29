import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./portrait-intro.css";
import "./cinematic-intro.css";
import "./intro-video.css";
import "./portrait-reference.css";
import "./project-walkthrough.css";
import "./reference-motion.css";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Shantel Kisi | Software, Data & AI",
    template: "%s | Shantel Kisi",
  },
  description:
    "Portfolio of Shantel Kisi, Computer Science MSc graduate building useful software, data, and AI systems for real-world problems.",
  applicationName: "Shantel Kisi Portfolio",
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    title: "Shantel Kisi | Software, Data & AI",
    description:
      "Explore Shantel Kisi's software engineering, data, and AI portfolio and interactive project demonstrations.",
    siteName: "Shantel Kisi Portfolio",
    url: siteUrl,
    images: siteUrl ? [{ url: "/shantel-portrait.jpg", alt: "Shantel Kisi" }] : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: "Shantel Kisi | Software, Data & AI",
    description: "Software engineering, data, and AI projects by Shantel Kisi.",
    images: siteUrl ? ["/shantel-portrait.jpg"] : undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
