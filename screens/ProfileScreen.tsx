import React, { useState } from "react";
import { StyleSheet, TextInput, View, Alert, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const { theme } = useTheme();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");

  const handleSave = async () => {
    if (displayName.trim()) {
      await updateUser({ displayName, bio });
      Alert.alert("Success", "Profile updated");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  if (!user) return null;

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <View style={styles.avatarSection}>
          <Avatar name={user.displayName} size={100} />
          <ThemedText style={styles.username}>@{user.username}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>Display Name</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your display name"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>Bio</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.bioInput,
              { backgroundColor: theme.surface, color: theme.text },
            ]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself (120 characters max)"
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={120}
          />
          <ThemedText style={styles.charCount}>{bio.length}/120</ThemedText>
        </View>

        <Button title="Save Changes" onPress={handleSave} style={styles.saveButton} />

        <View style={styles.divider} />

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>
          <Pressable onPress={handleSignOut} style={styles.settingRow}>
            <ThemedText style={[styles.settingText, { color: theme.error }]}>
              Sign Out
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  username: {
    ...Typography.body,
    marginTop: Spacing.md,
    opacity: 0.7,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.subhead,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    fontSize: 17,
  },
  bioInput: {
    height: 100,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
  charCount: {
    ...Typography.caption,
    opacity: 0.5,
    marginTop: Spacing.xs,
    textAlign: "right",
  },
  saveButton: {
    marginVertical: Spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#00000020",
    marginVertical: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.title,
    marginBottom: Spacing.md,
  },
  settingRow: {
    paddingVertical: Spacing.md,
  },
  settingText: {
    ...Typography.body,
  },
});
