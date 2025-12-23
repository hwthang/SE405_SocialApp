import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { router } from "expo-router";
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CommentModal } from "./CommentModal";

/* ================= TYPES ================= */

type ApiAuthor = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type ApiComment = {
  id: string;
  content: string;
  createdAt: string;
  author: ApiAuthor;
  replies: ApiComment[];
  liked: boolean;
  likeCount: number;
};

type Props = {
  postId: string;
  post?: any; // Thêm prop post để kiểm tra sharedFrom
  commentCount?: number;
  showMore?: boolean;
  showComment?: boolean;
};

/* ================= COMPONENT ================= */

const PostActionBar = ({
  postId,
  post,
  commentCount: initialCommentCount = 0,
  showMore = false,
  showComment = true,
}: Props) => {
  // --- Post States ---
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  // --- Comment States ---
  const [visible, setVisible] = useState(false);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [targetShareId, setTargetShareId] = useState();

  // --- Repost (Share) States ---
  const [repostVisible, setRepostVisible] = useState(false);
  const [repostContent, setRepostContent] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // --- Custom Alert State ---
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const api = Api.getInstance();

  /* ================= HELPERS ================= */

  const getAuthHeader = async () => ({
    Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
    "Content-Type": "application/json",
  });

  const showAlert = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setAlertConfig({ visible: true, type, title, message });
  };

  /* ================= FETCH DATA ================= */

  const fetchPostDetail = async () => {
    try {
      const headers = await getAuthHeader();
      const userId = await AuthHelper.getInstance().getUserId();

      const res = await fetch(`${api.baseUrl}/posts/${postId}`, { headers });
      const json = await res.json();

      if (res.ok && json.data) {
        const post = json.data;
        const reactions = json.data.reactions || [];
        setLikeCount(reactions.length);
        setLiked(reactions.some((r: any) => r.userId === userId));
        setTargetShareId(post?.sharedFromId || post.id);
      }
    } catch (error) {
      console.error("Fetch post detail error:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const headers = await getAuthHeader();
      const userId = await AuthHelper.getInstance().getUserId();

      const res = await fetch(`${api.baseUrl}/posts/${postId}/comments`, {
        headers,
      });
      const json = await res.json();

      const rawItems = json.data?.items || json.data || [];

      const normalize = (list: any[]): ApiComment[] =>
        list
          .map((c) => ({
            ...c,
            liked: Array.isArray(c.reactions)
              ? c.reactions.some((r: any) => r.userId === userId)
              : false,
            likeCount: Array.isArray(c.reactions) ? c.reactions.length : 0,
            replies: normalize(c.replies || []), // Đệ quy sắp xếp cả các phản hồi
          }))
          .sort((a, b) => {
            // Chuyển string ISO sang timestamp để so sánh
            // Mới nhất lên đầu: b - a
            // Cũ nhất lên đầu: a - b
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

      const normalized = normalize(rawItems);
      setComments(normalized);
      setCommentCount(normalized.length);
    } catch (error) {
      console.error("Fetch comments error:", error);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostDetail();
      fetchComments();
    }
  }, [postId]);

  /* ================= HANDLERS ================= */

  const handleLikePost = async () => {
    const headers = await getAuthHeader();
    const prevLiked = liked;

    setLiked(!prevLiked);
    setLikeCount((c) => (prevLiked ? Math.max(0, c - 1) : c + 1));

    try {
      const res = await fetch(
        prevLiked
          ? `${api.baseUrl}/reactions?targetId=${postId}&targetType=POST`
          : `${api.baseUrl}/reactions`,
        {
          method: prevLiked ? "DELETE" : "POST",
          headers,
          body: prevLiked
            ? undefined
            : JSON.stringify({
                targetType: "POST",
                targetId: postId,
                type: "LOVE",
              }),
        }
      );
      if (!res.ok) throw new Error();
    } catch (e) {
      setLiked(prevLiked);
      setLikeCount((c) => (prevLiked ? c + 1 : Math.max(0, c - 1)));
    }
  };

  const handleOpenComments = async () => {
    await fetchComments();
    setVisible(true);
  };

  const handleSendComment = async (
    content: string,
    parentCommentId: string | null
  ) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${api.baseUrl}/posts/${postId}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ content, parentCommentId }),
      });
      if (res.ok) {
        await fetchComments();
      }
    } catch (error) {
      console.error("Send comment error:", error);
    }
  };

  const handleLikeComment = async (id: string, currentLiked: boolean) => {
    const headers = await getAuthHeader();
    const update = (list: ApiComment[]): ApiComment[] =>
      list.map((c) => ({
        ...c,
        ...(c.id === id && {
          liked: !currentLiked,
          likeCount: currentLiked
            ? Math.max(0, c.likeCount - 1)
            : c.likeCount + 1,
        }),
        replies: update(c.replies || []),
      }));

    setComments((prev) => update(prev));

    try {
      await fetch(
        currentLiked
          ? `${api.baseUrl}/reactions?targetId=${id}&targetType=COMMENT`
          : `${api.baseUrl}/reactions`,
        {
          method: currentLiked ? "DELETE" : "POST",
          headers,
          body: currentLiked
            ? undefined
            : JSON.stringify({
                targetType: "COMMENT",
                targetId: id,
                type: "LOVE",
              }),
        }
      );
    } catch (error) {
      fetchComments();
    }
  };

  const handleSharePost = async () => {
    if (isSharing) return;
    setIsSharing(true);

    // LOGIC QUAN TRỌNG: Nếu bài viết hiện tại là bài được share từ bài khác,
    // chúng ta sẽ lấy ID của bài gốc để share tiếp (Deep Share)

    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${api.baseUrl}/posts/${targetShareId}/share`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: repostContent }),
      });

      if (res.ok) {
        setRepostVisible(false);
        setRepostContent("");
        showAlert(
          "success",
          "Thành công",
          "Bài viết đã được chia sẻ lên bảng tin của bạn."
        );
      } else {
        showAlert("error", "Thất bại", "Không thể chia sẻ bài viết lúc này.");
      }
    } catch (error) {
      showAlert("error", "Lỗi", "Đã có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setIsSharing(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <View>
      <View style={styles.bar}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.barItem} onPress={handleLikePost}>
            <Heart
              size={18}
              color={liked ? "#e53935" : "#444"}
              fill={liked ? "#e53935" : "transparent"}
            />
            <Text
              style={[styles.barLabel, { color: liked ? "#e53935" : "#444" }]}
            >
              {likeCount > 0 ? likeCount : ""}
            </Text>
          </TouchableOpacity>
          {showMore && (
            <TouchableOpacity
              style={styles.barItem}
              onPress={handleOpenComments}
            >
              <MessageCircle size={18} color="#444" />
              <Text style={styles.barLabel}>
                {commentCount > 0 ? commentCount : ""}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.barItem}
            onPress={() => setRepostVisible(true)}
          >
            <Share2 size={18} color="#444" />
          </TouchableOpacity>
        </View>

        {showMore && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => router.replace(`/(main)/postDetail/${postId}`)}
          >
            <MoreHorizontal size={20} color="#444" />
          </TouchableOpacity>
        )}
      </View>

      <CommentModal
        visible={visible}
        onClose={() => setVisible(false)}
        comments={comments}
        postId={postId}
        onSendComment={handleSendComment}
        onLikeComment={handleLikeComment}
        onRefresh={() => fetchComments()}
      />

      {/* MODAL REPOST (SHARE) */}
      <Modal visible={repostVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRepostVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%" }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.repostModalContent}
            >
              <View style={styles.repostHeader}>
                <TouchableOpacity onPress={() => setRepostVisible(false)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.repostTitle}>Đăng lại</Text>
                <TouchableOpacity
                  style={[styles.repostBtn, isSharing && { opacity: 0.6 }]}
                  onPress={handleSharePost}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.repostBtnText}>Đăng</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.repostInput}
                placeholder="Bạn đang nghĩ gì về bài viết này?"
                placeholderTextColor="#999"
                multiline
                autoFocus
                value={repostContent}
                onChangeText={setRepostContent}
              />

              {/* Preview nhỏ gọn bài viết sẽ được share */}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* CUSTOM ALERT MODAL */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View
              style={[
                styles.alertIconCircle,
                {
                  backgroundColor:
                    alertConfig.type === "success" ? "#ECFDF5" : "#FEF2F2",
                },
              ]}
            >
              {alertConfig.type === "success" ? (
                <CheckCircle2 size={32} color="#10B981" />
              ) : (
                <AlertCircle size={32} color="#EF4444" />
              )}
            </View>

            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>

            <TouchableOpacity
              style={[
                styles.alertBtn,
                {
                  backgroundColor:
                    alertConfig.type === "success" ? "#10B981" : "#EF4444",
                },
              ]}
              onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
            >
              <Text style={styles.alertBtnText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PostActionBar;

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  leftActions: { flexDirection: "row", gap: 16, alignItems: "center" },
  barItem: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingVertical: 4,
  },
  barLabel: { fontSize: 14, color: "#444", fontWeight: "600" },
  moreButton: { padding: 6, borderRadius: 20, backgroundColor: "#F0F2F5" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  repostModalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 300,
  },
  repostHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  repostTitle: { fontSize: 18, fontWeight: "700", color: "#1C1E21" },
  repostBtn: {
    backgroundColor: Colors.blue[600],
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: "center",
  },
  repostBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  repostInput: {
    fontSize: 17,
    color: "#1C1E21",
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 15,
  },
  sharePreviewBox: {
    backgroundColor: "#F0F2F5",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.blue[500],
  },
  sharePreviewText: { fontSize: 13, color: "#65676B" },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    backgroundColor: "#FFF",
    width: "82%",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  alertIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  alertBtn: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  alertBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
