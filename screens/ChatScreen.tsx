import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { MessageBubble } from "@/components/MessageBubble";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { StorageService, Message } from "@/utils/storage";
import { Spacing } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootNavigator";

type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const { conversationId, conversationName, isGroup } = route.params;
  const { user } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMessages();
    markConversationRead();
  }, [conversationId]);

  const markConversationRead = async () => {
    const msgs = await StorageService.getMessages(conversationId);
    for (const msg of msgs) {
      if (msg.senderId !== user?.id && (!msg.readBy || !msg.readBy.includes(user?.id || ""))) {
        await StorageService.updateMessageReadBy(conversationId, msg.id, user?.id || "");
      }
    }
  };

  const loadMessages = async () => {
    const msgs = await StorageService.getMessages(conversationId);
    setMessages(msgs);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      senderId: user.id,
      senderName: user.displayName,
      text: inputText.trim(),
      timestamp: Date.now(),
      readBy: [user.id],
    };

    await StorageService.addMessage(conversationId, newMessage);
    await StorageService.updateConversation(conversationId, {
      lastMessage: newMessage,
    });
    setMessages([...messages, newMessage]);
    setInputText("");
    setTypingUsers(new Set());
  };

  const simulateTypingIndicator = () => {
    const otherUserId = conversationId.split("_").find((id) => id !== user?.id);
    if (otherUserId && Math.random() > 0.7) {
      setTypingUsers((prev) => new Set([...prev, otherUserId]));
      setTimeout(
        () => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(otherUserId);
            return newSet;
          });
        },
        2000 + Math.random() * 2000
      );
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const allReadByOthers =
      item.senderId === user?.id &&
      item.readBy &&
      item.readBy.length > 1 &&
      item.readBy.includes(user.id);

    return (
      <MessageBubble
        message={item}
        isOwn={item.senderId === user?.id}
        showSender={isGroup && !item.isSystem && item.senderId !== user?.id}
        isRead={allReadByOthers}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        inverted={false}
      />

      <View
        style={[
          styles.inputContainer,
          { paddingBottom: insets.bottom + Spacing.xl, borderTopColor: theme.border },
        ]}
      >
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={theme.textSecondary}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={sendMessage}
          disabled={!inputText.trim()}
          style={[
            styles.sendButton,
            {
              backgroundColor: theme.primary,
              opacity: inputText.trim() ? 1 : 0.5,
            },
          ]}
        >
          <Feather name="send" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
    fontSize: 17,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
