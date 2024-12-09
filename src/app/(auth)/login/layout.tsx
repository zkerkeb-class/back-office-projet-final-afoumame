import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login',
  keywords: 'Login',
};

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
