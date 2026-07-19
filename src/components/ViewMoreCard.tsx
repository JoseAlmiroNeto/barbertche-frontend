import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "../theme";

export function ViewMoreCard({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.viewMoreCard} onPress={onPress}>
      <Text style={styles.viewMoreText}>{label}</Text>
    </TouchableOpacity>
  );
}
