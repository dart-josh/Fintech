import client from "./client";

export const cardApi = {
  requestCard: (data: {
    userId: string;
    full_name: string;
    dob: string;
    address: string;
    phone: string;
    email: string;
  }) => client.post("/api/cards/request", data),

};