// stores/register.store.ts
import { create } from "zustand";

type RegisterState = {
  email: string;
  phone: string;
  full_name: string;
  username: string;
  password: string;
  emailVerified: boolean;
  userId: string;

  setContact: (data: { email: string; phone: string }) => void;
  setDetails: (data: { full_name: string; username: string; password: string }) => void;
  setEmailVerified: (verified: boolean) => void;
  setUserId: (userId: string) => void;
  reset: () => void;
};


export const useRegisterStore = create<RegisterState>((set) => ({
  email: "",
  phone: "",
  full_name: "",
  username: "",
  password: "",
  emailVerified: false,
  userId: "",

  setContact: (data) => set(data),
  setDetails: (data) => set(data),
  setEmailVerified: (verified) => set({ emailVerified: verified }),
  setUserId: (userId) => set({userId}),
  reset: () =>
    set({
      email: "",
      phone: "",
      full_name: "",
      username: "",
      password: "",
      emailVerified: false,
    }),
}));
