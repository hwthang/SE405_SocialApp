import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PostCaptionProps {
  text: string;
  maxLines?: number;
}

const PostCaption = ({ text, maxLines = 3 }: PostCaptionProps) => {
  const [expanded, setExpanded] = useState(false);

  const isLong = text.length > 120; // Bạn có thể thay bằng logic đo text chính xác hơn

  return (
    <View style={styles.container}>
      <Text
        style={styles.captionText}
        numberOfLines={expanded ? undefined : maxLines}
      >
        {text}
      </Text>

      {isLong && (
        <TouchableOpacity onPress={() => setExpanded((prev) => !prev)}>
          <Text style={styles.moreText}>
            {expanded ? "Thu gọn" : "Xem thêm"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PostCaption;

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    paddingHorizontal: 4,
  },

  captionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#222",
  },

  moreText: {
    marginTop: 4,
    color: "#555",
    fontWeight: "600",
  },
});
