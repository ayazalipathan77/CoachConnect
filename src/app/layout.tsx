import type { Metadata, Viewport } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CoachConnect — Find & book elite sports coaches near you",
    template: "%s · CoachConnect",
  },
  description:
    "CoachConnect is the marketplace where coaches monetise their expertise and clients discover, evaluate, and book sessions with verified sports coaches nearby.",
  applicationName: "CoachConnect",
  keywords: [
    "sports coaching",
    "personal trainer",
    "book a coach",
    "tennis coach",
    "football coach",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${sora.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
