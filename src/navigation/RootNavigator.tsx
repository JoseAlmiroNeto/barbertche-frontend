import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ReactNode } from "react";
import type { Role } from "../types";

export type RootStackParamList = {
  Auth: undefined;
  Client: undefined;
  Admin: undefined;
};

type RootNavigatorProps = {
  logged: boolean;
  role: Role;
  authScreen: ReactNode;
  clientScreen: ReactNode;
  adminScreen: ReactNode;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator({
  logged,
  role,
  authScreen,
  clientScreen,
  adminScreen,
}: RootNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
        {!logged ? (
          <Stack.Screen name="Auth">{() => authScreen}</Stack.Screen>
        ) : role === "client" ? (
          <Stack.Screen name="Client">{() => clientScreen}</Stack.Screen>
        ) : (
          <Stack.Screen name="Admin">{() => adminScreen}</Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
