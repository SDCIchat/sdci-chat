import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, FlatList, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { StorageService, User, FriendRequest, Friend } from "@/utils/storage";
import { ApiService } from "@/utils/api";
import { Spacing, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootNavigator";

type UserSearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function UserSearchScreen() {
  const navigation = useNavigation<UserSearchScreenNavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      searchUsers();
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      const results = await ApiService.searchUsers(searchQuery);
      setFilteredUsers(results.filter((u: any) => u.id !== parseInt(user?.id || "0")));
    } catch (error) {
      console.error("Search failed:", error);
      setFilteredUsers([]);
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (toUser: any) => {
    if (!user) return;

    try {
      await ApiService.sendFriendRequest(toUser.id);
      const newFriend: Friend = {
        id: toUser.id.toString(),
        username: toUser.username,
        displayName: toUser.display_name || toUser.username,
        status: toUser.status || "offline",
      };
      await StorageService.addFriend(newFriend);
      setSentRequests(new Set([...sentRequests, toUser.id.toString()]));
      Alert.alert("Success", `Friend request sent to ${toUser.display_name || toUser.username}`);
    } catch (error) {
      console.error("Failed to send friend request:", error);
      Alert.alert("Error", "Failed to send friend request");
    }
  };

  const startDirectMessage = async (toUser: any) => {
    if (!user) return;

    // Check if conversation already exists
    const conversations = await StorageService.getConversations();
    let existingConvo = conversations.find(
      (c) =>
        !c.isGroup &&
        c.participants.includes(user.id) &&
        c.participants.includes(toUser.id.toString())
    );

    if (!existingConvo) {
      // Create new DM conversation
      const conversationId = `dm_${user.id}_${toUser.id}_${Date.now()}`;
      existingConvo = {
        id: conversationId,
        name: toUser.display_name || toUser.username,
        isGroup: false,
        unreadCount: 0,
        participants: [user.id, toUser.id.toString()],
      };
      await StorageService.addConversation(existingConvo);
    }

    navigation.navigate("Chat", {
      conversationId: existingConvo.id,
      conversationName: toUser.display_name || toUser.username,
      isGroup: false,
    });
  };

  const renderUser = ({ item }: { item: any }) => {
    const requestSent = sentRequests.has(item.id.toString());

    return (
      <View style={[styles.userRow, { borderBottomColor: theme.border }]}>
        <Avatar name={item.display_name || item.username} size={48} />
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>{item.display_name || item.username}</ThemedText>
          <ThemedText style={styles.userUsername}>@{item.username}</ThemedText>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => startDirectMessage(item)}
            style={[styles.iconButton, { backgroundColor: theme.primary }]}
          >
            <Feather name="message-circle" size={20} color="#FFFFFF" />
          </Pressable>
          <Button
            title={requestSent ? "Sent" : "Add"}
            onPress={() => sendFriendRequest(item)}
            disabled={requestSent}
            variant={requestSent ? "outline" : "primary"}
            style={styles.addButton}
          />
        </View>
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

      {isSearching ? (
        <View style={styles.emptyState}>
          <Feather name="search" size={64} color={theme.textSecondary} />
          <ThemedText style={styles.emptyText}>Searching...</ThemedText>
        </View>
      ) : filteredUsers.length === 0 && searchQuery.trim() ? (
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
          keyExtractor={(item) => item.id.toString()}
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
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
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
