import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { ReadingCard } from "@/components/ReadingCard";
import { supabase } from "@/lib/supabase";
import { colors, spacing, type } from "@/constants/theme";

interface Compat {
  partner_label: string | null;
  reading_jsonb: { communication: string; romance: string; conflict: string; summary: string };
}

export default function CompatibilityResult() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<Compat | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("compatibility_readings")
      .select("partner_label, reading_jsonb")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else if (!data) setError("Reading not found");
        else setData(data as Compat);
      });
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[type.body, { color: colors.danger }]}>{error}</Text>
      </View>
    );
  }
  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const r = data.reading_jsonb;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[type.display]}>You & {data.partner_label}</Text>
      <Text style={[type.body]}>{r.summary}</Text>
      <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
        <ReadingCard symbol="◐" title="Communication" body={r.communication} />
        <ReadingCard symbol="♡" title="Romance" body={r.romance} />
        <ReadingCard symbol="✦" title="Conflict" body={r.conflict} />
      </View>
      <Button title="Done" variant="ghost" onPress={() => router.replace("/(tabs)")} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.bg, padding: spacing.xl, paddingTop: 80, gap: spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
});
