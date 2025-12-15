import React, { useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import MediaItem from "./MediaItem";

type Media = {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
};

type Props = {
  media: Media[];
};

const PostMedia = ({ media }: Props) => {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x /
        e.nativeEvent.layoutMeasurement.width
    );
    setActiveIndex(index);
  };

  if (!media || media.length === 0) return null;

  return (
    <View style={[styles.container, { width, height: 300 }]}>
      {media.length > 1 && (
        <View style={styles.indexContainer}>
          <Text style={styles.indexText}>
            {activeIndex + 1} / {media.length}
          </Text>
        </View>
      )}

      <FlatList
        data={media}
        horizontal
        pagingEnabled
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MediaItem
            type={item.type === "VIDEO" ? "video" : "img"}
            uri={item.url}
            isActive={index === activeIndex}
          />
        )}
      />
    </View>
  );
};

export default PostMedia;


const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  indexContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  indexText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
