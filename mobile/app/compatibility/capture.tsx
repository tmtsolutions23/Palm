import { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { PalmOverlay } from "@/components/PalmOverlay";
import { uploadPalmPhoto, createCompatibility, ApiError } from "@/lib/api";
import { useSubscription } from "@/hooks/useSubscription";
import { track, Event } from "@/lib/analytics";
import { colors, radius, spacing, type } from "@/constants/theme";

type Step = "label" | "capture-a" | "capture-b" | "submitting";

export default function CompatibilityCapture() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { isPro } = useSubscription();

  const [step, setStep] = useState<Step>("label");
  const [partnerLabel, setPartnerLabel] = useState("");
  const [photoA, setPhotoA] = useState<string | null>(null);
  const [photoB, setPhotoB] = useState<string | null>(null);

  if (!isPro) {
    return (
      <View style={[styles.container, styles.permission]}>
        <Text style={[type.title, { textAlign: "center", marginBottom: spacing.md }]}>Pro feature</Text>
        <Text style={[type.bodyMuted, { textAlign: "center", marginBottom: spacing.xl }]}>
          Compatibility readings are part of Palm Reader Pro.
        </Text>
        <Button title="See plans" onPress={() => router.replace("/paywall")} />
      </View>
    );
  }

  if (step === "label") {
    return (
      <View style={[styles.container, styles.permission]}>
        <Text style={[type.title, styles.heading]}>Who's the other palm for?</Text>
        <TextInput
          placeholder="Their name"
          placeholderTextColor={colors.textSubtle}
          value={partnerLabel}
          onChangeText={setPartnerLabel}
          style={styles.input}
        />
        <Button
          title="Continue"
          disabled={partnerLabel.trim().length < 1}
          onPress={() => {
            track(Event.CompatibilityStarted);
            setStep("capture-a");
          }}
          style={{ marginTop: spacing.md }}
        />
      </View>
    );
  }

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permission]}>
        <Button title="Enable camera" onPress={requestPermission} />
      </View>
    );
  }

  const captureCurrent = async () => {
    if (!cameraRef.current || step === "submitting") return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo) throw new Error("Capture failed");
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
      );
      const uploaded = await uploadPalmPhoto({ uri: manipulated.uri, hand: "right" });

      if (step === "capture-a") {
        setPhotoA(uploaded.id);
        setStep("capture-b");
      } else if (step === "capture-b") {
        if (!photoA) throw new Error("Missing photo A");
        setStep("submitting");
        try {
          const result = await createCompatibility({
            photo_a_id: photoA,
            photo_b_id: uploaded.id,
            partner_label: partnerLabel.trim(),
          });
          track(Event.CompatibilityCompleted);
          router.replace(`/compatibility/${result.id}` as never);
        } catch (e) {
          const err = e as ApiError;
          Alert.alert("Reading failed", err.message ?? "Try again");
          setStep("capture-b");
        }
      }
    } catch (e) {
      const err = e as Error;
      Alert.alert("Capture failed", err.message);
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
        <Text style={[type.caption, { color: colors.text }]}>
          {step === "capture-a" ? "Your palm" : `${partnerLabel}'s palm`}
        </Text>
      </View>

      <View style={styles.bottom}>
        <Pressable onPress={captureCurrent} style={styles.shutter}>
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  permission: { backgroundColor: colors.bg, justifyContent: "center", padding: spacing.xl },
  heading: { textAlign: "center", marginBottom: spacing.lg },
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
  bottom: { position: "absolute", bottom: 60, left: 0, right: 0, alignItems: "center" },
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
