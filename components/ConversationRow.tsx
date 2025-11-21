import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Conversation } from "@/utils/storage";

interface ConversationRowProps {
  conversation: Conversation;
  onPress: () => void;
}

export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { borderBottomColor: theme.border },
        pressed && { backgroundColor: theme.surface, opacity: 0.8 },
      ]}
    >
      {conversation.isGroup ? (
        <View
          style={[
            styles.groupAvatar,
            { backgroundColor: theme.secondary },
          ]}
        >
          <Feather name="users" size={24} color="#FFFFFF" />
        </View>
      ) : (
        <Avatar name={conversation.name} size={48} />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.name}>{conversation.name}</ThemedText>
          {conversation.lastMessage ? (
            <ThemedText style={styles.time}>
              {formatTime(conversation.lastMessage.timestamp)}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.footer}>
          <ThemedText style={styles.lastMessage} numberOfLines={1}>
            {conversation.lastMessage?.text || "No messages yet"}
          </ThemedText>
          {conversation.unreadCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.warning }]}>
              <ThemedText style={styles.badgeText}>
                {conversation.unreadCount}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
  },
  time: {
    fontSize: 13,
    opacity: 0.6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 15,
    opacity: 0.7,
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
