import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";

interface MediaItemProps {
  type: "img" | "video";
  uri: string;
  isActive: boolean;
}

const MediaItem = ({ type, uri, isActive }: MediaItemProps) => {
  const { width: WIDTH } = useWindowDimensions();

  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });

  // Auto play/pause theo slide được focus
  useEffect(() => {
    if (type !== "video") return;
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player, type]);

  return (
    <View style={[styles.container, { width: WIDTH }]}>
      {/* 🔹 BACKGROUND */}
      {type === "img" ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          blurRadius={30}
          resizeMode="cover"
        />
      ) : (
        // VIDEO không dùng thumbnail → fallback nền đen
        <View style={styles.fallbackBg} />
      )}

      {/* 🔹 MEDIA CHÍNH */}
      {type === "img" ? (
        <Image
          source={{ uri }}
          style={styles.mainMedia}
          resizeMode="contain"
        />
      ) : (
        <VideoView
          player={player}
          style={styles.mainMedia}
          contentFit="contain"
          nativeControls
          allowsFullscreen
          allowsPictureInPicture
        />
      )}
    </View>
  );
};

export default MediaItem;

const styles = StyleSheet.create({
  container: {
    height: 300,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  mainMedia: {
    width: "100%",
    height: "100%",
    zIndex: 10,
  },
  fallbackBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
  },
});
