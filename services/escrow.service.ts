import { escrowApi } from "@/api/escrow.api";
import { useEscrowStore } from "@/store/escrow.store";
import { useToastStore } from "@/store/toast.store";
import { useUserStore } from "@/store/user.store";

const toast = useToastStore.getState();

export type EscrowUser = {
  id: number;
  full_name: string;
  username: string;
};

export type EscrowTransaction = {
  id: number;
  escrow_id: number;
  action: "fund" | "release" | "refund" | "dispute" | "deliver" | "cancel";
  actor: EscrowUser;
  amount: number;
  created_at: string; // ISO string from backend
};

export type Escrow = {
  id: number;
  escrow_ref: string;
  payer: EscrowUser;
  payee: EscrowUser;
  amount: number;
  description?: string | null;
  status:
    | "pending"
    | "funded"
    | "released"
    | "refunded"
    | "delivered"
    | "disputed"
    | "cancelled";
  expires_at?: string | null; // ISO string
  created_at: string; // ISO string
  transactions: EscrowTransaction[];
  time_left?: number; // optional: seconds until expiration
};

function mapEscrowResponse(response: any): Escrow {
  const data = response.data;

  const escrow: Escrow = {
    id: Number(data.id),
    escrow_ref: data.escrow_ref,
    payer: {
      id: Number(data.payer.id),
      full_name: data.payer.full_name,
      username: data.payer.username,
    },
    payee: {
      id: Number(data.payee.id),
      full_name: data.payee.full_name,
      username: data.payee.username,
    },
    amount: Number(data.amount),
    description: data.description ?? null,
    status: data.status,
    expires_at: data.expires_at ?? null,
    created_at: data.created_at,
    transactions: Array.isArray(data.transactions)
      ? data.transactions.map((tx: any) => ({
          id: Number(tx.id),
          escrow_id: Number(tx.escrow_id),
          action: tx.action as EscrowTransaction["action"],
          actor: {
            id: Number(tx.actor.id),
            full_name: tx.actor.full_name,
            username: tx.actor.username,
          },
          amount: Number(tx.amount),
          created_at: tx.created_at,
        }))
      : [],
    time_left: data.time_left ? Number(data.time_left) : undefined,
  };

  return escrow;
}

export const fetchEscrows = async (data: { userId: string }) => {
  const setEscrows = useEscrowStore.getState().setEscrows;
  const setLoading = useEscrowStore.getState().setLoading;

  setLoading(true);
  try {
    const res: any = await escrowApi.fetchEscrows(data);
    if (!res.status || !res.data) return null;

    setEscrows(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

export async function getEscrow(data: {
  escrowRef: string;
}): Promise<Escrow | null> {
  try {
    const res: any = await escrowApi.getEscrow(data);
    if (!res.status || !res.data) return null;

    const escrow = mapEscrowResponse(res);

    return escrow;
  } catch (error: any) {
    toast.show({ message: error.message, type: "error" });
    return null;
  }
}

export async function createEscrow(data: {
  payerId: string;
  payeeId: string;
  amount: string;
  description: string;
  expiresAt: string;
}): Promise<string | null> {
  try {
    const res: any = await escrowApi.createEscrow(data);
    if (!res.escrow_ref) return null;

    return res.escrow_ref;
  } catch (error: any) {
    toast.show({ message: error.message, type: "error" });
    return null;
  }
}

export async function fundEscrow(data: {
  escrowRef: string;
  payerId: string;
}): Promise<string | null> {
  try {
    const res: any = await escrowApi.fundEscrow(data);
    if (!res.escrow_ref) return null;

    return res.escrow_ref;
  } catch (error: any) {
    toast.show({ message: error.message, type: "error" });
    return null;
  }
}

export async function releaseEscrow(data: {
  escrowRef: string;
  actorId: string;
}): Promise<string | null> {
  try {
    const res: any = await escrowApi.releaseEscrow(data);
    if (!res.escrow_ref) return null;

    return res.escrow_ref;
  } catch (error: any) {
    toast.show({ message: error.message, type: "error" });
    return null;
  }
}

export async function refundEscrow(data: {
  escrowRef: string;
  actorId: string;
}): Promise<string | null> {
  try {
    const res: any = await escrowApi.refundEscrow(data);
    if (!res.escrow_ref) return null;

    return res.escrow_ref;
  } catch (error: any) {
    toast.show({ message: error.message, type: "error" });
    return null;
  }
}

export async function deliverEscrow(data: {
  escrowRef: string;
  actorId: string;
}): Promise<string | null> {
  try {
    const res: any = await escrowApi.deliverEscrow(data);
    if (!res.escrow_ref) return null;

    return res.escrow_ref;
  } catch (error: any) {
    toast.show({ message: error.message, type: "error" });
    return null;
  }
}

export async function disputeEscrow(data: {
  escrowRef: string;
  actorId: string;
}): Promise<string | null> {
  try {
    const res: any = await escrowApi.disputeEscrow(data);
    if (!res.escrow_ref) return null;

    return res.escrow_ref;
  } catch (error: any) {
    toast.show({ message: error.message, type: "error" });
    return null;
  }
}

export async function cancelEscrow(data: {
  escrowRef: string;
  actorId: string;
}): Promise<string | null> {
  try {
    const res: any = await escrowApi.cancelEscrow(data);
    if (!res.escrow_ref) return null;

    return res.escrow_ref;
  } catch (error: any) {
    toast.show({ message: error.message, type: "error" });
    return null;
  }
}
