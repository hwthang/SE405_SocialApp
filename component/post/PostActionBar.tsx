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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CommentModal } from "./CommentModal"; // Đảm bảo đường dẫn này đúng

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

  /* ================= HELPERS ================= */

  const getAuthHeader = async () => ({
    Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
    "Content-Type": "application/json",
  });

  const fetchComments = async () => {
    const api = Api.getInstance();
    const headers = await getAuthHeader();
    const res = await fetch(`${api.baseUrl}/posts/${postId}/comments`, { headers });
    const json = await res.json();

    const normalize = (list: any[]): ApiComment[] =>
      list.map((c) => ({
        ...c,
        liked: c.liked ?? false,
        likeCount: c.likeCount ?? 0,
        replies: normalize(c.replies || []),
      }));

    setComments(normalize(json.data || []));
  };

  /* ================= HANDLERS ================= */

  const handleLikePost = async () => {
    const api = Api.getInstance();
    const headers = await getAuthHeader();
    
    // Optimistic UI cho Post
    setLiked((p) => !p);
    setLikeCount((c) => (liked ? c - 1 : c + 1));

    await fetch(
      liked
        ? `${api.baseUrl}/reactions?targetId=${postId}&targetType=POST`
        : `${api.baseUrl}/reactions`,
      {
        method: liked ? "DELETE" : "POST",
        headers,
        body: liked ? undefined : JSON.stringify({ 
          targetType: "POST", 
          targetId: postId, 
          type: "LOVE" 
        }),
      }
    );
  };

  const handleOpenComments = async () => {
    await fetchComments();
    setVisible(true);
  };

  const handleSendComment = async (content: string, parentCommentId: string | null) => {
    const api = Api.getInstance();
    const headers = await getAuthHeader();

    await fetch(`${api.baseUrl}/posts/${postId}/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content, parentCommentId }),
    });

    await fetchComments(); // Reload danh sách sau khi gửi
  };

  const handleLikeComment = async (id: string, currentLiked?: boolean) => {
    const api = Api.getInstance();
    const headers = await getAuthHeader();

    // Optimistic UI cho Comment (đệ quy)
    const update = (list: ApiComment[]): ApiComment[] =>
      list.map((c) => ({
        ...c,
        ...(c.id === id && {
          liked: !currentLiked,
          likeCount: currentLiked ? (c.likeCount || 1) - 1 : (c.likeCount || 0) + 1,
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

  /* ================= RENDER ================= */

  return (
    <View>
      <View style={styles.bar}>
        <TouchableOpacity style={styles.barItem} onPress={handleLikePost}>
          <Heart 
            size={18} 
            color={liked ? "#e53935" : "#444"} 
            fill={liked ? "#e53935" : "transparent"} 
          />
          {/* <Text style={[styles.barLabel, { color: liked ? "#e53935" : "#444" }]}>
            {likeCount > 0 ? likeCount : ""}
          </Text> */}
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

      {/* CUSTOM MODAL THỦ CÔNG */}
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
  bar: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
  
  },
  barItem: { 
    flexDirection: "row", 
    gap: 4, 
    alignItems: "center", 
    paddingHorizontal: 6, 
    paddingVertical: 4 
  },
  barLabel: { 
    fontSize: 13, 
    color: "#444" 
  },
  moreButton: { 
    padding: 6 
  },
});