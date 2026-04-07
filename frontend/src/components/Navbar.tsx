'use client';

import Link from 'next/link';
import { useWallet } from '@/context/wallet-context';

export default function Navbar() {
  const { walletAddress, isAdmin, isConnected, isCorrectNetwork, balance, connectWallet, disconnectWallet, switchToSepolia } = useWallet();

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <nav className="glass border-b border-[var(--card-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold gradient-text hover:opacity-80 transition-opacity">
            <span>⚡</span>
            <span>Pokemon NFT</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin/pokemon/new" className="bg-[var(--accent-purple)] text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                + Mint Pokemon
              </Link>
            )}
            {isConnected && (
              <Link href="/my-nfts" className="text-[var(--text-secondary)] hover:text-[var(--foreground)] text-sm font-medium transition-colors">
                My NFTs
              </Link>
            )}
            {isConnected ? (
              <div className="flex items-center gap-2">
                {!isCorrectNetwork && (
                  <button onClick={switchToSepolia} className="bg-red-500/20 text-red-400 px-2 py-1 rounded-lg text-xs font-medium border border-red-500/30 hover:bg-red-500/30 transition-colors">
                    Switch to Sepolia
                  </button>
                )}
                {isCorrectNetwork && (
                  <span className="flex items-center gap-1 text-xs text-[var(--accent-emerald)]">
                    <span className="w-2 h-2 bg-[var(--accent-emerald)] rounded-full animate-pulse"></span>
                    Sepolia
                  </span>
                )}
                {isAdmin && (
                  <span className="bg-[var(--accent-yellow)]/20 text-[var(--accent-yellow)] text-xs px-2 py-0.5 rounded-full font-bold border border-[var(--accent-yellow)]/30">
                    ADMIN
                  </span>
                )}
                {balance !== null && (
                  <div className="glass px-3 py-1.5 rounded-lg text-sm font-semibold text-white flex items-center gap-1">
                    <span className="text-[var(--accent-cyan)]">Ξ</span> {balance}
                  </div>
                )}
                <div className="glass px-3 py-1.5 rounded-lg text-sm font-mono text-[var(--accent-cyan)]">
                  {truncateAddress(walletAddress!)}
                </div>
                <button onClick={disconnectWallet} className="text-[var(--text-muted)] hover:text-red-400 text-sm transition-colors">
                  ✕
                </button>
              </div>
            ) : (
              <button onClick={connectWallet} className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-purple)] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                🦊 Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
