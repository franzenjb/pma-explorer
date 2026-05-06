import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const headline = Libre_Baskerville({
  variable: "--font-headline",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const body = Source_Sans_3({
  variable: "--font-body",
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
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
      className={`${headline.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
