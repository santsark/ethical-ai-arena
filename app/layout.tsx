import React from 'react';
import './globals.css';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ethical AI Arena",
  description: "Compare and judge ethical reasoning from AI models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Tailwind CDN for immediate styling without build config */}

        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: `body { font-family: 'Inter', sans-serif; }` }} />
      </head>
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}