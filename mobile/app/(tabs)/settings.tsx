import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/hooks/useSubscription";
import { fetchProfile, type Profile } from "@/lib/api";
import { colors, radius, spacing, type } from "@/constants/theme";

const APP_URL = process.env.EXPO_PUBLIC_APP_URL ?? "https://palmreader.app";

export default function Settings() {
  const { signOut, session } = useAuth();
  const { isPro } = useSubscription();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile().then(setProfile).catch(() => {});
  }, []);

  const confirmSignOut = () =>
    Alert.alert("Sign out?", "You can sign back in any time.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
    ]);

  const confirmDelete = () =>
    Alert.alert(
      "Delete account?",
      "This permanently removes your readings, photos, and account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => Linking.openURL(`${APP_URL}/delete-account`),
        },
      ],
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[type.title, styles.header]}>Settings</Text>

      <Section title="Account">
        <Row label="Email" value={session?.user.email ?? "—"} />
        <Row label="Plan" value={isPro ? "Pro" : "Free"} />
        {profile?.subscription_expires_at && (
          <Row
            label="Renews"
            value={new Date(profile.subscription_expires_at).toLocaleDateString()}
          />
        )}
      </Section>

      <Section title="Subscription">
        <ActionRow
          label="Manage subscription"
          onPress={() =>
            Linking.openURL(
              "https://apps.apple.com/account/subscriptions",
            ).catch(() => {})
          }
        />
        <ActionRow label="Restore purchases" onPress={() => {}} />
      </Section>

      <Section title="Legal">
        <ActionRow label="Terms of Service" onPress={() => Linking.openURL(`${APP_URL}/legal/terms`)} />
        <ActionRow label="Privacy Policy" onPress={() => Linking.openURL(`${APP_URL}/legal/privacy`)} />
      </Section>

      <Section title="Danger zone">
        <ActionRow label="Sign out" onPress={confirmSignOut} />
        <ActionRow label="Delete account" onPress={confirmDelete} destructive />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[type.caption, styles.sectionTitle]}>{title.toUpperCase()}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={[type.body, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[type.body]}>{value}</Text>
    </View>
  );
}

function ActionRow({
  label,
  onPress,
  destructive,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <Text style={[type.body, destructive ? { color: colors.danger } : { color: colors.text }]}>
        {label}
      </Text>
      <Text style={{ color: colors.textSubtle }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.bg, paddingTop: 80, paddingBottom: spacing.xxl, gap: spacing.lg },
  header: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  section: { paddingHorizontal: spacing.lg },
  sectionTitle: { paddingHorizontal: spacing.sm, marginBottom: spacing.xs, letterSpacing: 1.2 },
  sectionBody: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.divider,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
});
