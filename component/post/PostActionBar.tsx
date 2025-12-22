import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { router } from "expo-router";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
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
  commentCount?: number;
};

/* ================= COMPONENT ================= */

const PostActionBar = ({
  postId,
  commentCount: initialCommentCount = 0,
}: Props) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [visible, setVisible] = useState(false);
  const [comments, setComments] = useState<ApiComment[]>([]);

  const api = Api.getInstance();

  /* ================= HELPERS ================= */

  const getAuthHeader = async () => ({
    Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
    "Content-Type": "application/json",
  });

  /* ================= FETCH DATA ================= */

  // Gọi API lấy chi tiết Post để cập nhật Reaction
  const fetchPostDetail = async () => {
    try {
      const headers = await getAuthHeader();
      const userId = await AuthHelper.getInstance().getUserId();
      
      const res = await fetch(`${api.baseUrl}/posts/${postId}`, { headers });
      const json = await res.json();

      if (res.ok && json.data) {
        const reactions = json.data.reactions || [];
        setLikeCount(reactions.length);
        setLiked(reactions.some((r: any) => r.userId === userId));
      }
    } catch (error) {
      console.error("Fetch post detail error:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const headers = await getAuthHeader();
      const userId = await AuthHelper.getInstance().getUserId();
      
      const res = await fetch(`${api.baseUrl}/posts/${postId}/comments`, { headers });
      const json = await res.json();

      // Dựa trên data structure json.data.items
      const rawItems = json.data?.items || [];

      const normalize = (list: any[]): ApiComment[] =>
        list.map((c) => ({
          ...c,
          liked: Array.isArray(c.reactions) ? c.reactions.some((r: any) => r.userId === userId) : false,
          likeCount: Array.isArray(c.reactions) ? c.reactions.length : 0,
          replies: normalize(c.replies || []),
        }));

      setComments(normalize(rawItems));
      setCommentCount(rawItems.length); // Cập nhật lại số lượng comment thực tế
    } catch (error) {
      console.error("Fetch comments error:", error);
    }
  };

  // Tự động fetch data khi postId thay đổi
  useEffect(() => {
    if (postId) {
      fetchPostDetail();
      fetchComments()
    }
  }, [postId]);

  /* ================= HANDLERS ================= */

  const handleLikePost = async () => {
    const headers = await getAuthHeader();
    const prevLiked = liked;
    
    // Optimistic UI
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
          body: prevLiked ? undefined : JSON.stringify({ 
            targetType: "POST", 
            targetId: postId, 
            type: "LOVE" 
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

  const handleSendComment = async (content: string, parentCommentId: string | null) => {
    const headers = await getAuthHeader();
    await fetch(`${api.baseUrl}/posts/${postId}/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content, parentCommentId }),
    });
    await fetchComments();
  };

  const handleLikeComment = async (id: string, currentLiked: boolean) => {
    const headers = await getAuthHeader();
    const update = (list: ApiComment[]): ApiComment[] =>
      list.map((c) => ({
        ...c,
        ...(c.id === id && {
          liked: !currentLiked,
          likeCount: currentLiked ? Math.max(0, c.likeCount - 1) : c.likeCount + 1,
        }),
        replies: update(c.replies || []),
      }));

    setComments((prev) => update(prev));

    await fetch(
      currentLiked
        ? `${api.baseUrl}/reactions?targetId=${id}&targetType=COMMENT`
        : `${api.baseUrl}/reactions`,
      {
        method: currentLiked ? "DELETE" : "POST",
        headers,
        body: currentLiked ? undefined : JSON.stringify({ 
          targetType: "COMMENT", 
          targetId: id, 
          type: "LOVE" 
        }),
      }
    );
  };

  return (
    <View>
      <View style={styles.bar}>
        <TouchableOpacity style={styles.barItem} onPress={handleLikePost}>
          <Heart 
            size={18} 
            color={liked ? "#e53935" : "#444"} 
            fill={liked ? "#e53935" : "transparent"} 
          />
          <Text style={[styles.barLabel, { color: liked ? "#e53935" : "#444" }]}>
             {likeCount > 0 ? likeCount : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.barItem} onPress={handleOpenComments}>
          <MessageCircle size={18} color="#444" />
          <Text style={styles.barLabel}>
            {commentCount > 0 ? commentCount : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.barItem}>
          <Share2 size={18} color="#444" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.moreButton} 
          onPress={() => router.push(`/(main)/postDetail/${postId}`)}
        >
          <MoreHorizontal size={18} color="#444" />
        </TouchableOpacity>
      </View>

      <CommentModal
        visible={visible}
        onClose={() => setVisible(false)}
        comments={comments}
        postId={postId}
        onSendComment={handleSendComment}
        onLikeComment={handleLikeComment}
      />
    </View>
  );
};

export default PostActionBar;

const styles = StyleSheet.create({
  bar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, paddingHorizontal: 16 },
  barItem: { flexDirection: "row", gap: 4, alignItems: "center", paddingHorizontal: 6, paddingVertical: 4 },
  barLabel: { fontSize: 13, color: "#444", fontWeight: "600" },
  moreButton: { padding: 6 },
});