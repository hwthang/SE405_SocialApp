// components/message/MessageMedia/index.tsx
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

  const open = () => setVisible(true);
  const close = () => setVisible(false);

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
      >
        <View style={styles.fullscreen}>
          <Pressable style={styles.closeBtn} onPress={close}>
            <X size={28} color="white" />
          </Pressable>
          {
            type === "IMAGE" ? (
              <Image
                source={{ uri }}
                style={styles.media}
                resizeMode="contain"
              />
            ) : null /* VideoView có thể thêm sau */
          }
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
  media: { width: "100%", height: "100%" },
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
