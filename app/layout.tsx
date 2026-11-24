import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Performance Dashboard · P8",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
