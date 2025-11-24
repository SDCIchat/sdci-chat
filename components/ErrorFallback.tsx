import React from "react";
import { reloadAppAsync } from "expo";
import {
  StyleSheet,
  View,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const { theme } = useTheme();

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch (restartError) {
      console.error("Failed to restart app:", restartError);
      resetError();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Feather name="alert-circle" size={48} color={theme.text} style={styles.icon} />
        
        <ThemedText type="h1" style={styles.title}>
          Something went wrong
        </ThemedText>

        <ThemedText type="body" style={styles.message}>
          Please tap Try Again to reload the app.
        </ThemedText>

        {__DEV__ && (
          <ThemedText type="body" style={styles.errorDetails}>
            {error?.message}
          </ThemedText>
        )}

        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: theme.link,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <ThemedText
            type="body"
            style={[styles.buttonText, { color: theme.buttonText }]}
          >
            Try Again
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
    width: "100%",
    maxWidth: 600,
  },
  icon: {
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    lineHeight: 40,
  },
  message: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 24,
  },
  errorDetails: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.5,
    lineHeight: 18,
    marginTop: Spacing.lg,
  },
  button: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing["2xl"],
    minWidth: 200,
    elevation: 3,
    marginTop: Spacing.lg,
  },
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
