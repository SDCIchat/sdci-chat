import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, FlatList, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { StorageService, Friend, Conversation, Message } from "@/utils/storage";
import { Spacing, Typography } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootNavigator";

type CreateGroupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CreateGroupScreen() {
  const navigation = useNavigation<CreateGroupScreenNavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    const friendsList = await StorageService.getFriends();
    setFriends(friendsList);
  };

  const toggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (selectedFriends.size === 0) {
      Alert.alert("Error", "Please select at least one friend");
      return;
    }

    if (!user) return;

    const conversationId = `group_${Date.now()}`;
    const participants = [user.id, ...Array.from(selectedFriends)];

    const conversation: Conversation = {
      id: conversationId,
      name: groupName,
      isGroup: true,
      unreadCount: 0,
      participants,
    };

    const systemMessage: Message = {
      id: `${conversationId}_welcome`,
      conversationId,
      senderId: "system",
      senderName: "System",
      text: `${user.displayName} created the group`,
      timestamp: Date.now(),
      isSystem: true,
    };

    await StorageService.addConversation(conversation);
    await StorageService.addMessage(conversationId, systemMessage);

    Alert.alert("Success", "Group created!", [
      {
        text: "OK",
        onPress: () => {
          navigation.goBack();
          navigation.navigate("Chat", {
            conversationId,
            conversationName: groupName,
            isGroup: true,
          });
        },
      },
    ]);
  };

  const renderFriend = ({ item }: { item: Friend }) => {
    const isSelected = selectedFriends.has(item.id);

    return (
      <Pressable
        onPress={() => toggleFriend(item.id)}
        style={[
          styles.friendRow,
          { borderBottomColor: theme.border },
          isSelected && { backgroundColor: theme.surface },
        ]}
      >
        <Avatar name={item.displayName} size={40} />
        <View style={styles.friendInfo}>
          <ThemedText style={styles.friendName}>{item.displayName}</ThemedText>
          <ThemedText style={styles.friendUsername}>@{item.username}</ThemedText>
        </View>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: theme.primary,
              backgroundColor: isSelected ? theme.primary : "transparent",
            },
          ]}
        >
          {isSelected ? <Feather name="check" size={16} color="#FFFFFF" /> : null}
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.container}>
        <View style={styles.section}>
          <ThemedText style={styles.label}>Group Name</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, color: theme.text }]}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Enter group name"
            placeholderTextColor={theme.textSecondary}
            maxLength={50}
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>
            Add Friends ({selectedFriends.size} selected)
          </ThemedText>
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>
                You need friends to create a group
              </ThemedText>
            </View>
          ) : (
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <View key={friend.id}>{renderFriend({ item: friend })}</View>
              ))}
            </View>
          )}
        </View>

        <Button
          title="Create Group"
          onPress={createGroup}
          disabled={!groupName.trim() || selectedFriends.size === 0}
          style={styles.createButton}
        />
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
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
  friendsList: {
    borderRadius: 12,
    overflow: "hidden",
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    marginTop: Spacing.lg,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...Typography.body,
    opacity: 0.7,
    textAlign: "center",
  },
});
