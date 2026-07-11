import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";
import SimulationBadge from "@/components/SimulationBadge";
import PitchModeBanner from "@/components/PitchModeBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Runway 250",
  description: "Your life, rendering in focus across 250 days.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const store = JSON.parse(localStorage.getItem('runway-storage'));
            if (store && store.state && store.state.darkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (e) {}
        ` }} />
      </head>
      <body className="min-h-full bg-neutral-200 dark:bg-neutral-950 flex justify-center transition-colors duration-300">
        <ThemeProvider>
          {/* Centered Column */}
          <div className="w-full max-w-[520px] min-h-screen bg-bg-app border-x border-[var(--border-color)] flex flex-col relative pixel-grid shadow-xl">
            <PitchModeBanner />
            {/* Core Content Area */}
            <main className="flex-1 flex flex-col p-6 w-full relative z-10 pb-24">
              {children}
            </main>

            {/* Persistent Global Footer with Simulation Badge */}
            <footer className="w-full flex flex-col items-center gap-2 py-6 border-t border-[var(--border-color)] mt-auto relative z-10 bg-white/20 dark:bg-dark-surface/10 backdrop-blur-xs">
              <SimulationBadge />
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                Runway 250 © 2026
              </p>
            </footer>

            {/* Bottom Nav */}
            <Navigation />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
