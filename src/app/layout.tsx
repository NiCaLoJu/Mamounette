import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mamounette",
  description: "Pour maman, de la part de ses garçons.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Mamounette",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdf8f4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
