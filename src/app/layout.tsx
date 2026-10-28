import type { Metadata } from 'next';
import { Outfit, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { AntdProvider } from '@/components/AntdProvider';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-heading',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['monospace', 'Courier New'],
});

export const metadata: Metadata = {
  title: 'Jolvi | Opportunity Radar & Pitch Engine',
  description:
    '14-point audit engine, visual proof generator, and hyper-personalized outreach pitch builder for High-Ticket Home Service Businesses & Contractors.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Anti-flicker script to ensure Light mode by default with zero dark flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('jolvi_theme_mode');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark-theme');
                } else {
                  document.documentElement.classList.remove('dark-theme');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-[var(--surface-canvas)] text-[var(--text-primary)] font-[family-name:var(--font-body)] antialiased min-h-screen transition-colors duration-200">
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
