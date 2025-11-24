import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, View, Alert, Pressable, FlatList, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";
import { StorageService, Conversation } from "@/utils/storage";

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const { theme } = useTheme();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [classGroups, setClassGroups] = useState<Conversation[]>([]);
  const [showClassGroupModal, setShowClassGroupModal] = useState(false);
  const [classSearch, setClassSearch] = useState("");
  const [newClassGroup, setNewClassGroup] = useState({
    period: "",
    subject: "",
    teacher: "",
  });

  useEffect(() => {
    loadClassGroups();
  }, []);

  const loadClassGroups = async () => {
    const groups = await StorageService.getClassGroups();
    setClassGroups(groups);
  };

  const createClassGroup = async () => {
    if (!newClassGroup.period || !newClassGroup.subject || !newClassGroup.teacher) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const groupName = `${newClassGroup.period} - ${newClassGroup.subject} (${newClassGroup.teacher})`;
    const newGroup: Conversation = {
      id: `class_${Date.now()}`,
      name: groupName,
      isGroup: true,
      isClassGroup: true,
      unreadCount: 0,
      participants: [user?.id || ""],
      period: newClassGroup.period,
      subject: newClassGroup.subject,
      teacher: newClassGroup.teacher,
    };

    await StorageService.addConversation(newGroup);
    setClassGroups([...classGroups, newGroup]);
    setNewClassGroup({ period: "", subject: "", teacher: "" });
    setShowClassGroupModal(false);
    Alert.alert("Success", "Class group created!");
  };

  const handleSave = async () => {
    if (displayName.trim()) {
      await updateUser({ displayName, bio });
      Alert.alert("Success", "Profile updated");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  if (!user) return null;

  const filteredGroups = classGroups.filter((g) =>
    g.name.toLowerCase().includes(classSearch.toLowerCase())
  );

  return (
    <>
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
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Class Groups</ThemedText>
              <Pressable onPress={() => setShowClassGroupModal(true)}>
                <Feather name="plus" size={24} color={theme.primary} />
              </Pressable>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
              value={classSearch}
              onChangeText={setClassSearch}
              placeholder="Search class groups..."
              placeholderTextColor={theme.textSecondary}
            />
            {filteredGroups.length === 0 ? (
              <ThemedText style={styles.emptyText}>No class groups found</ThemedText>
            ) : (
              <View style={styles.groupsList}>
                {filteredGroups.map((group) => (
                  <View key={group.id} style={[styles.groupItem, { borderBottomColor: theme.border }]}>
                    <View style={styles.groupInfo}>
                      <ThemedText style={styles.groupName}>{group.name}</ThemedText>
                      <ThemedText style={styles.groupMemberCount}>
                        {group.participants.length} member{group.participants.length !== 1 ? "s" : ""}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

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

      <Modal visible={showClassGroupModal} transparent animationType="slide">
        <View style={[styles.modalOverlay, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Create Class Group</ThemedText>
              <Pressable onPress={() => setShowClassGroupModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.label}>Period</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                value={newClassGroup.period}
                onChangeText={(text) => setNewClassGroup({ ...newClassGroup, period: text })}
                placeholder="e.g., Period 1, Block A"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.label}>Subject</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                value={newClassGroup.subject}
                onChangeText={(text) => setNewClassGroup({ ...newClassGroup, subject: text })}
                placeholder="e.g., Biology, Chemistry"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.label}>Teacher Name</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
                value={newClassGroup.teacher}
                onChangeText={(text) => setNewClassGroup({ ...newClassGroup, teacher: text })}
                placeholder="e.g., Mr. Smith"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <Button title="Create Group" onPress={createClassGroup} style={styles.saveButton} />
          </View>
        </View>
      </Modal>
    </>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
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
  groupsList: {
    marginTop: Spacing.md,
  },
  groupItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  groupInfo: {
    gap: Spacing.xs,
  },
  groupName: {
    ...Typography.body,
    fontWeight: "600",
  },
  groupMemberCount: {
    ...Typography.caption,
    opacity: 0.6,
  },
  emptyText: {
    ...Typography.body,
    opacity: 0.5,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.title,
  },
});
