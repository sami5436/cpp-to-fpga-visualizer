import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_NAME = "Silicon Trace";
const SITE_URL = "https://cpp-to-fpga-visualizer.vercel.app";
const SITE_DESCRIPTION =
  "Watch eight lines of C++ become real hardware. Silicon Trace runs a cycle-accurate model of a " +
  "loop travelling through block RAM, a DSP slice and an accumulator — change one pragma and the " +
  "schedule, floorplan and resource report all change with it.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Sami Hamdalla", url: "https://github.com/sami5436" }],
  creator: "Sami Hamdalla",
  keywords: [
    "FPGA",
    "high-level synthesis",
    "HLS",
    "C++ to RTL",
    "pipelining",
    "DSP48",
    "block RAM",
    "hardware visualization",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — C++ to FPGA fabric`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — C++ to FPGA fabric`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05070d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
