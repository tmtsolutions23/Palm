import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import { Button } from "@/components/Button";
import { getOfferings, purchase, restorePurchases, hasPro } from "@/lib/revenuecat";
import { useSubscription } from "@/hooks/useSubscription";
import { track, Event } from "@/lib/analytics";
import { colors, radius, spacing, type } from "@/constants/theme";

export default function Paywall() {
  const router = useRouter();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { refresh } = useSubscription();

  useEffect(() => {
    track(Event.PaywallView);
    getOfferings()
      .then((o) => {
        setOffering(o);
        // Default-select the annual package if available
        const annual = o?.availablePackages.find((p) => p.identifier.toLowerCase().includes("annual"));
        const fallback = o?.availablePackages[0];
        setSelected(annual?.product.identifier ?? fallback?.product.identifier ?? null);
      })
      .catch((e) => console.warn("offerings", e));
  }, []);

  const packages = useMemo(() => offering?.availablePackages ?? [], [offering]);

  const onBuy = async () => {
    if (!selected) return;
    setBusy(true);
    track(Event.PurchaseStarted, { product: selected });
    try {
      const info = await purchase(selected);
      track(Event.PurchaseCompleted, { product: selected });
      await refresh();
      if (hasPro(info)) router.back();
    } catch (e) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err.userCancelled) Alert.alert("Purchase failed", err.message ?? "Try again");
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    setBusy(true);
    try {
      const info = await restorePurchases();
      track(Event.PurchaseRestored);
      await refresh();
      if (hasPro(info)) router.back();
      else Alert.alert("No purchases found");
    } catch (e) {
      Alert.alert("Restore failed", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.close} hitSlop={16}>
        <Text style={{ color: colors.textMuted, fontSize: 22 }}>✕</Text>
      </Pressable>

      <Text style={[type.display, styles.title]}>Unlock the rest of your palm</Text>

      <View style={styles.bullets}>
        <Bullet text="Unlimited readings" />
        <Bullet text="Daily insights, every morning" />
        <Bullet text="Compatibility readings" />
        <Bullet text="Full reading history" />
      </View>

      <View style={styles.packages}>
        {packages.map((p) => (
          <PackageCard
            key={p.identifier}
            pkg={p}
            selected={p.product.identifier === selected}
            onSelect={() => setSelected(p.product.identifier)}
          />
        ))}
      </View>

      <Button title="Continue" onPress={onBuy} loading={busy} disabled={!selected} />

      <Pressable onPress={onRestore}>
        <Text style={[type.caption, styles.restore]}>Restore purchases</Text>
      </Pressable>

      <Text style={[type.caption, styles.legal]}>
        Subscriptions auto-renew until cancelled. Cancel any time in your account settings. Annual plan
        billed annually after a 3-day free trial.
      </Text>
    </ScrollView>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={{ color: colors.accent, fontSize: 18 }}>✶</Text>
      <Text style={[type.body, { flex: 1 }]}>{text}</Text>
    </View>
  );
}

function PackageCard({
  pkg,
  selected,
  onSelect,
}: {
  pkg: PurchasesPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={[styles.pkg, selected && styles.pkgSelected]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[type.body, { fontWeight: "600" }]}>{pkg.product.title}</Text>
        <Text style={[type.caption]}>{pkg.product.description}</Text>
      </View>
      <Text style={[type.body, { color: selected ? colors.accent : colors.text }]}>
        {pkg.product.priceString}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    padding: spacing.xl,
    paddingTop: 80,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  close: { position: "absolute", top: 60, right: spacing.lg, zIndex: 10 },
  title: { marginBottom: spacing.md },
  bullets: { gap: spacing.sm },
  bulletRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  packages: { gap: spacing.sm, marginTop: spacing.lg },
  pkg: {
    flexDirection: "row",
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.bgElevated,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pkgSelected: { borderColor: colors.accent },
  restore: { textAlign: "center", marginTop: spacing.md },
  legal: { textAlign: "center", color: colors.textSubtle },
});
