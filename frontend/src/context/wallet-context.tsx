"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { BrowserProvider, JsonRpcSigner, formatEther } from "ethers";
import { User, OWNER_ADDRESS, SEPOLIA_CHAIN_ID } from "@/lib/types";
import { authApi } from "@/lib/api";

interface WalletContextType {
  user: User | null;
  token: string | null;
  walletAddress: string | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  chainId: number | null;
  balance: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToSepolia: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<string | null>(null);

  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;
  const isAdmin = walletAddress?.toLowerCase() === OWNER_ADDRESS.toLowerCase();

  const refreshBalance = useCallback(async () => {
    if (!walletAddress || typeof window === "undefined" || !window.ethereum)
      return;
    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const bal = await browserProvider.getBalance(walletAddress);
      setBalance(parseFloat(formatEther(bal)).toFixed(4));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  }, [walletAddress]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedWallet = localStorage.getItem("walletAddress");

    if (storedToken && storedUser && storedWallet) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setWalletAddress(storedWallet);

      if (typeof window !== "undefined" && window.ethereum) {
        const browserProvider = new BrowserProvider(window.ethereum);
        setProvider(browserProvider);
        browserProvider
          .getNetwork()
          .then((n) => setChainId(Number(n.chainId)))
          .catch(console.error);
        // Do NOT call getSigner() here — it can trigger a wallet popup on some
        // extensions (e.g. OKX). The signer is obtained on-demand in connectWallet().
      }
    }
    setIsLoading(false);
  }, []);

  // Fetch balance when wallet is connected and refresh every 15s
  useEffect(() => {
    if (walletAddress) {
      refreshBalance();
      const interval = setInterval(refreshBalance, 15000);
      return () => clearInterval(interval);
    } else {
      setBalance(null);
    }
  }, [walletAddress, chainId, refreshBalance]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0].toLowerCase() !== walletAddress?.toLowerCase()) {
        disconnectWallet();
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
    };

    try {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    } catch {
      // Some wallet extensions (e.g. OKX) proxy .on() but don't support EventEmitter
    }

    return () => {
      try {
        window.ethereum?.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      } catch {
        // ignore
      }
    };
  }, [walletAddress]);

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      setIsLoading(true);
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const walletSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();
      const address = accounts[0].toLowerCase();

      setProvider(browserProvider);
      setSigner(walletSigner);
      setWalletAddress(address);
      setChainId(Number(network.chainId));

      const { message } = await authApi.getNonce();
      const signature = await walletSigner.signMessage(message);

      const { user: userData, token: tokenData } = await authApi.walletAuth({
        walletAddress: address,
        signature,
        message,
      });

      setUser(userData);
      setToken(tokenData);
      localStorage.setItem("token", tokenData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("walletAddress", address);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setUser(null);
    setToken(null);
    setWalletAddress(null);
    setSigner(null);
    setProvider(null);
    setChainId(null);
    setBalance(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("walletAddress");
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: "Sepolia Testnet",
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      }
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        user,
        token,
        walletAddress,
        signer,
        provider,
        chainId,
        balance,
        isConnected: !!walletAddress,
        isAdmin,
        isLoading,
        isCorrectNetwork,
        connectWallet,
        disconnectWallet,
        switchToSepolia,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
