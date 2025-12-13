import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MOCK_FRIENDS = [
  { id: "1", name: "Nguyễn Văn A" },
  { id: "2", name: "Trần Thị B" },
  { id: "3", name: "Lê Văn C" },
];

const INITIAL_COMMENTS = [
  { id: "1", author: "Thắng", content: "Bài này hay quá nè 👏" },
  { id: "2", author: "Minh", content: "Xem mà nhớ chuyến đi Đà Lạt ghê." },
];

const PostActionBar = () => {
  const [liked, setLiked] = useState(false);

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState("");

  const handleLike = () => {
    setLiked((prev) => !prev);
  };

  const handleComment = () => {
    setCommentVisible(true);
  };

  const handleShare = () => {
    setShareVisible(true);
  };

  const toggleOptionsModal = () => {
    setOptionsVisible((prev) => !prev);
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        author: "Bạn",
        content: newComment.trim(),
      },
    ]);
    setNewComment("");
  };

  const handleShareToFriend = (friendName: string) => {
    console.log(`Share post to ${friendName}`);
    // TODO: call API share bài viết cho friendName
    setShareVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Like */}
      <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
        <Heart
          size={18}
          strokeWidth={2}
          color={liked ? "#e53935" : "#444"}
          fill={liked ? "#e53935" : "transparent"}
        />
        <Text style={[styles.actionLabel, liked && styles.likedText]}>
          Thích
        </Text>
      </TouchableOpacity>

      {/* Comment */}
      <TouchableOpacity style={styles.actionItem} onPress={handleComment}>
        <MessageCircle size={18} strokeWidth={2} color="#444" />
        <Text style={styles.actionLabel}>Bình luận</Text>
      </TouchableOpacity>

      {/* Share */}
      <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
        <Share2 size={18} strokeWidth={2} color="#444" />
        <Text style={styles.actionLabel}>Chia sẻ</Text>
      </TouchableOpacity>

      {/* More / Options */}
      <TouchableOpacity style={styles.moreBtn} onPress={toggleOptionsModal}>
        <MoreHorizontal size={20} strokeWidth={2} color="#444" />
      </TouchableOpacity>

      {/* ========== MODAL: TÙY CHỌN BÀI VIẾT ========== */}
      <Modal
        visible={optionsVisible}
        transparent
        animationType="slide"
        onRequestClose={toggleOptionsModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={toggleOptionsModal}>
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tùy chọn bài viết</Text>

            <TouchableOpacity style={styles.modalItem}>
              <Text style={styles.modalItemText}>Lưu bài viết</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalItem}>
              <Text style={styles.modalItemText}>Ẩn bài viết</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalItem}>
              <Text style={styles.modalItemText}>Báo cáo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={toggleOptionsModal}
            >
              <Text style={styles.modalCancelText}>Đóng</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ========== MODAL: BÌNH LUẬN ========== */}
      <Modal
        visible={commentVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCommentVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.commentContainer}
          >
            <Pressable style={styles.commentContent}>
              <Text style={styles.modalTitle}>Bình luận</Text>

              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 260 }}
                renderItem={({ item }) => (
                  <View style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {item.author.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.commentBubble}>
                      <Text style={styles.commentAuthor}>{item.author}</Text>
                      <Text style={styles.commentText}>{item.content}</Text>
                    </View>
                  </View>
                )}
              />

              {/* Input bình luận */}
              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Thêm bình luận..."
                  placeholderTextColor="#999"
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity onPress={handleSendComment}>
                  <Text style={styles.commentSend}>Gửi</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* ========== MODAL: CHIA SẺ ========== */}
      <Modal
        visible={shareVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShareVisible(false)}
        >
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chia sẻ tới bạn bè</Text>

            {MOCK_FRIENDS.map((friend) => (
              <TouchableOpacity
                key={friend.id}
                style={styles.shareFriendItem}
                onPress={() => handleShareToFriend(friend.name)}
              >
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>
                    {friend.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.friendName}>{friend.name}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShareVisible(false)}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default PostActionBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionLabel: {
    fontSize: 13,
    color: "#444",
  },
  likedText: {
    color: "#e53935",
    fontWeight: "600",
  },
  moreBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  // Modal backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  // Modal chung
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 10,
  },
  modalItemText: {
    fontSize: 14,
    color: "#222",
  },
  modalCancel: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
  },
  modalCancelText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },

  // Comment modal
  commentContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  commentContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  commentBubble: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: "#222",
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
    marginTop: 4,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    marginRight: 8,
  },
  commentSend: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },

  // Share modal
  shareFriendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  friendAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  friendName: {
    fontSize: 14,
    color: "#222",
  },
});
