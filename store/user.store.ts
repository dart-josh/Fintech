import { create } from "zustand";

interface Beneficiary {
  id: string;
  name: string;
  paymentCode: string;
  nickname: string;
}

// Define the User type
export type User = {
  id: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  username: string;
  fullname: string;
  payment_code: string;
  transaction_pin: boolean;
  login_pin: boolean;
};

export type NotificationMod = {
  created_at: string;
  data: any;
  id: string;
  is_read: boolean;
  message: string;
  title: string;
  type: string;
};

export type UserVerification = {
  userId: number;

  bvn: string | null;
  bvnStatus: "Pending" | "Submitted" | "Verified" | "Rejected";
  bvnUploadedAt: string | null;

  nin: string | null;
  ninStatus: "Pending" | "Submitted" | "Verified" | "Rejected";
  ninUploadedAt: string | null;

  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressPostalCode: string | null;
  addressCountry: string | null;
  addressStatus: "Pending" | "Submitted" | "Verified" | "Rejected";
  addressUploadedAt: string | null;

  nokFullName: string | null;
  nokRelationship: string | null;
  nokPhone: string | null;
  nokEmail: string | null;
  nokAddress: string | null;
  nokStatus: "Pending" | "Submitted" | "Verified" | "Rejected";
  nokUploadedAt: string | null;

  userVerified: boolean;
  tier: "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4" | null;

  createdAt: string;
  updatedAt: string;
};

export const mapUser = (data: any): User => ({
  id: data.id,
  email: data.email,
  phone: data.phone,
  username: data.username,
  fullname: data.full_name,
  emailVerified: data.verified_email === "1" || data.verified_email === 1,
  payment_code: data.payment_code,
  login_pin: data.login_pin,
  transaction_pin: data.transaction_pin,
});

type UserDevice = {
  platform: string | null;
  device_token: string | null;
  is_active: boolean;
};

// Define the store state and actions
type UserStore = {
  isAuthenticated: boolean;
  user: User | null;

  beneficiaries: Beneficiary[];

  verificationDetails: UserVerification | null;

  deviceToken: string | null;

  devices: UserDevice[];

  notifications: NotificationMod[];

  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  setAuthenticated: (auth: boolean) => void;

  setBeneficiaries: (beneficiaries: Beneficiary[]) => void;

  setVerificationDetails: (details: UserVerification) => void;

  setDeviceToken: (token: string) => void;

  setDevices: (devices: UserDevice[]) => void;

  setNotification: (notifications: NotificationMod[]) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  isAuthenticated: false,
  user: null,

  beneficiaries: [],

  verificationDetails: null,

  deviceToken: null,
  devices: [],

  notifications: [],

  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      beneficiaries: [],
      verificationDetails: null,
      deviceToken: null,
      devices: [],
      notifications: [],
    }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),

  setBeneficiaries: (beneficiaries) => set({ beneficiaries }),

  setVerificationDetails: (details) => set({ verificationDetails: details }),

  setDeviceToken: (token) => set({ deviceToken: token }),
  setDevices: (devices) => set({ devices }),

  setNotification: (notifications) => set({notifications}),
}));
