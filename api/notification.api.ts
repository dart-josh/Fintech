import client from "./client";

export const notificationApi = {
  saveDeviceToken: (data: {
    userId: string;
    token: string;
  }) => client.post("/api/notification/saveDevice", data),

  deactivateDevice: (data: { userId: string, token: string }) =>
    client.post("/api/notification/disable", data),

  markAsRead: (data: { userId: string, notificationId: string }) =>
    client.post("/api/notification/markAsRead", data),
};