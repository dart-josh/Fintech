import { cardApi } from "@/api/card.api";
import { useToastStore } from "@/store/toast.store";

const toast = useToastStore.getState();

export async function requestCard(data: {
  userId: string;
  full_name: string;
  dob: string;
  address: string;
  phone: string;
  email: string;
}): Promise<{success: boolean, error?: string}> {
  try {
    const res = await cardApi.requestCard(data);

    if (!res.status) return {success: false, error: "We couldn’t process your card request at this time."};
    return {success: true};
  } catch (error: any) {
    toast.show({ message: error.message, type: "error" });
    return {success: false, error: error.message};
  }
}
