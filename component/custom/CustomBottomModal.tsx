import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  height?: number;
  children: React.ReactNode;
};

export const CustomBottomModal = ({
  visible,
  onClose,
  height = 420,
  children,
}: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* BACKDROP */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* BOTTOM MODAL */}
      <View style={styles.wrapper}>
        <View style={[styles.container, { height }]}>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  wrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },

  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",

    // ❗ RẤT QUAN TRỌNG
    // KHÔNG flex:1
    // height được truyền từ props
    ...(Platform.OS === "android" && {
      elevation: 8,
    }),
  },
});
