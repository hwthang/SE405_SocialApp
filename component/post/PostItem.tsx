import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import PostActionBar from "./PostActionBar";
import PostCaption from "./PostCaption";
import PostHeader from "./PostHeader";
import PostMedia from "./PostMedia";

type PostItemProps = {
  post: any;
  isSharedChild?: boolean; // Flag để biết đây là bài viết con bên trong
};

const PostItem = ({ post, isSharedChild = false }: PostItemProps) => {
  // Điều hướng đến chi tiết bài viết gốc khi nhấn vào khung repost
  const handlePressOriginal = () => {
    if (post.id) {
      router.push(`/(main)/postDetail/${post.sharedFrom.id}`);
    }
  };

  return (
    <View style={[styles.wrapper, isSharedChild && styles.sharedChildWrapper]}>
      {/* 1. Header: Hiển thị người đăng (cha hoặc con) */}
      <PostHeader
        author={post.author}
        createdAt={post.createdAt}
        privacy={post.privacy}
      />

      {/* 2. Content Section */}
      <View style={styles.content}>
        {/* Caption của post hiện tại */}
        {post.text ? <PostCaption text={post.text} /> : <View />}

        {/* --- LOGIC ĐĂNG LẠI (REPOST) --- */}
        {post.sharedFrom && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePressOriginal}
            style={styles.repostContainer}
          >
            {/* Đệ quy: Gọi lại chính PostItem cho bài viết gốc */}
            <PostItem post={post.sharedFrom} isSharedChild={true} />
          </TouchableOpacity>
        )}

        {/* Media: Chỉ hiển thị nếu bài viết có media (thường là bài gốc) */}
        {post.media?.length > 0 && <PostMedia media={post.media} />}
      </View>

      {/* 3. Action Bar: Chỉ hiện ở bài viết ngoài cùng (bài viết cha) */}
      {!isSharedChild && (
        <View style={styles.section}>
          <PostActionBar postId={post.id} showMore={true} />
        </View>
      )}
    </View>
  );
};

export default PostItem;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 6,
    backgroundColor: "#FFF",
    paddingTop: 10,
  },
  // Style tối giản cho bài viết nằm bên trong khung repost
  sharedChildWrapper: {
    marginBottom: 0,
    paddingTop: 5,
    backgroundColor: "transparent", // Để lộ màu nền của repostContainer
  },
  section: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  content: {
    gap: 10,
  },
  // Khung viền bọc bài viết được chia sẻ
  repostContainer: {
    marginHorizontal: 12,
    paddingTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E4E6EB",
    overflow: "hidden",
    backgroundColor: "#F7F8FA", // Màu nền khác biệt một chút để phân tách
    paddingBottom: 10, // Tạo khoảng trống dưới cùng cho bài lồng
  },
});
