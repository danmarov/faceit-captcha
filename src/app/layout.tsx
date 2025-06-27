import type { Metadata } from "next";
import { Play } from "next/font/google";
import "./globals.css";

const play = Play({
  variable: "--font-play",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "URL Verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${play.variable} antialiased`}>{children}</body>
    </html>
  );
}
