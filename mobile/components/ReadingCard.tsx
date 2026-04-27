import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, type } from "@/constants/theme";

interface Props {
  title: string;
  body: string;
  symbol?: string;
}

export function ReadingCard({ title, body, symbol }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        {symbol ? <Text style={styles.symbol}>{symbol}</Text> : null}
        <Text style={[type.title, styles.title]}>{title}</Text>
      </View>
      <Text style={[type.body, styles.body]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    gap: spacing.md,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  symbol: { fontSize: 22, color: colors.accent },
  title: { color: colors.accentHi },
  body: { color: colors.textMuted },
});
