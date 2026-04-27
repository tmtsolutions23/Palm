import { useState, useRef } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { colors, spacing, type } from "@/constants/theme";

const { width } = Dimensions.get("window");

const PAGES = [
  {
    symbol: "✶",
    title: "Your palm tells your story",
    body: "Centuries-old palmistry, made personal.",
  },
  {
    symbol: "◐",
    title: "Powered by AI vision",
    body: "Your photo is analyzed for the depth and shape of every line.",
  },
  {
    symbol: "✦",
    title: "Your first reading is free",
    body: "Take a photo. Read in 15 seconds. Share with anyone.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== page) setPage(next);
  };

  const next = () => {
    if (page < PAGES.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (page + 1), animated: true });
    } else {
      router.push("/onboarding/auth");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={32}
      >
        {PAGES.map((p, i) => (
          <View key={i} style={[styles.page, { width }]}>
            <Text style={styles.symbol}>{p.symbol}</Text>
            <Text style={[type.display, styles.title]}>{p.title}</Text>
            <Text style={[type.bodyMuted, styles.body]}>{p.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {PAGES.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.cta}>
        <Button title={page === PAGES.length - 1 ? "Get started" : "Next"} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: "space-between" },
  page: { alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, paddingTop: 120 },
  symbol: { fontSize: 64, color: colors.accent, marginBottom: spacing.xl },
  title: { textAlign: "center", marginBottom: spacing.md },
  body: { textAlign: "center" },
  dots: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, marginVertical: spacing.lg },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.divider },
  dotActive: { backgroundColor: colors.accent, width: 18 },
  cta: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
});
