import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PI opung - Toko Pisang",
  description: "Toko Berbagai Macam Pisang Segar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
