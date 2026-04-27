import { useCallback, useEffect, useState } from "react";
import Purchases, { type CustomerInfo } from "react-native-purchases";
import { hasPro } from "@/lib/revenuecat";

export interface SubscriptionState {
  loading: boolean;
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  refresh: () => Promise<void>;
}

export function useSubscription(): SubscriptionState {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<CustomerInfo | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await Purchases.getCustomerInfo();
      setInfo(next);
    } catch (e) {
      console.warn("[useSubscription] failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const sub = Purchases.addCustomerInfoUpdateListener(setInfo);
    return () => {
      sub.remove();
    };
  }, [refresh]);

  return {
    loading,
    isPro: info ? hasPro(info) : false,
    customerInfo: info,
    refresh,
  };
}
