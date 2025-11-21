import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/contexts/AuthContext";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import WelcomeScreen from "@/screens/WelcomeScreen";
import AuthScreen from "@/screens/AuthScreen";
import UserSearchScreen from "@/screens/UserSearchScreen";
import ChatScreen from "@/screens/ChatScreen";
import CreateGroupScreen from "@/screens/CreateGroupScreen";

export type RootStackParamList = {
  Welcome: undefined;
  Auth: { mode: "signin" | "signup" };
  Main: undefined;
  UserSearch: undefined;
  Chat: { conversationId: string; conversationName: string; isGroup: boolean };
  CreateGroup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator>
      {user === null ? (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false, presentation: "modal" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="UserSearch"
            component={UserSearchScreen}
            options={{
              title: "Find Friends",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }) => ({
              title: route.params.conversationName,
            })}
          />
          <Stack.Screen
            name="CreateGroup"
            component={CreateGroupScreen}
            options={{
              title: "New Group",
              presentation: "modal",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
