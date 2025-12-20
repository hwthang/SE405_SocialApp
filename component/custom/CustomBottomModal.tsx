import React from "react";
import {
  Platform,
  StyleSheet,
  View
} from "react-native";
import Modal from "react-native-modal";

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
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.4}
      style={styles.modal}
      useNativeDriver
      hideModalContentWhileAnimating
      statusBarTranslucent
    >
      {/* BOTTOM MODAL */}
      <View style={[styles.container, { height }]}>
        {/* Drag indicator */}
        <View style={styles.dragIndicator} />

        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0, // ❗ bắt buộc để modal sát đáy
  },

  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",

    ...(Platform.OS === "android" && {
      elevation: 8,
    }),
  },

  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginVertical: 10,
  },
});
