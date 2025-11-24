import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { Message } from "@/utils/storage";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
  animate?: boolean;
}

export function MessageBubble({ message, isOwn, showSender, animate = false }: MessageBubbleProps) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(animate ? 20 : 0)).current;

  useEffect(() => {
    if (animate) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animate]);

  if (message.isSystem) {
    return (
      <View style={styles.systemContainer}>
        <View style={[styles.systemBubble, { backgroundColor: theme.messageSystem }]}>
          <ThemedText style={styles.systemText}>{message.text}</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        isOwn && styles.ownContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      {!isOwn && showSender ? (
        <ThemedText style={styles.senderName}>{message.senderName}</ThemedText>
      ) : null}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isOwn ? theme.messageSent : theme.messageReceived,
          },
          isOwn && styles.ownBubble,
        ]}
      >
        <ThemedText
          style={[styles.text, isOwn && { color: "#FFFFFF" }]}
        >
          {message.text}
        </ThemedText>
      </View>
      <ThemedText style={[styles.timestamp, isOwn && styles.ownTimestamp]}>
        {formatTime(message.timestamp)}
      </ThemedText>
    </Animated.View>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    alignItems: "flex-start",
    maxWidth: "75%",
  },
  ownContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  senderName: {
    fontSize: 13,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.md,
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 18,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 17,
  },
  timestamp: {
    fontSize: 13,
    marginTop: Spacing.xs,
    marginLeft: Spacing.md,
    opacity: 0.6,
  },
  ownTimestamp: {
    marginRight: Spacing.md,
    marginLeft: 0,
  },
  systemContainer: {
    alignItems: "center",
    marginVertical: Spacing.sm,
  },
  systemBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  systemText: {
    fontSize: 13,
    opacity: 0.7,
  },
});
