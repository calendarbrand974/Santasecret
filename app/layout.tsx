import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import { Snowflakes } from "@/components/Snowflakes";
import { ChristmasGarland } from "@/components/ChristmasGarland";

export const metadata: Metadata = {
  title: "Secret Santa - Famille 2025",
  description: "Application Secret Santa pour la famille",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Snowflakes />
        <div className="relative min-h-screen">
          <ChristmasGarland />
          <ErrorBoundary>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ErrorBoundary>
        </div>
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('SW registered', reg))
                  .catch(err => console.log('SW registration failed', err));
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
