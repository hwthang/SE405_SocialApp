import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const REACTIONS_MAP: any = {
  LIKE: "👍",
  LOVE: "❤️",
  HAHA: "😆",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😡",
};

type Props = {
  isMe: boolean;
  hasReacted: boolean;
  onReact: (emojiKey: string) => void;
  onUnreact: () => void;
  onReply: () => void;
  onDelete: () => void;
};

const MessageActions = ({ isMe, hasReacted, onReact, onUnreact, onReply, onDelete }: Props) => {
  return (
    <View style={[styles.container, isMe ? styles.alignEnd : styles.alignStart]}>
      {/* Thanh Reaction nổi lên */}
      <View style={styles.reactionBar}>
        {Object.entries(REACTIONS_MAP).map(([key, emoji]) => (
          <TouchableOpacity key={key} onPress={() => onReact(key)}>
            <Text style={styles.emojiText}>{emoji as string}</Text>
          </TouchableOpacity>
        ))}
        {hasReacted && (
          <TouchableOpacity onPress={onUnreact} style={styles.unreactBtn}>
            <Text style={styles.unreactText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu chữ bên dưới */}
      <View style={[styles.actionBar, isMe && { flexDirection: "row-reverse" }]}>
        <TouchableOpacity onPress={onReply}>
          <Text style={styles.actionText}>Trả lời</Text>
        </TouchableOpacity>
        {isMe && (
          <TouchableOpacity onPress={onDelete}>
            <Text style={[styles.actionText, styles.deleteText]}>Gỡ</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default React.memo(MessageActions);

const styles = StyleSheet.create({
  container: { paddingVertical: 8, width: 280 },
  alignEnd: { alignSelf: "flex-end", alignItems: "flex-end" },
  alignStart: { alignSelf: "flex-start", alignItems: "flex-start" },
  reactionBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    gap: 12,
  },
  emojiText: { fontSize: 24 },
  unreactBtn: { backgroundColor: "#f3f4f6", width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", alignSelf: "center" },
  unreactText: { fontSize: 10, color: "#666", fontWeight: "bold" },
  actionBar: { flexDirection: "row", marginTop: 8, gap: 20, paddingHorizontal: 15 },
  actionText: { color: "#65676B", fontSize: 13, fontWeight: "600" },
  deleteText: { color: "#FA3E3E" },
});