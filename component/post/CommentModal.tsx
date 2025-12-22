import { getRelativeTimeFromISO } from "@/utils/date";
import { X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  comments: any[];
  postId: string;
  onSendComment: (content: string, parentId: string | null) => Promise<void>;
  onLikeComment: (commentId: string, liked: boolean) => Promise<void>;
}

export const CommentModal = ({
  visible,
  onClose,
  comments,
  onSendComment,
  onLikeComment,
}: CommentModalProps) => {
  const [newComment, setNewComment] = useState("");
  // Lưu thêm content vào replyTo để hiển thị preview
  const [replyTo, setReplyTo] = useState<{
    id: string;
    name: string;
    content: string;
  } | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!newComment.trim()) return;
    await onSendComment(newComment, replyTo?.id || null);
    setNewComment("");
    setReplyTo(null);
    Keyboard.dismiss();
  };

  const renderCommentItem = ({ item }: any) => {
    const parentName = item.author?.name || "Người dùng";

    return (
      <View style={styles.commentBlock}>
        {/* --- BÌNH LUẬN CHA --- */}
        <View style={styles.commentRow}>
          <Image
            source={{
              uri:
                item.author.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  parentName
                )}`,
            }}
            style={styles.avatar}
          />
          <View style={styles.bubbleWrapper}>
            <View style={styles.bubble}>
              <Text style={styles.authorName}>{parentName}</Text>
              <Text style={styles.commentText}>{item.content}</Text>
            </View>
            <View style={styles.commentActions}>
              <TouchableOpacity
                onPress={() => onLikeComment(item.id, item.liked)}
              >
                <Text
                  style={[styles.actionBtn, item.liked && styles.likedText]}
                >
                  {item.liked ? "❤️" : "Thích"}{" "}
                  {item.likeCount > 0 ? item.likeCount : ""}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  // Truyền cả content vào đây
                  setReplyTo({
                    id: item.id,
                    name: parentName,
                    content: item.content,
                  });
                  inputRef.current?.focus();
                }}
              >
                <Text style={styles.actionBtn}>Trả lời</Text>
              </TouchableOpacity>
              <Text style={styles.commentTime}>
                {getRelativeTimeFromISO(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* --- DANH SÁCH PHẢN HỒI --- */}
        {item.replies?.map((reply: any) => {
          const replyName = reply.author?.name || "Người dùng";
          return (
            <View key={reply.id} style={[styles.commentRow, styles.replyRow]}>
              <Image
                source={{
                  uri:
                    reply.author.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      replyName
                    )}`,
                }}
                style={styles.replyAvatar}
              />
              <View style={styles.bubbleWrapper}>
                <View style={styles.bubble}>
                  <Text style={styles.authorName}>{replyName}</Text>
                  <Text style={styles.commentText}>
                    <Text style={styles.highlightText}>@{parentName} </Text>
                    {reply.content}
                  </Text>
                </View>
                <View style={styles.commentActions}>
                  <TouchableOpacity
                    onPress={() => onLikeComment(reply.id, reply.liked)}
                  >
                    <Text
                      style={[
                        styles.actionBtn,
                        reply.liked && styles.likedText,
                      ]}
                    >
                      {reply.liked ? "❤️" : "Thích"}{" "}
                      {reply.likeCount > 0 ? reply.likeCount : ""}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.commentTime}>
                    {getRelativeTimeFromISO(reply.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.flex1} onPress={onClose} />

        <View
          style={[
            styles.modalContainer,
            {
              height: SCREEN_HEIGHT * 0.8,
              paddingBottom: keyboardHeight*0.001,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.handle} />
            <Text style={styles.title}>Bình luận</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={22} color="#666" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

          {/* PHẦN INPUT VỚI PREVIEW REPLY */}
          <View style={styles.inputSection}>
            {replyTo && (
              <View style={styles.replyPreviewContainer}>
                <View style={styles.replyPreviewContent}>
                  <Text style={styles.replyPreviewTitle}>
                    Đang trả lời{" "}
                    <Text style={{ fontWeight: "700" }}>{replyTo.name}</Text>
                  </Text>
                  <Text style={styles.replyPreviewText} numberOfLines={1}>
                    {replyTo.content}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setReplyTo(null)}
                  style={styles.closeReplyBtn}
                >
                  <X size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Viết bình luận..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!newComment.trim()}
              >
                <Text
                  style={[
                    styles.sendBtn,
                    !newComment.trim() && { color: "#ccc" },
                  ]}
                >
                  Gửi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  flex1: { flex: 1 },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    marginBottom: 8,
  },
  title: { fontWeight: "700", fontSize: 16, color: "#1c1e21" },
  closeBtn: { position: "absolute", right: 16, top: 15 },
  listContent: { padding: 16, paddingBottom: 30 },

  commentBlock: { marginBottom: 20 },
  commentRow: { flexDirection: "row", gap: 10 },
  replyRow: {
    marginLeft: 44,
    marginTop: 10,
    borderLeftWidth: 1,
    borderLeftColor: "#f0f0f0",
    paddingLeft: 10,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#eee" },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eee",
  },

  bubbleWrapper: { flex: 1, alignItems: "flex-start" },
  bubble: {
    backgroundColor: "#f0f2f5",
    padding: 10,
    borderRadius: 18,
    maxWidth: "100%",
  },
  authorName: {
    fontWeight: "700",
    fontSize: 13,
    color: "#1c1e21",
    marginBottom: 2,
  },
  commentText: { fontSize: 14, color: "#050505", lineHeight: 18 },
  highlightText: { color: "#007AFF", fontWeight: "700" },

  commentActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
    alignItems: "center",
    paddingLeft: 4,
  },
  actionBtn: { fontSize: 12, color: "#65676b", fontWeight: "600" },
  likedText: { color: "#e53935" },
  commentTime: { fontSize: 12, color: "#8e8e8e" },

  // Style cho phần Preview Reply phía trên TextInput
  inputSection: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    padding: 10,
  },
  replyPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  replyPreviewContent: { flex: 1 },
  replyPreviewTitle: { fontSize: 12, color: "#007AFF", marginBottom: 2 },
  replyPreviewText: { fontSize: 12, color: "#65676b" },
  closeReplyBtn: { padding: 4 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: Platform.OS === "ios" ? 15 : 5,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    color: "#0084ff",
    fontWeight: "700",
    fontSize: 15,
    paddingRight: 5,
  },
});
