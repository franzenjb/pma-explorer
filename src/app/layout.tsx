import type { Metadata } from "next";
import {
  Public_Sans,
  Barlow_Condensed,
  Libre_Baskerville,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Body — Public Sans is the closest free Google match for URW DIN used
// across portlandmuseum.org. Same humanist-geometric balance, open
// apertures, slightly higher x-height than Barlow.
const body = Public_Sans({
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Headlines — Barlow Condensed remains the closest free match for
// urw-din-condensed used by PMA's H1 / hero.
const headline = Barlow_Condensed({
  variable: "--font-headline",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Editorial italic flourish — PMA uses Baskerville sparingly for emphasis.
const flourish = Libre_Baskerville({
  variable: "--font-flourish",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

// Tabular data
const data = IBM_Plex_Mono({
  variable: "--font-data",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PMA Explorer — Portland Museum of Art Collection",
  description:
    "A demo collection explorer featuring works from the Portland Museum of Art.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headline.variable} ${body.variable} ${flourish.variable} ${data.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
