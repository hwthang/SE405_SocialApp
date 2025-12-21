// components/message/MessageMedia/VideoMedia.tsx
import { useVideoPlayer } from "expo-video";
import { Play } from "lucide-react-native";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

type Props = {
  uri: string;
  onPress?: () => void;
};

const MAX_WIDTH = 220;
const MAX_HEIGHT = 260;

const VideoMedia = ({ uri, onPress }: Props) => {
  const player = useVideoPlayer(uri, (p) => { p.loop = true; });

  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      <Image source={{ uri }} style={styles.video} resizeMode="cover" />
      <View style={styles.playOverlay}>
        <Play size={28} color="white" />
      </View>
    </Pressable>
  );
};

export default VideoMedia;

const styles = StyleSheet.create({
  wrapper: { width: MAX_WIDTH, height: MAX_HEIGHT, borderRadius: 12, overflow: "hidden", backgroundColor: "black" },
  video: { width: "100%", height: "100%" },
  playOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
});
