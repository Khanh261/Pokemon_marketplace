import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/query-provider';
import { WalletProvider } from '@/context/wallet-context';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pokemon NFT Marketplace',
  description: 'Buy, sell, and collect Pokemon NFT cards on Sepolia',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} particle-bg`}>
        <QueryProvider>
          <WalletProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
