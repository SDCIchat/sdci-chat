import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacing, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootNavigator";

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Welcome">;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView
      style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}
    >
      <View style={styles.content}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.title}>sdci chat</ThemedText>
        <ThemedText style={styles.tagline}>
          Connect with friends, chat in groups, and join the conversation
        </ThemedText>
      </View>
      <View style={styles.footer}>
        <Button
          title="Sign In"
          onPress={() => navigation.navigate("Auth", { mode: "signin" })}
        />
        <Button
          title="Create Account"
          onPress={() => navigation.navigate("Auth", { mode: "signup" })}
          variant="outline"
          style={styles.signupButton}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.headerLarge,
    marginBottom: Spacing.md,
  },
  tagline: {
    ...Typography.body,
    textAlign: "center",
    opacity: 0.7,
    maxWidth: 280,
  },
  footer: {
    gap: Spacing.md,
  },
  signupButton: {
    marginBottom: Spacing.md,
  },
});
