import { userApi } from "@/api/user.api";
import { useRegisterStore } from "@/store/register.store";
import { useToastStore } from "@/store/toast.store";
import { useUIStore } from "@/store/ui.store";
import { mapUser, User, UserVerification, useUserStore } from "@/store/user.store";
import { getWalletDetails, listBeneficiaries } from "./wallet.service";

const toast = useToastStore.getState();

// fetch user
export async function fetchUser(userId: string): Promise<User | null> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    const { setUser, setDevices, setNotification } = useUserStore.getState();
    const { setUserId } = useRegisterStore.getState();
    showLoading("");
    const res : any = await userApi.fetchUser({ userId });

    if (!res.user) return null;
    getWalletDetails({ userId });
    listBeneficiaries({ userId });
    getUserVerifications({ userId });

    const user: User = mapUser(res.user);
    setUser(user);
    setUserId(user.id);

    const dvs = res.devices.map((d: any) => {
      return { ...d, is_active: Number(d.is_active) === 1 };
    });
    setDevices(dvs);

    const nots = res.notifications.map((not: any) => {
      return { ...not, is_read: Number(not.is_read) === 1 };
    });
    setNotification(nots);

    return user;
  } catch (error: any) {
    console.error("Fetch User:", error.message);
    return null;
  } finally {
    hideLoading();
  }
}

export async function verifyUserEmail(data: {
  userId: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Verifying email");

    const res = await userApi.verifyUserEmail(data);

    if (!res.status) return false;
    fetchUser(data.userId);

    return true;
  } catch (error: any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return false;
  } finally {
    hideLoading();
  }
}

//? mapping
export function mapUserVerificationResponse(raw: any): UserVerification {
  const v = raw;

  return {
    userId: Number(v.user_id),

    bvn: v.bvn || null,
    bvnStatus: v.bvn_status as
      | "Pending"
      | "Submitted"
      | "Verified"
      | "Rejected",
    bvnUploadedAt: v.bvn_uploaded_at || null,

    nin: v.nin || null,
    ninStatus: v.nin_status as
      | "Pending"
      | "Submitted"
      | "Verified"
      | "Rejected",
    ninUploadedAt: v.nin_uploaded_at || null,

    addressStreet: v.address_street || null,
    addressCity: v.address_city || null,
    addressState: v.address_state || null,
    addressPostalCode: v.address_postal_code || null,
    addressCountry: v.address_country || null,
    addressStatus: v.address_status as
      | "Pending"
      | "Submitted"
      | "Verified"
      | "Rejected",
    addressUploadedAt: v.address_uploaded_at || null,

    nokFullName: v.nok_full_name || null,
    nokRelationship: v.nok_relationship || null,
    nokPhone: v.nok_phone || null,
    nokEmail: v.nok_email || null,
    nokAddress: v.nok_address || null,
    nokStatus: v.nok_status as
      | "Pending"
      | "Submitted"
      | "Verified"
      | "Rejected",
    nokUploadedAt: v.nok_uploaded_at || null,

    userVerified: Number(v.user_verified) === 1,
    tier: v.tier as "Tier 1" | "Tier 2" | "Tier 3" | "Tier 4" | null,

    createdAt: v.created_at,
    updatedAt: v.updated_at,
  };
}

export async function getUserVerifications(data: {
  userId: string;
}): Promise<UserVerification | null> {
  const { setVerificationDetails } = useUserStore.getState();

  try {
    const res : any = await userApi.getUserVerifications(data);

    if (!res.verification) return null;

    const userVerification = mapUserVerificationResponse(res.verification);
    setVerificationDetails(userVerification);
    return userVerification;
  } catch (error) {
    return null;
  }
}

export async function submitBvn(data: {
  userId: string;
  bvn: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Submitting BVN");

    const res = await userApi.submitBvn(data);

    if (!res.status) return false;
    fetchUser(data.userId);

    return true;
  } catch (error : any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return false;
  } finally {
    hideLoading();
  }
}

export async function submitNin(data: {
  userId: string;
  nin: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Submitting NIN");

    const res = await userApi.submitNin(data);

    if (!res.status) return false;
    fetchUser(data.userId);

    return true;
  } catch (error: any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return false;
  } finally {
    hideLoading();
  }
}

export async function submitAddress(data: {
  userId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Submitting Address");

    const res = await userApi.submitAddress(data);

    if (!res.status) return false;
    fetchUser(data.userId);

    return true;
  } catch (error : any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return false;
  } finally {
    hideLoading();
  }
}

export async function submitNok(data: {
  userId: string;
  fullName: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
}): Promise<boolean> {
  const { showLoading, hideLoading } = useUIStore.getState();

  try {
    showLoading("Submitting Next of Kin details");

    const res = await userApi.submitNok(data);

    if (!res.status) return false;
    fetchUser(data.userId);

    return true;
  } catch (error : any) {
    toast.show({
      message: error.message,
      type: "error",
    });
    return false;
  } finally {
    hideLoading();
  }
}
