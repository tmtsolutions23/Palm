import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/Button";
import { colors, radius, spacing, type } from "@/constants/theme";

export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<"apple" | "email" | null>(null);

  const onApple = async () => {
    try {
      setBusy("apple");
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error("No identity token");

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });
      if (error) throw error;

      router.replace("/(tabs)");
    } catch (e) {
      const err = e as { code?: string; message?: string };
      if (err.code !== "ERR_CANCELED") Alert.alert("Sign-in failed", err.message ?? "Try again");
    } finally {
      setBusy(null);
    }
  };

  const onEmail = async () => {
    try {
      setBusy("email");
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      Alert.alert("Check your email", "We sent you a magic link to sign in.");
    } catch (e) {
      const err = e as { message?: string };
      Alert.alert("Sign-in failed", err.message ?? "Try again");
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={[type.display, styles.title]}>Welcome</Text>
        <Text style={[type.bodyMuted, styles.subtitle]}>Sign in to take your first reading.</Text>
      </View>

      <View style={styles.actions}>
        {Platform.OS === "ios" && (
          <Button title="Continue with Apple" variant="secondary" onPress={onApple} loading={busy === "apple"} />
        )}

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={[type.caption, { marginHorizontal: spacing.md }]}>or</Text>
          <View style={styles.line} />
        </View>

        <TextInput
          placeholder="you@example.com"
          placeholderTextColor={colors.textSubtle}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <Button
          title="Email me a link"
          onPress={onEmail}
          loading={busy === "email"}
          disabled={!email.includes("@")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  title: { marginBottom: spacing.md },
  subtitle: {},
  actions: { gap: spacing.md, paddingBottom: spacing.xxl },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.divider },
  input: {
    height: 56,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bgElevated,
    color: colors.text,
    fontSize: 17,
    borderWidth: 1,
    borderColor: colors.divider,
  },
});
