import { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { PalmOverlay } from "@/components/PalmOverlay";
import { uploadPalmPhoto, createReading, ApiError } from "@/lib/api";
import { track, Event } from "@/lib/analytics";
import { colors, spacing, type } from "@/constants/theme";

export default function Capture() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [hand, setHand] = useState<"left" | "right">("right");
  const [busy, setBusy] = useState(false);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permission]}>
        <Text style={[type.title, { textAlign: "center", marginBottom: spacing.md }]}>
          Camera access needed
        </Text>
        <Text style={[type.bodyMuted, { textAlign: "center", marginBottom: spacing.xl }]}>
          We use your camera to capture your palm.
        </Text>
        <Button title="Enable camera" onPress={requestPermission} />
      </View>
    );
  }

  const capture = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    track(Event.ReadingStarted, { hand });

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      if (!photo) throw new Error("Capture failed");

      // Compress to keep request size reasonable
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );

      const uploaded = await uploadPalmPhoto({ uri: manipulated.uri, hand });
      const reading = await createReading({ photo_id: uploaded.id, hand });

      track(Event.ReadingCompleted);
      router.replace(`/reading/${reading.reading_id}` as never);
    } catch (e) {
      const err = e as ApiError;
      track(Event.ReadingFailed, { code: err.code });
      if (err.code === "paywall_required") {
        router.replace("/paywall");
        return;
      }
      if (err.code === "photo_quality_low") {
        Alert.alert("Try again", err.message);
        return;
      }
      Alert.alert("Something went wrong", err.message ?? "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      <PalmOverlay />

      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={16}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <View style={styles.handToggle}>
          <Pressable
            onPress={() => setHand("left")}
            style={[styles.handPill, hand === "left" && styles.handPillActive]}
          >
            <Text style={[type.caption, hand === "left" && { color: colors.bg }]}>Left</Text>
          </Pressable>
          <Pressable
            onPress={() => setHand("right")}
            style={[styles.handPill, hand === "right" && styles.handPillActive]}
          >
            <Text style={[type.caption, hand === "right" && { color: colors.bg }]}>Right</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.bottom}>
        <Text style={[type.bodyMuted, styles.tip]}>
          Hold your palm flat. Even lighting. Fill the outline.
        </Text>
        <Pressable onPress={capture} disabled={busy} style={[styles.shutter, busy && { opacity: 0.5 }]}>
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permission: { backgroundColor: colors.bg, justifyContent: "center", padding: spacing.xl },
  topBar: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  close: { color: colors.text, fontSize: 28 },
  handToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 999,
    padding: 4,
  },
  handPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 999 },
  handPillActive: { backgroundColor: colors.accent },
  bottom: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: spacing.lg,
  },
  tip: { textAlign: "center", paddingHorizontal: spacing.xl, color: colors.text },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.text },
});
