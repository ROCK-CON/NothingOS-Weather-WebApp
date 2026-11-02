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
  // Absolute base for the Open Graph image URL that Next generates from app/opengraph-image.png.
  metadataBase: new URL("https://weather.rockley.au"),
  title: "Nothing Weather",
  description: "A minimal, Nothing OS inspired weather app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nothing Weather",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Nothing Weather",
    title: "Nothing Weather",
    description: "A minimal, Nothing OS inspired weather app",
  },
  twitter: { card: "summary_large_image" },
  // Icons come from app/icon.svg, app/favicon.ico and app/apple-icon.png (Next file conventions).
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
