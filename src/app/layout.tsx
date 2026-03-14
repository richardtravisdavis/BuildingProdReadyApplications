import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import WebVitals from "@/components/web-vitals";
import AuthSessionProvider from "@/components/session-provider";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cresora Commerce — ROI Calculator",
    template: "%s | Cresora Commerce",
  },
  description:
    "Compare merchant processing costs and discover how much you could save with the Cresora ROI calculator.",
  metadataBase: new URL(process.env.AUTH_URL || "http://localhost:3000"),
  openGraph: {
    title: "Cresora Commerce — ROI Calculator",
    description:
      "Stop overpaying for merchant processing. Compare costs and see your savings instantly.",
    siteName: "Cresora Commerce",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cresora Commerce — ROI Calculator",
    description:
      "Stop overpaying for merchant processing. Compare costs and see your savings instantly.",
  },
  other: {
    "theme-color": "#00273B",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.variable} antialiased`}>
        <AuthSessionProvider>
          <WebVitals />
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
