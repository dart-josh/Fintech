import { walletApi } from "@/api/wallet.api";
import { capitalizeFirst, formatNumberSpace } from "@/hooks/format.hook";
import { useToastStore } from "@/store/toast.store";
import { useUIStore } from "@/store/ui.store";
import { useUserStore } from "@/store/user.store";
import { useWalletStore, WalletDetails } from "@/store/wallet.store";

export type TransferReceipt = {
  recipientName: string;
  paymentCode: string;
  amount: string;
  date: string;
  reference: string;
  method: string;
  status: string;
};

export type AirtimeReceipt = {
  phone: string; // recipient phone number
  network: string;
  amount: string; // amount purchased, formatted as string
  reference: string; // unique transaction reference
  date: string; // date of transaction
  status: string; // 'success', 'failed', etc.
  method: "Airtime Purchase"; // fixed method string
};

export type DataReceipt = {
  phone: string; // recipient phone number
  network: string;
  plan: string; // data plan purchased
  amount: string; // amount paid, formatted as string
  reference: string; // unique transaction reference
  date: string; // date of transaction
  status: string; // 'success', 'failed', etc.
  method: "Data Purchase"; // fixed method string
};

export type WithdrawalReceipt = {
  amount: string; // withdrawn amount, formatted as string
  account_number: string; // destination account number
  bank_name: string; // bank name
  account_name: string; // account holder name
  reference: string; // unique withdrawal reference
  date: string; // transaction date
  status: string; // 'success', 'pending', 'failed'
  method: "Bank Withdrawal"; // fixed method string
};

export async function transferMoney(data: {
  sender_id: string;
  payment_code: string;
  amount: number;
}): Promise<TransferReceipt | null> {
  const { showLoading, hideLoading } = useUIStore.getState();
  const toast = useToastStore.getState();

  try {
    showLoading("Secure Transfer");

    const res: any = await walletApi.transfer(data);

    if (!res.status) return null;

    return res.transfer ?? null;
  } catch (error: any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return null;
  } finally {
    hideLoading();
  }
}

export async function purchaseAirtime(data: {
  userId: string;
  phone: string;
  amount: number;
  network: string;
}): Promise<AirtimeReceipt | null> {
  const { showLoading, hideLoading } = useUIStore.getState();
  const toast = useToastStore.getState();

  try {
    showLoading("Purchasing Airtime");

    const res: any = await walletApi.purchaseAirtime(data);

    if (!res.status) return null;

    return res.receipt ?? null;
  } catch (error: any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return null;
  } finally {
    hideLoading();
  }
}

export async function purchaseData(data: {
  userId: string;
  phone: string;
  plan: string;
  amount: number;
  network: string;
}): Promise<DataReceipt | null> {
  const { showLoading, hideLoading } = useUIStore.getState();
  const toast = useToastStore.getState();

  try {
    showLoading("Purchasing Data");

    const res: any = await walletApi.purchaseData(data);

    if (!res.status) return null;

    return res.receipt ?? null;
  } catch (error: any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return null;
  } finally {
    hideLoading();
  }
}

export async function withdraw(data: {
  userId: string;
  amount: number;
  account_number: string;
  bank_name: string;
  account_name: string;
}): Promise<WithdrawalReceipt | null> {
  const { showLoading, hideLoading } = useUIStore.getState();
  const toast = useToastStore.getState();

  try {
    showLoading("Initiating Withdrawal");

    const res: any = await walletApi.withdraw(data);

    if (!res.status) return null;

    return res.receipt ?? null;
  } catch (error: any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return null;
  } finally {
    hideLoading();
  }
}

