import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import { ClerkProvider } from "@clerk/nextjs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Pulse Chat | Secure Real-Time Messaging",
    template: "%s | Pulse Chat",
  },
  description: "Pulse Chat is a secure, real-time messaging app with end-to-end encryption, fast chat, and modern UX.",
  keywords: [
    "Pulse Chat",
    "secure messaging",
    "end-to-end encryption",
    "real-time chat",
    "chat app",
    "privacy-first messaging",
  ],
  openGraph: {
    title: "Pulse Chat | Secure Real-Time Messaging",
    description: "A secure, privacy-first chat app with real-time messaging and end-to-end encryption.",
    url: "/",
    siteName: "Pulse Chat",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse Chat | Secure Real-Time Messaging",
    description: "A secure, privacy-first chat app with real-time messaging and end-to-end encryption.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full`} suppressHydrationWarning>
      <head>
        {/* Blocking script: set theme before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
                } catch(e) {}
              })();
            `,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ClerkProvider signInForceRedirectUrl="/login" signUpForceRedirectUrl="/login">
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
