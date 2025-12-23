import { useVideoPlayer, VideoView } from "expo-video"; // Import từ expo-video
import { X } from "lucide-react-native";
import React, { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, View } from "react-native";
import ImageMedia from "./ImageMedia";
import VideoMedia from "./VideoMedia";

type Props = {
  type: "IMAGE" | "FILE";
  uri: string;
};

const MessageMedia = ({ type, uri }: Props) => {
  const [visible, setVisible] = useState(false);

  // Khởi tạo VideoPlayer cho expo-video
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    // player.play(); // Bạn có thể tùy chỉnh tự động phát ở đây
  });

  const open = () => {
    setVisible(true);
    if (type !== "IMAGE") {
      player.play(); // Tự động phát khi mở modal
    }
  };

  const close = () => {
    player.pause(); // Dừng video khi đóng modal
    setVisible(false);
  };

  return (
    <>
      {type === "IMAGE" ? (
        <ImageMedia uri={uri} onPress={open} />
      ) : (
        <VideoMedia uri={uri} onPress={open} />
      )}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View style={styles.fullscreen}>
          <Pressable style={styles.closeBtn} onPress={close}>
            <X size={28} color="white" />
          </Pressable>

          {type === "IMAGE" ? (
            <Image
              source={{ uri }}
              style={styles.media}
              resizeMode="contain"
            />
          ) : (
            <VideoView
              player={player}
              style={styles.media}
              allowsFullscreen
              allowsPictureInPicture
            />
          )}
        </View>
      </Modal>
    </>
  );
};

export default MessageMedia;

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  media: { 
    width: "100%", 
    height: "100%" 
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 6,
  },
});