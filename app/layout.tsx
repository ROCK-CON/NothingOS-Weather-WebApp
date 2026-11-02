import type { Metadata, Viewport } from "next";
import { Space_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Self-hosted at build time by next/font: no runtime request to Google, no font flash.
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nothing Weather",
  description: "A Nothing OS inspired weather application",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nothing Weather",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  // No maximumScale: pinch-zoom stays available for accessibility.
};

// Applies the saved theme before first paint to avoid a light/dark flash.
// Dark is the default; only an explicit "light" preference turns it off.
const THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light')document.documentElement.classList.add('dark')})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceMono.variable} suppressHydrationWarning>
      <body className="font-mono antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
