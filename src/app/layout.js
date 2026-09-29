import { Inter, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata = {
  title: 'Кофе купить в Бухаре — Qahva Bukhara',
  description:
    'Qahva Bukhara — место, где кофе встречается с искусством. Работаем 24/7. Кофейня, десерты, напитки. Бухара.',
  keywords: ['Qahva', 'Bukhara', 'кофейня', 'Бухара', 'кофе', 'десерты', '24/7'],
  authors: [{ name: 'Qahva Bukhara' }],
  creator: 'Qahva Bukhara',
  openGraph: {
    title: 'Кофе купить в Бухаре — Qahva Bukhara',
    description: 'Место, где кофе встречается с искусством',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Qahva Bukhara',
    url: 'https://qahvabukhara.uz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Кофе купить в Бухаре — Qahva Bukhara',
    description: 'Место, где кофе встречается с искусством',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/images/icon.png',
    apple: '/images/icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#F9E8CE',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}