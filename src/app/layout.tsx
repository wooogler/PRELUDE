import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SWAG - Student Writing with Accountable Generative AI",
  description: "A research tool for tracking and analyzing student writing processes with LLM assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
