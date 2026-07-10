import { Alert } from "react-native";

export function notify(title: string, message: string) {
  if (typeof Alert.alert === "function") {
    Alert.alert(title, message);
  }
}
