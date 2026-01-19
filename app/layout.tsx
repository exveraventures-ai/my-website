import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Burnout IQ - Work Hours Dashboard",
  description: "Track work hours and analyze burnout risk for high-intensity professionals across banking, PE, consulting, tech, and more",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js" 
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}

