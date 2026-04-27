import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { ReadingCard } from "@/components/ReadingCard";
import { getReading, ApiError } from "@/lib/api";
import { track, Event } from "@/lib/analytics";
import { colors, spacing, type } from "@/constants/theme";

export default function Result() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reading, setReading] = useState<{
    summary: string;
    lines_jsonb: { life: string; heart: string; head: string; fate: string };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getReading(id)
      .then((r) => setReading({ summary: r.summary, lines_jsonb: r.lines_jsonb }))
      .catch((e: ApiError) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[type.body, { color: colors.danger }]}>{error}</Text>
        <Button title="Go back" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  if (!reading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
        <Text style={[type.bodyMuted, { marginTop: spacing.md }]}>Reading your palm…</Text>
      </View>
    );
  }

  const onShare = async () => {
    track(Event.ShareTapped);
    try {
      await Share.share({
        message: `${reading.summary}\n\n— Palm Reader`,
      });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[type.display, styles.title]}>Your reading</Text>
      <Text style={[type.body, styles.summary]}>{reading.summary}</Text>

      <View style={styles.cards}>
        <ReadingCard symbol="✶" title="Life line" body={reading.lines_jsonb.life} />
        <ReadingCard symbol="♡" title="Heart line" body={reading.lines_jsonb.heart} />
        <ReadingCard symbol="◐" title="Head line" body={reading.lines_jsonb.head} />
        <ReadingCard symbol="✦" title="Fate line" body={reading.lines_jsonb.fate} />
      </View>

      <View style={styles.actions}>
        <Button title="Share reading" onPress={onShare} />
        <Button title="Done" variant="ghost" onPress={() => router.replace("/(tabs)")} />
      </View>
    </ScrollView>
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  title: {},
  summary: { marginBottom: spacing.md },
  cards: { gap: spacing.md },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
