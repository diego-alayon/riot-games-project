import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { StoreProvider } from "@/lib/state/store";
import { TraceProvider } from "@/lib/trace/trace-context";
import { ToastProvider } from "@/components/ui/Overlay";
import { SiteHeader } from "@/components/patterns/SiteHeader";
import { PresenterPanel } from "@/components/trace/PresenterPanel";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Riot Games Tickets",
  description: "Riftbound Ticketing Portal",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <TraceProvider>
          <StoreProvider>
            <ToastProvider>
              <SiteHeader />
              <main>{children}</main>
              <PresenterPanel />
            </ToastProvider>
          </StoreProvider>
        </TraceProvider>
      </body>
    </html>
  );
}
