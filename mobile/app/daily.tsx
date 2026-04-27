import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { getTodayInsight, markInsightOpened, type DailyInsight, ApiError } from "@/lib/api";
import { track, Event } from "@/lib/analytics";
import { colors, spacing, type } from "@/constants/theme";

export default function Daily() {
  const router = useRouter();
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    getTodayInsight()
      .then((i) => {
        setInsight(i);
        track(Event.DailyOpened);
        if (!i.opened_at) markInsightOpened(i.id).catch(() => {});
      })
      .catch((e: ApiError) => setError(e));
  }, []);

  if (error) {
    if (error.code === "paywall_required") {
      return (
        <View style={styles.center}>
          <Text style={[type.title, { textAlign: "center", marginBottom: spacing.md }]}>
            Daily insights are Pro
          </Text>
          <Button title="See plans" onPress={() => router.replace("/paywall")} />
        </View>
      );
    }
    if (error.code === "no_reading") {
      return (
        <View style={styles.center}>
          <Text style={[type.title, { textAlign: "center", marginBottom: spacing.md }]}>
            Take your first reading first
          </Text>
          <Button title="Take a reading" onPress={() => router.replace("/reading/capture")} />
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <Text style={[type.body, { color: colors.danger }]}>{error.message}</Text>
      </View>
    );
  }

  if (!insight) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[type.caption, { color: colors.accent, letterSpacing: 1.5 }]}>
        {new Date(insight.for_date).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        }).toUpperCase()}
      </Text>
      <Text style={[type.display, styles.body]}>{insight.content}</Text>
      <Button title="Done" variant="ghost" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    paddingTop: 100,
    gap: spacing.lg,
    justifyContent: "space-between",
  },
  body: { lineHeight: 44 },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
});
