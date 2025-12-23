import { X } from "lucide-react-native"; // Thêm icon X để nút đóng chuyên nghiệp hơn
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const REACTIONS_MAP: Record<string, string> = {
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
  onClose: () => void; // Prop này vẫn cần để thực thi lệnh đóng từ Bubble truyền vào
};

const MessageActions = ({ isMe, hasReacted, onReact, onUnreact, onReply, onDelete, onClose }: Props) => {
  return (
    <View style={[styles.container, isMe ? styles.alignEnd : styles.alignStart]}>
      {/* Reaction Bar */}
      <View style={styles.reactionBar}>
        {Object.entries(REACTIONS_MAP).map(([key, emoji]) => (
          <TouchableOpacity 
            key={key} 
            onPress={() => onReact(key)}
            activeOpacity={0.6}
            style={styles.emojiWrapper}
          >
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
        
        {hasReacted && (
          <TouchableOpacity onPress={onUnreact} style={styles.unreactBtn} activeOpacity={0.7}>
            <Text style={styles.unreactText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Actions - Đã thêm nút Đóng thủ công */}
      <View style={[styles.actionBar, isMe ? styles.rowReverse : styles.row]}>
        {/* Nút Đóng thủ công (Dấu X hoặc chữ Đóng) */}
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <X size={16} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity onPress={onReply} style={styles.actionItem}>
          <Text style={styles.actionText}>Trả lời</Text>
        </TouchableOpacity>

        {isMe && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity onPress={onDelete} style={styles.actionItem}>
              <Text style={[styles.actionText, styles.deleteText]}>Gỡ bỏ</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default React.memo(MessageActions);

const styles = StyleSheet.create({
  container: { 
    paddingVertical: 10, 
    width: '100%',
    paddingHorizontal: 16 
  },
  alignEnd: { alignItems: "flex-end" },
  alignStart: { alignItems: "flex-start" },
  
  reactionBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignItems: "center",
    marginBottom: 6,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
    borderColor: '#E0E0E0',
  },
  emojiWrapper: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  emojiText: { 
    fontSize: 26,
  },
  unreactBtn: { 
    backgroundColor: "#F0F2F5", 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    justifyContent: "center", 
    alignItems: "center", 
    marginLeft: 4 
  },
  unreactText: { 
    fontSize: 10, 
    color: "#8E8E93", 
    fontWeight: "800" 
  },

  actionBar: { 
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  row: { flexDirection: "row" },
  rowReverse: { flexDirection: "row-reverse" },
  
  actionItem: {
    paddingHorizontal: 10,
  },
  actionText: { 
    color: "#1C1E21", 
    fontSize: 14, 
    fontWeight: "500",
  },
  deleteText: { 
    color: "#FF3B30", 
  },
  divider: {
    width: 1,
    height: 14,
    backgroundColor: "#E4E6EB",
    marginHorizontal: 4,
  },
  closeBtn: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }
});