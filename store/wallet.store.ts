import { create } from "zustand";

// 1️⃣ Define the transaction type
export type Transaction = {
  id: string;
  type: string;
  amount: string; // formatted as string with 2 decimals
  status: "pending" | "success" | "failed";
  reference: string | null;
  description: string | null;
  date: string; // created_at
  phone: string | null;
  network: string | null;
  plan: string | null;
  accountNumber: string | null;
  accountName: string | null;
  bankName: string | null;
};

// 2️⃣ Define the wallet type
export type WalletDetails = {
  walletId: number;
  //   fullName: string;
  //   paymentCode: string;
  balance: string; // formatted as string with 2 decimals
  currency: string;
  transactions: Transaction[];
  airtimeTransactions: Transaction[];
  dataTransactions: Transaction[];
  cableTVTransactions: Transaction[];
  electricityTransactions: Transaction[];
  bettingTransactions: Transaction[];
  withdrawTransactions: Transaction[];
  topUpTransactions: Transaction[];
};

type WalletStore = {
  wallet: WalletDetails | null;

  // Actions
  setWallet: (wallet: WalletDetails) => void;
  clearWallet: () => void;
};

export const useWalletStore = create<WalletStore>((set) => ({
  wallet: null,

  setWallet: (wallet) => set({ wallet }),
  clearWallet: () => set({wallet: null}),
}));
