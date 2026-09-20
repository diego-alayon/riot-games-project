import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { TraceabilityProvider } from "@/lib/context/traceability-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riot Games Project",
  description: "Prototyping & Knowledge Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TraceabilityProvider>
          <Shell>{children}</Shell>
        </TraceabilityProvider>
      </body>
    </html>
  );
}
