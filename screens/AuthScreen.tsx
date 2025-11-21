import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Pressable } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootNavigator";

type AuthScreenRouteProp = RouteProp<RootStackParamList, "Auth">;

export default function AuthScreen() {
  const route = useRoute<AuthScreenRouteProp>();
  const navigation = useNavigation();
  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();
  const [mode, setMode] = useState<"signin" | "signup">(route.params.mode);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (mode === "signup" && !displayName) {
      Alert.alert("Error", "Please enter a display name");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(username, password);
      } else {
        await signUp(username, displayName, password);
      }
    } catch (error) {
      Alert.alert("Error", "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {mode === "signin"
              ? "Sign in to continue chatting"
              : "Join the SDCI chat community"}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {mode === "signup" ? (
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Display Name</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="How should we call you?"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <Button
            title={mode === "signin" ? "Sign In" : "Create Account"}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />

          <Pressable onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
            <ThemedText style={styles.switchText}>
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </ThemedText>
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          <ThemedText style={styles.cancelText}>Cancel</ThemedText>
        </Pressable>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    marginBottom: Spacing["2xl"],
  },
  title: {
    ...Typography.header,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    opacity: 0.7,
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.subhead,
    fontWeight: "600",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    fontSize: 17,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  switchText: {
    ...Typography.body,
    textAlign: "center",
    opacity: 0.7,
  },
  cancelButton: {
    marginTop: Spacing.xl,
    alignItems: "center",
  },
  cancelText: {
    ...Typography.body,
    opacity: 0.5,
  },
});
