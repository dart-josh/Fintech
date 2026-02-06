import client from "./client";

export const walletApi = {
  transfer: (data: {
    sender_id: string;
    payment_code: string;
    amount: number;
  }) => client.post("/api/wallet/transfer", data),

  purchaseAirtime: (data: {
    userId: string;
    phone: string;
    amount: number;
    network: string;
  }) => client.post("/api/wallet/airtime_purchase", data),

  purchaseData: (data: {
    userId: string;
    phone: string;
    plan: string;
    amount: number;
    network: string;
  }) => client.post("/api/wallet/data_purchase", data),

  withdraw: (data: {
    userId: string;
    amount: number;
    account_number: string;
    bank_code: string;
    bank_name: string;
    account_name: string;
  }) => client.post("/api/wallet/withdraw", data),

  getWithdrawalStatus: (data: {
    reference: string;
  }) => client.post("/api/wallet/get_withdrawal_status", data),

  getWalletDetails: (data: { userId: string }) =>
    client.post("/api/wallet/get", data),

   getStatement: (data: { userId: string, startDate: string, endDate: string }) =>
    client.post("/api/wallet/statement", data),

  getUserByPaymentCode: (data: { payment_code: string }) =>
    client.post("/api/beneficiary/find", data),

  addBeneficiary: (data: {
    payment_code: string;
    nickname: string;
    user_id: string;
  }) => client.post("/api/beneficiary/add", data),

  listBeneficiaries: (data: { userId: string }) =>
    client.post("/api/beneficiaries", data),

  getDedicatedAccount: (data: { userId: string }) =>
    client.post("/api/wallet/get_account", data),

};
