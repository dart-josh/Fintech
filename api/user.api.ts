import client from "./client";

export const userApi = {
  fetchUser: (data: { userId: string }) => client.post("/api/user/me", data),

  verifyUserEmail: (data: { userId: string }) =>
    client.post("/api/user/verifyEmail", data),

  getUserVerifications: (data: { userId: string }) =>
    client.post("/api/user/get_verification", data),

  submitBvn: (data: { userId: string; bvn: string }) =>
    client.post("/api/user/submit_bvn", data),

  submitNin: (data: { userId: string; nin: string }) =>
    client.post("/api/user/submit_nin", data),

  submitAddress: (data: {
    userId: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => client.post("/api/user/submit_address", data),

  submitNok: (data: {
    userId: string;
    fullName: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
  }) => client.post("/api/user/submit_nok", data),

  fetchUserByDetails: (data: { userDetail: string }) =>
    client.post("/api/user/fetchUserByDetails", data),
};
