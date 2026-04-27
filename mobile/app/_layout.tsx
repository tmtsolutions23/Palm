import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "@/lib/auth-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { track, Event } from "@/lib/analytics";
import { colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    track(Event.AppOpen);
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ErrorBoundary>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="reading/capture" options={{ presentation: "fullScreenModal" }} />
          <Stack.Screen name="reading/[id]" />
          <Stack.Screen name="compatibility/capture" options={{ presentation: "fullScreenModal" }} />
          <Stack.Screen name="compatibility/[id]" />
          <Stack.Screen name="paywall" options={{ presentation: "modal" }} />
          <Stack.Screen name="daily" />
        </Stack>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
