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

const PostMedia = () => {
  const { width: WIDTH } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0); // 0-based

  const DATA = [
    {
      id: "1",
      type: "img" as "img" | "video",
      uri: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
    },
    {
      id: "2",
      type: "video" as "img" | "video",
      uri: "https://res.cloudinary.com/diz9pqlzo/video/upload/sp_auto/v1764791962/Screen_Recording_2025-11-27_055336_kvgcks.m3u8",
    },
    {
      id: "3",
      type: "img" as "img" | "video",
      uri: "https://images.pexels.com/photos/34950/pexels-photo.jpg",
    },
    {
      id: "4",
      type: "video" as "img" | "video",
      uri: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
  ];

  const TOTAL = DATA.length;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const viewWidth = e.nativeEvent.layoutMeasurement.width; // chính xác hơn WIDTH
    const currentIndex = Math.round(offsetX / viewWidth); // 0-based
    setActiveIndex(currentIndex);
  };

  return (
    <View style={[styles.container, { width: WIDTH, height: 300 }]}>
      {/* Index indicator */}
      <View style={styles.indexContainer}>
        <Text style={styles.indexText}>
          {activeIndex + 1} / {TOTAL}
        </Text>
      </View>

      <FlatList
        data={DATA}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MediaItem
            type={item.type}
            uri={item.uri}
            isActive={index === activeIndex} // 👈 chỉ slide đang visible mới play video
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
