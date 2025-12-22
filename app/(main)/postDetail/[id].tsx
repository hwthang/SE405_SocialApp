import PostActionBar from "@/component/post/PostActionBar";
import PostCaption from "@/component/post/PostCaption";
import PostHeader from "@/component/post/PostHeader";
import PostMedia from "@/component/post/PostMedia";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { getRelativeTimeFromISO } from "@/utils/date";
import { useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PostDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(
    null
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    fetchData();
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const show = Keyboard.addListener(showEvent, (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const api = Api.getInstance();
      const token = await AuthHelper.getInstance().getAccessToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [postRes, commentRes] = await Promise.all([
        fetch(`${api.baseUrl}/posts/${id}`, { headers }),
        fetch(`${api.baseUrl}/posts/${id}/comments`, { headers }),
      ]);

      const postJson = await postRes.json();
      const commentJson = await commentRes.json();

      setPost(postJson.data);
      setComments(commentJson.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Hàm Like/Unlike bình luận
  const toggleLikeComment = async (
    commentId: string,
    currentLiked?: boolean
  ) => {
    const api = Api.getInstance();
    const token = await AuthHelper.getInstance().getAccessToken();

    // Optimistic UI: Cập nhật state trước khi gọi API để tạo cảm giác mượt mà
    const updateList = (list: any[]): any[] =>
      list.map((c) => ({
        ...c,
        ...(c.id === commentId && {
          liked: !currentLiked,
          likeCount: currentLiked
            ? (c.likeCount || 1) - 1
            : (c.likeCount || 0) + 1,
        }),
        replies: updateList(c.replies || []),
      }));

    setComments((prev) => updateList(prev));

    try {
      await fetch(
        currentLiked
          ? `${api.baseUrl}/reactions?targetId=${commentId}&targetType=COMMENT`
          : `${api.baseUrl}/reactions`,
        {
          method: currentLiked ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: currentLiked
            ? undefined
            : JSON.stringify({
                targetType: "COMMENT",
                targetId: commentId,
                type: "LOVE",
              }),
        }
      );
    } catch (error) {
      console.error("Like comment error:", error);
      fetchData(); // Nếu lỗi thì fetch lại để đồng bộ data
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    const api = Api.getInstance();
    const token = await AuthHelper.getInstance().getAccessToken();

    await fetch(`${api.baseUrl}/posts/${id}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: newComment,
        parentCommentId: replyTo?.id || null,
      }),
    });

    setNewComment("");
    setReplyTo(null);
    Keyboard.dismiss();
    fetchData(); // Fetch lại để hiện comment mới
  };

  const renderCommentItem = ({ item }: any) => (
    <View style={styles.commentWrapper}>
      <View style={styles.commentRow}>
        <Image
          source={{
            uri:
              item.author.avatarUrl ||
              `https://ui-avatars.com/api/?name=${item.author.name}`,
          }}
          style={styles.avatar}
        />
        <View style={styles.commentContent}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentAuthor}>{item.author.name}</Text>
            <Text style={styles.commentText}>{item.content}</Text>
          </View>
          <View style={styles.commentActions}>
            <TouchableOpacity
              onPress={() => toggleLikeComment(item.id, item.liked)}
            >
              <Text
                style={[
                  styles.actionBtn,
                  {
                    color: item.liked ? "#e53935" : "#65676b",
                    fontWeight: "700",
                  },
                ]}
              >
                {item.liked ? "❤️" : "Thích"}{" "}
                {item.likeCount > 0 ? item.likeCount : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setReplyTo({ id: item.id, name: item.author.name })
              }
            >
              <Text style={styles.actionBtn}>Trả lời</Text>
            </TouchableOpacity>
            <Text style={styles.commentTime}>
              {getRelativeTimeFromISO(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Render Replies */}
      {item.replies?.map((reply: any) => (
        <View key={reply.id} style={[styles.commentRow, styles.replyRow]}>
          <Image
            source={{
              uri:
                reply.author.avatarUrl ||
                `https://ui-avatars.com/api/?name=${reply.author.name}`,
            }}
            style={[styles.avatar, { width: 28, height: 28 }]}
          />
          <View style={styles.commentContent}>
            <View style={styles.commentBubble}>
              <Text style={styles.commentAuthor}>{reply.author.name}</Text>
              <Text style={styles.commentText}>{reply.content}</Text>
            </View>
            <View style={styles.commentActions}>
              <TouchableOpacity
                onPress={() => toggleLikeComment(reply.id, reply.liked)}
              >
                <Text
                  style={[
                    styles.actionBtn,
                    {
                      color: reply.liked ? "#e53935" : "#65676b",
                      fontWeight: "700",
                    },
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
      ))}
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
      <FlatList
        data={comments}
        renderItem={renderCommentItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <PostHeader
              author={post.author}
              createdAt={post.createdAt}
              privacy={post.privacy}
            />
            <PostCaption text={post.text} />
            {post.media?.length > 0 && <PostMedia media={post.media} />}
            <View style={styles.divider} />
            <PostActionBar postId={post.id} commentCount={comments.length} />
            <Text style={styles.commentTitle}>Bình luận</Text>
          </View>
        }
        contentContainerStyle={styles.listPadding}
      />

      <View style={styles.inputContainer}>
        {replyTo && (
          <View style={styles.replyHint}>
            <Text style={styles.replyHintText}>
              Đang trả lời {replyTo.name}
            </Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <X size={14} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Viết bình luận..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            onPress={handleSendComment}
            disabled={!newComment.trim()}
          >
            <Text
              style={[styles.sendText, !newComment.trim() && { color: "#ccc" }]}
            >
              Gửi
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerArea: { paddingTop: 10 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },
  commentTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
  },
  listPadding: { paddingBottom: 100 },
  commentWrapper: { marginBottom: 15, paddingHorizontal: 12 },
  commentRow: { flexDirection: "row", gap: 10 },
  replyRow: { marginLeft: 44, marginTop: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#eee" },
  commentContent: { flex: 1 },
  commentBubble: {
    backgroundColor: "#f0f2f5",
    padding: 10,
    borderRadius: 18,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  commentAuthor: { fontWeight: "700", fontSize: 13, marginBottom: 2 },
  commentText: { fontSize: 14, color: "#1c1e21" },
  commentActions: {
    flexDirection: "row",
    gap: 15,
    marginTop: 4,
    alignItems: "center",
    paddingLeft: 4,
  },
  actionBtn: { fontSize: 12, color: "#65676b" },
  commentTime: { fontSize: 12, color: "#65676b" },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    padding: 10,
    paddingBottom: 30,
  },
  replyHint: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f0f2f5",
    padding: 8,
    marginBottom: 5,
    borderRadius: 5,
  },
  replyHintText: { fontSize: 12, color: "#65676b" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  textInput: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendText: { color: "#0084ff", fontWeight: "700", paddingRight: 5 },
});
