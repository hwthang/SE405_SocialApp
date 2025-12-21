import { Reply, Trash2, X } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  hasReaction: boolean;
  onReply: () => void;
  onDelete: () => void;
  onUnreact: () => void;
};

const MessageActions = ({
  hasReaction,
  onReply,
  onDelete,
  onUnreact,
}: Props) => {
  return (
    <View style={styles.container}>
      <Pressable style={styles.item} onPress={onReply}>
        <Reply size={16} />
        <Text>Reply</Text>
      </Pressable>

      {hasReaction && (
        <Pressable style={styles.item} onPress={onUnreact}>
          <X size={16} />
          <Text>Unreact</Text>
        </Pressable>
      )}

      <Pressable style={[styles.item, styles.delete]} onPress={onDelete}>
        <Trash2 size={16} color="red" />
        <Text style={{ color: "red" }}>Delete</Text>
      </Pressable>
    </View>
  );
};

export default MessageActions;

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    elevation: 3,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  delete: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 4,
    paddingTop: 8,
  },
});
