import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { ThemeInitScript } from "@/components/shared/theme-init-script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SevaSetu — Bridge of Service",
  description:
    "SevaSetu connects households with verified, skilled domestic service professionals through transparent standardized wages and digital employment records.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeInitScript />
        {children}
      </body>
    </html>
  );
}
