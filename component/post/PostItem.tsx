import React from "react";
import { StyleSheet, View } from "react-native";
import PostActionBar from "./PostActionBar";
import PostCaption from "./PostCaption";
import PostHeader from "./PostHeader";
import PostMedia from "./PostMedia";

type PostItemProps = {
  post: any;
};

const PostItem = ({ post }: PostItemProps) => {
  return (
    <View style={styles.wrapper}>
      {/* Header */}

      <PostHeader
        author={post.author}
        createdAt={post.createdAt}
        privacy={post.privacy}
      />

      {/* Content */}
      <View style={styles.content}>
        {post.text ? <PostCaption text={post.text} /> : null}

        {post.media?.length > 0 ? <PostMedia media={post.media} /> : null}
      </View>

      {/* Action bar */}
      <View style={styles.section}>
        <PostActionBar postId={post.id} />
      </View>
    </View>
  );
};

export default PostItem;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
    backgroundColor: "#FFF",
    
    paddingTop: 10,
  },
  section: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  content: {
    gap: 10,
  },
});
