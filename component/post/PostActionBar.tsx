import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CustomBottomModal } from "../custom/CustomBottomModal";

/* ================= UTILS ================= */

export const getRelativeTimeFromISO = (isoTime: string): string => {
  const time = new Date(isoTime);
  if (isNaN(time.getTime())) return "";

  const now = Date.now();
  let diffMs = now - time.getTime();
  if (diffMs < 0) diffMs = 0;

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (sec < 60) return "Vừa xong";
  if (min < 60) return `${min} phút trước`;
  if (hour < 24) return `${hour} giờ trước`;
  if (day < 7) return `${day} ngày trước`;

  return `${time.getDate().toString().padStart(2, "0")}/${(time.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${time.getFullYear()}`;
};

/* ================= TYPES ================= */

type ApiAuthor = {
  id: string;
  name: string;
};

type ApiComment = {
  id: string;
  content: string;
  createdAt: string;
  author: ApiAuthor;
  replies: ApiComment[];
  liked?: boolean;
  likeCount?: number;
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
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [visible, setVisible] = useState(false);

  const [comments, setComments] = useState<ApiComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  /* ================= HELPERS (Giữ nguyên) ================= */

  const getAuthHeader = async () => ({
    Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
    "Content-Type": "application/json",
  });

  /* ================= POST LIKE (Giữ nguyên) ================= */

  const handleLikePost = async () => {
    const api = Api.getInstance();
    const headers = await getAuthHeader();

    setLiked((p) => !p);
    setLikeCount((c) => (liked ? c - 1 : c + 1));

    await fetch(
      liked
        ? `${api.baseUrl}/reactions?targetId=${postId}&targetType=POST`
        : `${api.baseUrl}/reactions`,
      {
        method: liked ? "DELETE" : "POST",
        headers,
        body: liked
          ? undefined
          : JSON.stringify({
              targetType: "POST",
              targetId: postId,
              type: "LOVE",
            }),
      }
    );
  };

  /* ================= COMMENTS (Giữ nguyên) ================= */

  const fetchComments = async () => {
    const api = Api.getInstance();
    const headers = await getAuthHeader();

    const res = await fetch(`${api.baseUrl}/posts/${postId}/comments`, {
      headers,
    });
    const json = await res.json();

    const normalize = (list: ApiComment[]): ApiComment[] =>
      list.map((c) => ({
        ...c,
        liked: c.liked ?? false,
        likeCount: c.likeCount ?? 0,
        replies: normalize(c.replies || []),
      }));

    setComments(normalize(json.data || []));
  };

  const openComments = async () => {
    await fetchComments();
    setVisible(true);
  };

  const sendComment = async () => {
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

  const toggleLikeComment = async (id: string, liked?: boolean) => {
    const api = Api.getInstance();
    const headers = await getAuthHeader();

    const update = (list: ApiComment[]): ApiComment[] =>
      list.map((c) => ({
        ...c,
        ...(c.id === id && {
          liked: !liked,
          likeCount: liked ? (c.likeCount || 1) - 1 : (c.likeCount || 0) + 1,
        }),
        replies: update(c.replies || []),
      }));

    setComments((prev) => update(prev));

    await fetch(
      liked
        ? `${api.baseUrl}/reactions?targetId=${id}&targetType=COMMENT`
        : `${api.baseUrl}/reactions`,
      {
        method: liked ? "DELETE" : "POST",
        headers,
        body: liked
          ? undefined
          : JSON.stringify({
              targetType: "COMMENT",
              targetId: id,
              type: "LOVE",
            }),
      }
    );
  };

  /* ================= RENDER ================= */

  const Avatar = ({ size = 30 }) => (
    <View
      style={[
        styles.avatarPlaceholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  );

  const renderComment = ({ item }: { item: ApiComment }) => (
    <View style={styles.commentBlock}>
      {/* Comment Cha */}
      <View style={styles.row}>
        <Avatar />
        <View style={styles.bubble}>
          <Text style={styles.author}>{item.author.name}</Text>
          <Text>{item.content}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => toggleLikeComment(item.id, item.liked)}
            >
              <Text
                style={[
                  styles.action,
                  { color: item.liked ? "#e53935" : "#666", fontWeight: "600" },
                ]}
              >
                {item.liked ? "❤️" : "👍"} {item.likeCount || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setReplyTo(item.id)}>
              <Text style={styles.action}>Trả lời</Text>
            </TouchableOpacity>

            <Text style={styles.time}>
              {getRelativeTimeFromISO(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Replies */}
      {item.replies?.map((r) => (
        <View key={r.id} style={styles.reply}>
          <View style={styles.row}>
            <Avatar size={24} />
            <View style={styles.bubble}>
              <Text style={styles.author}>{r.author.name}</Text>
              <Text>{r.content}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => toggleLikeComment(r.id, r.liked)}
                >
                  <Text
                    style={[
                      styles.action,
                      {
                        color: r.liked ? "#e53935" : "#666",
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {r.liked ? "❤️" : "👍"} {r.likeCount || 0}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.time}>
                  {getRelativeTimeFromISO(r.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const repliedName = comments.find((c) => c.id === replyTo)?.author.name;

  return (
    <View>
      {/* ACTION BAR */}
      <View style={styles.bar}>
        <TouchableOpacity style={styles.barItem} onPress={handleLikePost}>
          <Heart
            size={18}
            color={liked ? "#e53935" : "#444"}
            fill={liked ? "#e53935" : "transparent"}
          />
          <Text style={[styles.barLabel, {color: liked ? "#e53935" : "#444"}]}>
            {likeCount > 0 && `${likeCount}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.barItem} onPress={openComments}>
          <MessageCircle size={18} color="#444" />
          <Text style={styles.barLabel}>
           {commentCount > 0 && `${commentCount}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.barItem}>
          <Share2 size={18} color="#444" />
         
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal size={18} color="#444" />
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <CustomBottomModal
   
     
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setVisible(false)}
        />

        <View style={styles.modal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 90}
            style={styles.kav}
          >
            <Text style={styles.title}>Bình luận</Text>

            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(i) => i.id}
              style={styles.flatList}
              contentContainerStyle={{ paddingBottom: 10 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
            />

            {/* INPUT AREA */}
            <View style={styles.inputAreaWrapper}>
              {replyTo && repliedName && (
                <View style={styles.replyHint}>
                  <Text style={styles.replyHintText}>
                    Đang trả lời{" "}
                    <Text style={{ fontWeight: "700" }}>{repliedName}</Text>
                  </Text>
                  <Pressable
                    onPress={() => setReplyTo(null)}
                    style={{ padding: 4 }}
                  >
                    <X size={14} color="red" />
                  </Pressable>
                </View>
              )}

              <View style={styles.inputRow}>
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder="Viết bình luận..."
                  multiline
                  textAlignVertical="top"
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={sendComment}
                  disabled={!newComment.trim()}
                  style={styles.sendButton}
                >
                  <Text
                    style={[
                      styles.send,
                      { color: newComment.trim() ? "#007AFF" : "#ccc" },
                    ]}
                  >
                    Gửi
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </CustomBottomModal>
    </View>
  );
};

export default PostActionBar;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  // Action Bar
  bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  barItem: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  barLabel: {
    fontSize: 13,
    color: "#444",
  },
  moreButton: {
    padding: 6,
  },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    position: "absolute",
    bottom: 0,
    height: 420,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden", // Giữ cho nội dung modal nằm trong border radius
  },
  kav: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  // Comment List & Items
  flatList: {
    flex: 1, // Đảm bảo cuộn (scrolling)
    paddingHorizontal: 16,
  },
  commentBlock: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: "#ccc",
    marginRight: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bubble: {
    backgroundColor: "#f3f3f3",
    borderRadius: 18, // Bo tròn hơn
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexShrink: 1,
  },
  author: {
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    alignItems: "center",
  },
  action: {
    fontSize: 12,
    color: "#666",
  },
  time: {
    fontSize: 11,
    color: "#888",
    marginLeft: 8, // Tách thời gian ra khỏi các nút hành động
  },

  reply: {
    marginLeft: 38,
    marginTop: 6,
    borderLeftWidth: 2, // Đường phân cách cho reply
    borderLeftColor: "#ddd",
    paddingLeft: 10,
  },

  // Input Area
  inputAreaWrapper: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  replyHint: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "#e8f2ff", // Màu nền nhẹ cho hint
  },
  replyHintText: {
    fontSize: 12,
    color: "#007AFF",
  },
  inputRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 8, // Điều chỉnh padding dọc
    fontSize: 15,
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 8,
    paddingVertical: 8, // Căn giữa nút Gửi
  },
  send: {
    fontWeight: "700",
    fontSize: 15,
  },
});