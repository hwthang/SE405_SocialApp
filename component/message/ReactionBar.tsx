import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const ReactionBar = ({
  onSelect,
}: {
  onSelect: (reaction: string) => void;
}) => {
  return (
    <View style={styles.container}>
      {REACTIONS.map((r) => (
        <Pressable
          key={r}
          onPress={() => onSelect(r)}
          style={styles.reaction}
        >
          <Text style={styles.text}>{r}</Text>
        </Pressable>
      ))}
    </View>
  );
};

export default ReactionBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  reaction: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 13,
  },
});
