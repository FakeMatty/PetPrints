import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pet Portrait Studio — your pet, as art, in seconds",
  description:
    "Upload your pet, watch them become art, pick your favourite, put it on anything. Instant vector pet portraits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
