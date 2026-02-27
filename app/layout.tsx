import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1p Challenge Calculator | Monzo",
  description:
    "Plan your penny accumulator savings with Monzo. Calculate deposits for any date range, month, or custom period. Mobile-friendly savings calculator.",
  manifest: "/manifest.json",
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  themeColor: "#FE4B60",
  openGraph: {
    title: "1p Challenge Calculator | Monzo",
    description:
      "Plan your penny accumulator savings. Calculate deposits for any date range.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
