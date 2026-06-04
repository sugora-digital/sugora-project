/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Sugora | Link Tree, Shop, Real-Time Chats & Affiliates Hub',
  description: 'The ultimate link-builder and digital entrepreneur platform built with Next.js 15, Supabase, and Razorpay.',
  metadataBase: new URL('https://sugora.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
