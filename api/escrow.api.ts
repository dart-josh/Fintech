import client from "./client";

export const escrowApi = {
  fetchEscrows: (data: { userId: string }) =>
    client.post("/api/escrow/fetchEscrows", data),

  getEscrow: (data: { escrowRef: string }) =>
    client.post("/api/escrow/getEscrow", data),

  createEscrow: (data: {
    payerId: string;
    payeeId: string;
    amount: string;
    description: string;
    expiresAt: string;
  }) => client.post("/api/escrow/create", data),

  fundEscrow: (data: { escrowRef: string; payerId: string }) =>
    client.post("/api/escrow/fund", data),

  releaseEscrow: (data: { escrowRef: string; actorId: string }) =>
    client.post("/api/escrow/release", data),

  refundEscrow: (data: { escrowRef: string; actorId: string }) =>
    client.post("/api/escrow/refund", data),

  deliverEscrow: (data: { escrowRef: string; actorId: string }) =>
    client.post("/api/escrow/deliver", data),

  disputeEscrow: (data: { escrowRef: string; actorId: string }) =>
    client.post("/api/escrow/dispute", data),

  cancelEscrow: (data: { escrowRef: string; actorId: string }) =>
    client.post("/api/escrow/cancel", data),
};
