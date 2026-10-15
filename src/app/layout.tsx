import type { Metadata } from "next";
import "./globals.css";
import "./rifki.css";

export const metadata: Metadata = {
  title: "Rifki - Web Developer Portfolio",
  description: "Created by Rifki with creativity",
  icons: {
    icon: [
      { url: "/favicon-r-v2.svg", type: "image/svg+xml" },
      { url: "/favicon-r-v2.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon-r-v2.svg",
    apple: [{ url: "/favicon-r-v2.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-svh w-full bg-[#0b0b0b] flex flex-col">
        {children}
      </body>
    </html>
  );
}
