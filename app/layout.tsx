import type { Metadata } from "next";
import Script from "next/script";
import { Outfit, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrackLearn",
  description: "TrackLearn is a content-driven study and documentation workspace powered by filesystem content.",
};

const themeBootstrap = `
  (function() {
    var storageKey = "tracklearn.study-history.v1";
    var fallbackTheme = "light";
    var fallbackFont = "outfit";
    try {
      var raw = localStorage.getItem(storageKey);
      if (!raw) {
        document.documentElement.dataset.theme = fallbackTheme;
        document.documentElement.dataset.font = fallbackFont;
        return;
      }
      var parsed = JSON.parse(raw);
      var theme = parsed && parsed.preferences && parsed.preferences.theme ? parsed.preferences.theme : fallbackTheme;
      var font = parsed && parsed.preferences && parsed.preferences.font ? parsed.preferences.font : fallbackFont;
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.font = font;
    } catch (error) {
      document.documentElement.dataset.theme = fallbackTheme;
      document.documentElement.dataset.font = fallbackFont;
    }
  })();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${sourceSerif.variable}`}
    >
      <body suppressHydrationWarning>
        <Script id="tracklearn-theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
