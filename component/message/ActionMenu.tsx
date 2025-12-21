// components/message/MessageBubble/ActionMenu.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  onAction: (action: string) => void;
  isMe?: boolean;
};

const ActionMenu = ({ onAction, isMe }: Props) => (
  <View style={[styles.container, { [isMe ? "right" : "left"]: 0 }]}>
    {["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"].map((a) => (
      <Text key={a} onPress={() => onAction(a)}>{a}</Text>
    ))}
    <Text onPress={() => onAction("REPLY")}>Reply</Text>
    <Text onPress={() => onAction("DELETE")}>Delete</Text>
  </View>
);

export default ActionMenu;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "100%",
    backgroundColor: "#eee",
    padding: 6,
    borderRadius: 6,
    minWidth: 180,
    flexDirection: "row",
    justifyContent: "space-around",
    zIndex: 10,
  },
});
