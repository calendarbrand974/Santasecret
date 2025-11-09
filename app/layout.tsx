import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import { Snowflakes } from "@/components/Snowflakes";

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
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
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
