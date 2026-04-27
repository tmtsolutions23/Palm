import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  LOG_LEVEL,
} from "react-native-purchases";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

let initialized = false;

export async function initRevenueCat(supabaseUserId: string | null): Promise<void> {
  if (initialized && !supabaseUserId) return;

  const apiKey = Platform.select({ ios: IOS_KEY, android: ANDROID_KEY });
  if (!apiKey) {
    console.warn("[RC] missing API key for platform");
    return;
  }

  if (!initialized) {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey, appUserID: supabaseUserId ?? null });
    initialized = true;
  } else if (supabaseUserId) {
    await Purchases.logIn(supabaseUserId);
  }
}

export async function logoutRevenueCat(): Promise<void> {
  if (!initialized) return;
  await Purchases.logOut();
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  const o = await Purchases.getOfferings();
  return o.current;
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export async function purchase(productId: string): Promise<CustomerInfo> {
  const offering = await getOfferings();
  const pkg = offering?.availablePackages.find(
    (p) => p.product.identifier === productId,
  );
  if (!pkg) throw new Error(`Product ${productId} not found in current offering`);
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

/** Match the entitlement identifier configured in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT = "pro";

export function hasPro(info: CustomerInfo): boolean {
  return info.entitlements.active[PRO_ENTITLEMENT] !== undefined;
}
