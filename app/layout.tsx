import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Duri-grance",
  description: "Claim your artist edition of Duri-grance: Fame is a Scent",
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
