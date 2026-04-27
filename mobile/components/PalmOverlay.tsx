import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "@/constants/theme";

/**
 * Translucent palm outline overlay shown on the camera view to help users
 * align their palm. Stylized — not anatomically precise — but enough that
 * users know what shape to fill.
 */
export function PalmOverlay() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.center}>
        <Svg width={260} height={340} viewBox="0 0 260 340">
          <Path
            d="M130 330 C 60 330, 30 270, 30 220 L 30 150 C 30 130, 50 130, 55 150 L 60 200 L 60 70 C 60 55, 80 55, 85 70 L 90 200 L 95 50 C 95 35, 115 35, 120 50 L 125 200 L 130 60 C 130 45, 150 45, 155 60 L 160 210 L 170 110 C 170 95, 190 95, 195 110 L 210 230 C 220 260, 200 320, 130 330 Z"
            stroke={colors.accentHi}
            strokeWidth={2.5}
            strokeOpacity={0.55}
            fill="rgba(232, 179, 73, 0.05)"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
