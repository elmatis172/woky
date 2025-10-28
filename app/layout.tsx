import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Woky Kids - Ropa Infantil Online",
    template: "%s | Woky Kids",
  },
  description:
    "Tienda online de ropa para niños y niñas. Moda infantil cómoda y moderna con envíos a todo el país.",
  keywords: ["ropa infantil", "ropa niños", "ropa niñas", "ropa bebé", "moda infantil", "argentina"],
  authors: [{ name: "Woky Kids" }],
  creator: "Woky Kids",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    title: "Woky Kids - Ropa Infantil Online",
    description: "Tu tienda online de confianza",
    siteName: "Woky Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Woky Store",
    description: "Tu tienda online de confianza",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
