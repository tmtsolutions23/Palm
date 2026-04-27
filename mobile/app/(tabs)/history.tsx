import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { listReadings, type ReadingListItem } from "@/lib/api";
import { colors, radius, spacing, type } from "@/constants/theme";

export default function History() {
  const router = useRouter();
  const [items, setItems] = useState<ReadingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listReadings({ limit: 50 })
      .then((r) => setItems(r.readings))
      .catch((e) => console.warn(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[type.title, styles.header]}>Your readings</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={
          loading ? null : (
            <Text style={[type.bodyMuted, { padding: spacing.xl }]}>
              Your readings will live here.
            </Text>
          )
        }
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/reading/${item.id}` as never)}
            style={styles.card}
          >
            <Text style={[type.caption]}>{new Date(item.created_at).toLocaleDateString()}</Text>
            <Text style={[type.body, { marginTop: spacing.xs }]} numberOfLines={3}>
              {item.summary}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 80 },
  header: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  card: {
    backgroundColor: colors.bgElevated,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
  },
});
