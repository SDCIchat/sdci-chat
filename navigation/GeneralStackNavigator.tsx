import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GeneralChatScreen from "@/screens/GeneralChatScreen";

export type GeneralStackParamList = {
  GeneralChat: undefined;
};

const Stack = createNativeStackNavigator<GeneralStackParamList>();

export default function GeneralStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="GeneralChat"
        component={GeneralChatScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
