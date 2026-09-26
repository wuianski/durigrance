import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Registration",
  description: "QR code one-time registration demo",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
