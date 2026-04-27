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
      <Text style={[type.bodyMuted, styles.subtitle]}>
        Get your real AI reading personalized from your palm photo. Annual includes a 3-day free
        trial and is the best value.
      </Text>

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
        Weekly renews at {findPrice(packages, "week") ?? "$7.99/week"} until cancelled. Annual renews at {findPrice(packages, "annual") ?? "$39.99/year"} after a 3-day free trial. Lifetime is a one-time purchase.
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
  const id = `${pkg.identifier} ${pkg.product.identifier} ${pkg.product.title}`.toLowerCase();
  const isAnnual = id.includes("annual") || id.includes("year");
  const isWeekly = id.includes("week");
  const isLifetime = id.includes("lifetime");

  let badge: string | null = null;
  if (isAnnual) badge = "BEST VALUE · 3-DAY TRIAL";
  else if (isWeekly) badge = "NO TRIAL";
  else if (isLifetime) badge = "ONE-TIME";

  return (
    <Pressable
      onPress={onSelect}
      style={[styles.pkg, selected && styles.pkgSelected]}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.pkgHeader}>
          <Text style={[type.body, { fontWeight: "600" }]}>{pkg.product.title}</Text>
          {badge ? <Text style={styles.badge}>{badge}</Text> : null}
        </View>
        <Text style={[type.caption]}>{pkg.product.description}</Text>
      </View>
      <Text style={[type.body, { color: selected ? colors.accent : colors.text }]}>
        {pkg.product.priceString}
      </Text>
    </Pressable>
  );
}

function findPrice(packages: PurchasesPackage[], token: string): string | null {
  const match = packages.find((p) => {
    const hay = `${p.identifier} ${p.product.identifier} ${p.product.title}`.toLowerCase();
    return hay.includes(token);
  });
  return match?.product.priceString ?? null;
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
  subtitle: { marginTop: -spacing.sm, marginBottom: spacing.md },
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
  pkgHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  badge: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: "700",
  },
  restore: { textAlign: "center", marginTop: spacing.md },
  legal: { textAlign: "center", color: colors.textSubtle },
});
