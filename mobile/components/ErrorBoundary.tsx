import { Component, type ReactNode, type ErrorInfo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { colors, spacing, type } from "@/constants/theme";
import * as PostHog from "posthog-react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Root error boundary. Catches rendering crashes in the entire app tree
 * and shows a friendly retry screen instead of the red box of death.
 * Reports to Sentry/PostHog for monitoring.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Report to PostHog (Sentry is auto-wired via sentry-expo)
    try {
      PostHog.captureException?.(error);
    } catch {
      // PostHog may not be initialized yet
    }
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={type.title}>Something went wrong</Text>
          <Text style={[type.bodyMuted, { marginTop: spacing.md, textAlign: "center" }]}>
            The stars misaligned for a moment. Tap below to try again.
          </Text>
          <View style={{ marginTop: spacing.xl }}>
            <Button title="Try again" onPress={this.handleRetry} />
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
});