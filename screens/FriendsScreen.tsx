import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { StorageService, Friend, FriendRequest } from "@/utils/storage";
import { ApiService } from "@/utils/api";
import { Spacing, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootNavigator";

type FriendsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FriendsScreen() {
  const navigation = useNavigation<FriendsScreenNavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const friendsList = await StorageService.getFriends();
    const requestsList = await StorageService.getFriendRequests();
    setFriends(friendsList);
    setRequests(requestsList);
  };

  const acceptRequest = async (request: FriendRequest) => {
    try {
      await ApiService.acceptFriendRequest(request.id);
      const newFriend: Friend = {
        id: request.fromUserId,
        username: request.fromUsername,
        displayName: request.fromDisplayName,
        avatar: request.fromAvatar,
        status: "online",
      };
      await StorageService.addFriend(newFriend);
      await StorageService.removeFriendRequest(request.id);
      loadData();
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const declineRequest = async (requestId: string) => {
    try {
      await StorageService.removeFriendRequest(requestId);
      loadData();
    } catch (error) {
      console.error("Failed to decline request:", error);
    }
  };

  const renderRequest = ({ item }: { item: FriendRequest }) => (
    <View style={[styles.requestCard, { backgroundColor: theme.surface }]}>
      <Avatar name={item.fromDisplayName} size={48} />
      <View style={styles.requestInfo}>
        <ThemedText style={styles.requestName}>{item.fromDisplayName}</ThemedText>
        <ThemedText style={styles.requestUsername}>@{item.fromUsername}</ThemedText>
      </View>
      <View style={styles.requestActions}>
        <Pressable
          onPress={() => acceptRequest(item)}
          style={[styles.acceptButton, { backgroundColor: theme.success }]}
        >
          <Feather name="check" size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={() => declineRequest(item.id)}
          style={[styles.declineButton, { backgroundColor: theme.error }]}
        >
          <Feather name="x" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );

  const openDirectMessage = async (friend: Friend) => {
    if (!user) return;

    // Check if conversation already exists
    const conversations = await StorageService.getConversations();
    let existingConvo = conversations.find(
      (c) =>
        !c.isGroup &&
        c.participants.includes(user.id) &&
        c.participants.includes(friend.id)
    );

    if (!existingConvo) {
      // Create new DM conversation
      const conversationId = `dm_${user.id}_${friend.id}_${Date.now()}`;
      existingConvo = {
        id: conversationId,
        name: friend.displayName,
        isGroup: false,
        unreadCount: 0,
        participants: [user.id, friend.id],
      };
      await StorageService.addConversation(existingConvo);
    }

    navigation.navigate("Chat", {
      conversationId: existingConvo.id,
      conversationName: friend.displayName,
      isGroup: false,
    });
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <Pressable
      onPress={() => openDirectMessage(item)}
      style={({ pressed }) => [
        styles.friendRow,
        { borderBottomColor: theme.border },
        pressed && { backgroundColor: theme.surface, opacity: 0.8 },
      ]}
    >
      <Avatar name={item.displayName} size={48} />
      <View style={styles.friendInfo}>
        <ThemedText style={styles.friendName}>{item.displayName}</ThemedText>
        <ThemedText style={styles.friendUsername}>@{item.username}</ThemedText>
      </View>
      <View style={[styles.statusDot, { backgroundColor: item.status === "online" ? theme.success : theme.textSecondary }]} />
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl, backgroundColor: theme.backgroundRoot, borderBottomColor: theme.border }]}>
        <ThemedText style={styles.headerTitle}>Friends</ThemedText>
        <Pressable
          onPress={() => navigation.navigate("UserSearch")}
          style={styles.addButton}
        >
          <Feather name="user-plus" size={24} color={theme.primary} />
        </Pressable>
      </View>

      <FlatList
        data={[]}
        ListHeaderComponent={
          <View>
            {requests.length > 0 ? (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  Friend Requests ({requests.length})
                </ThemedText>
                {requests.map((request) => (
                  <View key={request.id}>{renderRequest({ item: request })}</View>
                ))}
              </View>
            ) : null}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                My Friends ({friends.length})
              </ThemedText>
              {friends.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="users" size={48} color={theme.textSecondary} />
                  <ThemedText style={styles.emptyText}>No friends yet</ThemedText>
                  <ThemedText style={styles.emptySubtext}>
                    Tap the + button to find people
                  </ThemedText>
                </View>
              ) : (
                friends.map((friend) => (
                  <View key={friend.id}>{renderFriend({ item: friend })}</View>
                ))
              )}
            </View>
          </View>
        }
        renderItem={null}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + Spacing.xl }]}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    ...Typography.title,
  },
  addButton: {
    padding: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.title,
    marginBottom: Spacing.md,
  },
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  requestInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  requestName: {
    ...Typography.body,
    fontWeight: "600",
  },
  requestUsername: {
    ...Typography.subhead,
    opacity: 0.7,
  },
  requestActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  declineButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  friendInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  friendName: {
    ...Typography.body,
    fontWeight: "600",
  },
  friendUsername: {
    ...Typography.subhead,
    opacity: 0.7,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyText: {
    ...Typography.title,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    ...Typography.body,
    opacity: 0.7,
    marginTop: Spacing.xs,
  },
});
