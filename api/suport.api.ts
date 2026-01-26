import client from "./client";

export const supportApi = {
  storeMessage: (data: {
    userId: string;
    message: string;
    senderType: string;
  }) => client.post("/api/support/sendMessage", data),

  getMessages: (data: {
    userId: string;
  }) => client.post("/api/support/getMessages", data),
};
