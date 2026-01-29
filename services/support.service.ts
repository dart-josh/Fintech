import { supportApi } from "@/api/support.api";

export async function storeMessage(data: {
  userId: string;
  message: string;
  senderType: string;
}): Promise<boolean> {
  try {
    const res = await supportApi.storeMessage(data);
    // console.log(res)
    return true;
  } catch (error) {
    // console.log(error)
    return false;
  }
}

export async function getMessages(data: {
  userId: string;
}): Promise<[]> {
  try {
    const res: any = await supportApi.getMessages(data);
    // console.log(res)
    return res.messages;
    // return true;
  } catch (error) {
    console.log(error)
    return [];
  }
}
