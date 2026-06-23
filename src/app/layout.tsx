import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CartCanary",
  description:
    "AI-assisted ecommerce optimization for conversion friction, analytics gaps, and action prioritization.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
