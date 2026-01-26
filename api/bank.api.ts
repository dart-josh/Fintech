import client from "./client";

export const getBanks = async () => {
  return await client.get("/api/banks");
};

export const resolveAccount = async ({
  account_number,
  bank_code,
}: {
  account_number: string;
  bank_code: string;
}) => {
  return await client.get(
    `/api/banks/resolve?account_number=${account_number}&bank_code=${bank_code}`,
  );
};
