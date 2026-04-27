import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { listReadings, getTodayInsight, type ReadingListItem, type DailyInsight } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/hooks/useSubscription";
import { colors, radius, spacing, type } from "@/constants/theme";

export default function Home() {
  const router = useRouter();
  const { session } = useAuth();
  const { isPro } = useSubscription();
  const [recent, setRecent] = useState<ReadingListItem[]>([]);
  const [today, setToday] = useState<DailyInsight | null>(null);

  useEffect(() => {
    if (!session) return;
    listReadings({ limit: 3 })
      .then((r) => setRecent(r.readings))
      .catch((e) => console.warn("listReadings", e));
    if (isPro) {
      getTodayInsight()
        .then(setToday)
        .catch((e) => console.warn("today insight", e));
    }
  }, [session, isPro]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[type.display, styles.greeting]}>Welcome back</Text>
      <Text style={[type.bodyMuted, styles.sub]}>What does your palm say today?</Text>

      <Button
        title="✶  New reading"
        onPress={() => router.push("/reading/capture")}
        style={{ marginTop: spacing.xl }}
      />

      {today && (
        <Pressable onPress={() => router.push("/daily")} style={styles.card}>
          <Text style={[type.caption, { color: colors.accent }]}>TODAY</Text>
          <Text style={[type.body, { marginTop: spacing.sm }]} numberOfLines={3}>
            {today.content}
          </Text>
        </Pressable>
      )}

      <Text style={[type.title, styles.sectionTitle]}>Recent</Text>
      {recent.length === 0 ? (
        <Text style={[type.bodyMuted, styles.empty]}>Your readings will appear here.</Text>
      ) : (
        recent.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => router.push(`/reading/${r.id}` as never)}
            style={styles.card}
          >
            <Text style={[type.caption]}>{new Date(r.created_at).toLocaleDateString()}</Text>
            <Text style={[type.body, { marginTop: spacing.xs }]} numberOfLines={2}>
              {r.summary}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingTop: 80, gap: spacing.md, backgroundColor: colors.bg, flexGrow: 1 },
  greeting: {},
  sub: {},
  card: {
    backgroundColor: colors.bgElevated,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sectionTitle: { marginTop: spacing.lg },
  empty: {},
});
