import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axon — API Testing Reimagined",
  description: "AI-powered API testing that lives inside your editor and actually understands your code.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}