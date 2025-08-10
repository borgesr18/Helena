import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initializeErrorHandling } from "@/lib/errorHandler";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Helena - Assistente Médica de Prescrição",
  description: "Sistema de prescrição médica com IA para médicos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#4D9DE0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Helena" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    }, function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
              
              // Inicializar tratamento global de erros
              ${initializeErrorHandling.toString()}
              initializeErrorHandling();
            `,
          }}
        />
      </body>
    </html>
  );
}
