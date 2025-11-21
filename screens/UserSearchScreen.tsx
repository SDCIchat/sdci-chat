import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, FlatList, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { StorageService, User, FriendRequest } from "@/utils/storage";
import { Spacing, Typography } from "@/constants/theme";

export default function UserSearchScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allUsers.filter(
        (u) =>
          u.id !== user?.id &&
          (u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, allUsers, user]);

  const loadUsers = async () => {
    const users = await StorageService.getAllUsers();
    setAllUsers(users);
  };

  const sendFriendRequest = async (toUser: User) => {
    if (!user) return;

    const request: FriendRequest = {
      id: Date.now().toString(),
      fromUserId: user.id,
      fromUsername: user.username,
      fromDisplayName: user.displayName,
      timestamp: Date.now(),
    };

    await StorageService.addFriendRequest(request);
    setSentRequests(new Set([...sentRequests, toUser.id]));
    Alert.alert("Success", `Friend request sent to ${toUser.displayName}`);
  };

  const renderUser = ({ item }: { item: User }) => {
    const requestSent = sentRequests.has(item.id);

    return (
      <View style={[styles.userRow, { borderBottomColor: theme.border }]}>
        <Avatar name={item.displayName} size={48} />
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>{item.displayName}</ThemedText>
          <ThemedText style={styles.userUsername}>@{item.username}</ThemedText>
        </View>
        <Button
          title={requestSent ? "Sent" : "Add"}
          onPress={() => sendFriendRequest(item)}
          disabled={requestSent}
          variant={requestSent ? "outline" : "primary"}
          style={styles.addButton}
        />
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl, backgroundColor: theme.backgroundRoot }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <ThemedText style={styles.cancelText}>Cancel</ThemedText>
        </Pressable>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by username or name"
            placeholderTextColor={theme.textSecondary}
            autoFocus
            autoCapitalize="none"
          />
        </View>
      </View>

      {filteredUsers.length === 0 && searchQuery.trim() ? (
        <View style={styles.emptyState}>
          <Feather name="search" size={64} color={theme.textSecondary} />
          <ThemedText style={styles.emptyText}>No users found</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Try searching with a different username
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing.xl }]}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  cancelButton: {
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
  },
  cancelText: {
    ...Typography.body,
    opacity: 0.7,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    height: 44,
    borderRadius: 10,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userName: {
    ...Typography.body,
    fontWeight: "600",
  },
  userUsername: {
    ...Typography.subhead,
    opacity: 0.7,
  },
  addButton: {
    paddingHorizontal: Spacing.lg,
    height: 36,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    ...Typography.title,
    marginTop: Spacing.xl,
  },
  emptySubtext: {
    ...Typography.body,
    opacity: 0.7,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
