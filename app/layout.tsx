import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OpeningAnimation } from "@/components/OpeningAnimation";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChatNotes — Turn AI Conversations into Study Notes",
  description:
    "Paste a shared Claude or ChatGPT conversation link and instantly get downloadable, well-organized study notes as a PDF. No AI API calls — all processing done locally.",
  keywords: ["study notes", "ChatGPT", "Claude", "PDF", "conversation", "notes generator"],
  openGraph: {
    title: "ChatNotes",
    description: "Turn AI conversations into beautiful study notes",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <SmoothScroll>
          <OpeningAnimation />
          <ThemeProvider>
            <div className="min-h-screen flex flex-col font-bold bg-white text-black overflow-x-hidden">
              <Header />
              {children}
              <Footer />
            </div>
          </ThemeProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