//? mapping wallet response
const mapWalletResponse = (apiResponse: any): WalletDetails => {
  const wallet = apiResponse.wallet;

  const mapTx = (tx: any, typeOverride?: string) => ({
    id: tx.id,
    type: typeOverride
      ? typeOverride === "airtime"
        ? `Airtime purchase`
        : typeOverride === "data"
          ? "Mobile Data purchase"
          : capitalizeFirst(typeOverride)
      : tx.type === "debit"
        ? "Transfer"
        : tx.type === "credit"
          ? "Payment Received"
          : capitalizeFirst(tx.type),

    amount: Number(tx.amount).toFixed(2),
    status: tx.status,
    reference: tx.reference,
    description:
      tx.description ??
      (typeOverride === "airtime"
        ? `Airtime purchase for ${formatNumberSpace(tx.phone)} (${tx.network})`
        : typeOverride === "data"
          ? `Data purchase for ${formatNumberSpace(tx.phone)} (${tx.plan ?? tx.network})`
          : typeOverride === "withdrawal"
            ? `Withdrawal to ${tx.account_name} (${tx.bank_name})`
            : ""),
    date: tx.created_at,
    phone: tx.phone,
    network: tx.network,
    plan: tx.plan,
    accountNumber: tx.account_number,
    accountName: tx.account_name,
    bankName: tx.bank_name,
  });

  return {
    walletId: wallet.walletId,
    balance: wallet.balance,
    currency: wallet.currency,

    transactions: [
      ...(wallet.recentTransactions ?? []).map((tx: any) => mapTx(tx)),
      ...(wallet.airtimeTransactions ?? []).map((tx: any) =>
        mapTx(tx, "airtime"),
      ),
      ...(wallet.dataTransactions ?? []).map((tx: any) => mapTx(tx, "data")),
      ...(wallet.withdrawTransactions ?? []).map((tx: any) =>
        mapTx(tx, "withdrawal"),
      ),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

    airtimeTransactions: [
      ...(wallet.airtimeTransactions ?? []).map((tx: any) =>
        mapTx(tx, "airtime"),
      ),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

    dataTransactions: [
      ...(wallet.dataTransactions ?? []).map((tx: any) => mapTx(tx, "data")),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

    withdrawTransactions: [
      ...(wallet.withdrawTransactions ?? []).map((tx: any) =>
        mapTx(tx, "withdrawal"),
      ),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  };
};

export async function getWalletDetails(data: {
  userId: string;
}): Promise<WalletDetails | null> {
  const { setWallet } = useWalletStore.getState();

  try {
    const res: any = await walletApi.getWalletDetails(data);

    if (!res.status || !res.wallet) return null;

    const wallet: WalletDetails = mapWalletResponse(res);

    setWallet(wallet);

    return wallet;
  } catch (error) {
    return null;
  } finally {
    // hideLoading();
  }
}

interface Beneficiary {
  id: string;
  name: string;
  paymentCode: string;
  nickname: string;
}

const mapBeneficiary = (data: any): Beneficiary => ({
  id: data.id,
  name: data.full_name,
  paymentCode: data.payment_code,
  nickname: data.nickname,
});

export async function getUserByPaymentCode(data: {
  payment_code: string;
}): Promise<string | null> {
  try {
    const res: any = await walletApi.getUserByPaymentCode(data);

    const user: string = res.user;

    return user;
  } catch (error) {
    return null;
  }
}

export async function addBeneficiary(data: {
  payment_code: string;
  nickname: string;
  user_id: string;
}): Promise<Beneficiary | null | string> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Adding Beneficiary");

    const res: any = await walletApi.addBeneficiary(data);

    const user: Beneficiary = mapBeneficiary(res.beneficiary);

    return user;
  } catch (error: any) {
    return error.message;
  } finally {
    hideLoading();
  }
}

export async function listBeneficiaries(data: {
  userId: string;
}): Promise<Beneficiary[] | null> {
  const { setBeneficiaries } = useUserStore.getState();
  try {
    const res: any = await walletApi.listBeneficiaries(data);

    const beneficiaries: Beneficiary[] = res.beneficiaries.map((b: any) => ({
      id: b.id,
      name: b.full_name,
      paymentCode: b.payment_code,
      nickname: b.nickname,
    }));

    setBeneficiaries(beneficiaries);

    return beneficiaries;
  } catch (error) {
    return null;
  }
}

export type AccountDetails = {
  account_number: string;
  bank_name: string;
  account_name: string;
};
function mapAccountResponse(response: any): AccountDetails {
  return {
    account_number: response?.account_number ?? "",
    bank_name: response?.bank_name ?? "",
    account_name: response?.account_name ?? "",
  };
}

export async function getDedicatedAccount(data: {
  userId: string;
}): Promise<AccountDetails | null> {
  try {
    const res: any = await walletApi.getDedicatedAccount(data);

    if (!res.status) return null;

    const txDetails: AccountDetails = mapAccountResponse(res.account);

    return txDetails;
  } catch (error) {
    return null;
  }
}

export type TransactionDetails = {
  reference: string;
  bank_name: string;
  account_number: string;
  expires_at?: string | null;
  amount: number;
};
function mapTransactionResponse(response: any): TransactionDetails {
  return {
    reference: response?.reference ?? "",
    bank_name: response?.bank_name ?? "",
    account_number: response?.account_number ?? "",
    expires_at: response?.expires_at,
    amount: response?.amount,
  };
}

export async function fundAccount(data: {
  userId: string;
  amount: string;
}): Promise<TransactionDetails | null> {
  try {
    const res = await walletApi.fundAccount(data);

    if (!res.status) return null;

    const txDetails: TransactionDetails = mapTransactionResponse(res.data);

    return txDetails;
  } catch (error) {
    // console.log(error);
    return null;
  }
}

export async function checkTransactionStatus(data: {
  reference: string;
}): Promise<string | null> {
  try {
    const res = await walletApi.checkTransactionStatus(data);

    return "" + res.status;
  } catch (error) {
    // console.log(error);
    return null;
  }
}

export async function isDedicatedNubanEnabled(): Promise<boolean> {
  try {
    const res: any = await walletApi.isDedicatedNubanEnabled();

    if (!res.status) return false;

    return res.enabled;
  } catch (error) {
    return false;
  }
}
