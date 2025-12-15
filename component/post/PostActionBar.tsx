import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { router } from "expo-router";
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

/* ================= TYPES ================= */

type Comment = {
  id: string;
  content: string;
  authorName: string;

  parentId?: string | null;
  children?: Comment[];

  liked: boolean;
  likeCount: number;
};

type Props = {
  postId: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
  commentCount?: number;
};

/* ================= COMPONENT ================= */

const PostActionBar = ({
  postId,
  initialLiked = false,
  initialLikeCount = 0,
  commentCount = 0,
}: Props) => {
  /* ===== STATE ===== */
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const [commentVisible, setCommentVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  /* ================= API HELPERS ================= */

  const getAuthHeader = async () => {
    const auth = AuthHelper.getInstance();
    return {
      Authorization: `Bearer ${await auth.getAccessToken()}`,
      "Content-Type": "application/json",
    };
  };

  /* ================= LIKE POST ================= */

  const handleLikePost = async () => {
    const api = Api.getInstance();
    const headers = await getAuthHeader();

    setLiked((p) => !p);
    setLikeCount((c) => (liked ? c - 1 : c + 1));

    try {
      if (!liked) {
        await fetch(`${api.baseUrl}/reactions`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            targetType: "POST",
            targetId: postId,
            type: "LOVE",
          }),
        });
      } else {
        await fetch(
          `${api.baseUrl}/reactions?targetId=${postId}&targetType=POST`,
          { method: "DELETE", headers }
        );
      }
    } catch (e) {
      console.log("Like post error", e);
    }
  };

  /* ================= COMMENTS ================= */

  const fetchComments = async () => {
    const api = Api.getInstance();
    const headers = await getAuthHeader();

    const res = await fetch(
      `${api.baseUrl}/posts/${postId}/comments`,
      { headers }
    );
   const result  = await res.json();
    const flat: Comment[] = result.data

    // map 2 cấp
    const map: Record<string, Comment> = {};
    const roots: Comment[] = [];

    flat.forEach((c) => (map[c.id] = { ...c, children: [] }));
    flat.forEach((c) => {
      if (c.parentId) {
        map[c.parentId]?.children?.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    setComments(roots);
  };

  const handleOpenComment = async () => {
    setCommentVisible(true);
    if (comments.length === 0) await fetchComments();
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    const api = Api.getInstance();
    const headers = await getAuthHeader();

    await fetch(`${api.baseUrl}/posts/${postId}/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content: newComment,
        parentCommentId: replyTo,
      }),
    });

    setNewComment("");
    setReplyTo(null);
    fetchComments();
  };

  /* ================= LIKE COMMENT ================= */

  const toggleLikeComment = async (commentId: string, liked: boolean) => {
    const api = Api.getInstance();
    const headers = await getAuthHeader();

    setComments((prev) =>
      prev.map((c) => ({
        ...c,
        children: c.children?.map((ch) =>
          ch.id === commentId
            ? {
                ...ch,
                liked: !liked,
                likeCount: liked
                  ? ch.likeCount - 1
                  : ch.likeCount + 1,
              }
            : ch
        ),
        ...(c.id === commentId && {
          liked: !liked,
          likeCount: liked
            ? c.likeCount - 1
            : c.likeCount + 1,
        }),
      }))
    );

    if (!liked) {
      await fetch(`${api.baseUrl}/reactions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          targetType: "COMMENT",
          targetId: commentId,
          type: "LOVE",
        }),
      });
    } else {
      await fetch(
        `${api.baseUrl}/reactions?targetId=${commentId}&targetType=COMMENT`,
        { method: "DELETE", headers }
      );
    }
  };

  /* ================= RENDER COMMENT ================= */

  const renderComment = (comment: Comment) => (
    <View key={comment.id} style={{ marginBottom: 12 }}>
      <View style={styles.commentBubble}>
        <Text style={styles.commentAuthor}>{comment.authorName}</Text>
        <Text>{comment.content}</Text>

        <View style={styles.commentActions}>
          <TouchableOpacity
            onPress={() =>
              toggleLikeComment(comment.id, comment.liked)
            }
          >
            <Text style={styles.commentAction}>
              ❤️ {comment.likeCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setReplyTo(comment.id)}
          >
            <Text style={styles.commentAction}>Trả lời</Text>
          </TouchableOpacity>
        </View>
      </View>

      {comment.children?.map((child) => (
        <View key={child.id} style={styles.replyContainer}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentAuthor}>
              {child.authorName}
            </Text>
            <Text>{child.content}</Text>

            <TouchableOpacity
              onPress={() =>
                toggleLikeComment(child.id, child.liked)
              }
            >
              <Text style={styles.commentAction}>
                ❤️ {child.likeCount}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  /* ================= RENDER ================= */

  return (
    <View>
      {/* ACTION BAR */}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={handleLikePost}
        >
          <Heart
            size={18}
            color={liked ? "#e53935" : "#444"}
            fill={liked ? "#e53935" : "transparent"}
          />
          <Text style={styles.actionLabel}>
            Thích {likeCount > 0 && `(${likeCount})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={()=>router.push('/(main)/postDetail/1')}
        >
          <MessageCircle size={18} color="#444" />
          <Text style={styles.actionLabel}>
            Bình luận {commentCount > 0 && `(${commentCount})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => setShareVisible(true)}
        >
          <Share2 size={18} color="#444" />
          <Text style={styles.actionLabel}>Chia sẻ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => setOptionsVisible(true)}
        >
          <MoreHorizontal size={20} color="#444" />
        </TouchableOpacity>
      </View>

      {/* COMMENT MODAL */}
      <Modal visible={commentVisible} transparent animationType="slide">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCommentVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.commentContainer}
          >
            <Pressable style={styles.commentContent}>
              <FlatList
                data={comments}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => renderComment(item)}
              />

              {replyTo && (
                <Text style={styles.replyHint}>
                  Đang trả lời bình luận
                </Text>
              )}

              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Viết bình luận..."
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
    </View>
  );
};

export default PostActionBar;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
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
  moreBtn: {
    paddingHorizontal: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  commentContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  commentContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "85%",
  },
  commentBubble: {
    backgroundColor: "#f3f3f3",
    borderRadius: 12,
    padding: 10,
  },
  commentAuthor: {
    fontWeight: "600",
    marginBottom: 2,
  },
  commentActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  commentAction: {
    fontSize: 12,
    color: "#666",
  },
  replyContainer: {
    marginLeft: 32,
    marginTop: 6,
  },
  commentInputRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  commentSend: {
    color: "#007AFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  replyHint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
});
