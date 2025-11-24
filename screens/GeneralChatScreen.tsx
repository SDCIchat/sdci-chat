import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TextInput, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { MessageBubble } from "@/components/MessageBubble";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StorageService, Message } from "@/utils/storage";
import { Spacing, Typography } from "@/constants/theme";

const GENERAL_CHAT_ID = "general";

export default function GeneralChatScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const msgs = await StorageService.getMessages(GENERAL_CHAT_ID);
    if (msgs.length === 0) {
      const welcomeMsg: Message = {
        id: "welcome",
        conversationId: GENERAL_CHAT_ID,
        senderId: "system",
        senderName: "System",
        text: "Welcome to the General Chat! This is a public channel for everyone.",
        timestamp: Date.now() - 60000,
        isSystem: true,
      };
      await StorageService.addMessage(GENERAL_CHAT_ID, welcomeMsg);
      setMessages([welcomeMsg]);
    } else {
      setMessages(msgs);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId: GENERAL_CHAT_ID,
      senderId: user.id,
      senderName: user.displayName,
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    await StorageService.addMessage(GENERAL_CHAT_ID, newMessage);
    setMessages([...messages, newMessage]);
    setLastMessageId(newMessage.id); // Set the last message ID for animation
    setInputText("");
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble 
      message={item} 
      isOwn={item.senderId === user?.id}
      showSender={!item.isSystem && item.senderId !== user?.id}
      animate={item.id === lastMessageId}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.xl, backgroundColor: theme.backgroundRoot }]}>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.icon}
          resizeMode="contain"
        />
        <ThemedText style={styles.headerTitle}>SDCI chat</ThemedText>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        inverted={false}
      />

      <View style={[styles.inputContainer, { paddingBottom: tabBarHeight + Spacing.xl, borderTopColor: theme.border }]}>
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
          style={[styles.sendButton, { backgroundColor: theme.primary, opacity: inputText.trim() ? 1 : 0.5 }]}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    ...Typography.body,
    fontWeight: "600",
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