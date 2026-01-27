import client from "./client";

export const notificationApi = {
  saveDeviceToken: (data: {
    userId: string;
    token: string;
  }) => client.post("/api/notification/saveDevice", data),

};