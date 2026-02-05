import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "vTrade - Professional Trading Platform",
  description: "Experience the future of trading with vTrade. Secure, fast, and professional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-primary`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div 
            className="fixed inset-0 -z-10 transition-colors duration-300"
            style={{
              backgroundImage: `
                radial-gradient(circle at 15% 50%, color-mix(in oklch, var(--primary), transparent 92%), transparent 40%),
                radial-gradient(circle at 85% 30%, color-mix(in oklch, var(--ring), transparent 92%), transparent 40%),
                radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--primary), transparent 95%), transparent 30%)
              `
            }}
          />
          <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-20 opacity-5 pointer-events-none -z-10" />
          <Navbar />
          <main className="flex-1 pt-20 relative z-10 transition-colors duration-300">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
