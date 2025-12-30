import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "next-themes";

const SpaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniMetric",
  description: "Web app that uses AI to convert panoramic images into interactive 3D point clouds, allowing users to explore the scene and measure object distances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${SpaceGrotesk.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ThemeProvider attribute="class" enableSystem defaultTheme="system">
          <div className="min-h-screen bg-BG_dark dark:bg-Dark_BG_dark">
            <main>
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
