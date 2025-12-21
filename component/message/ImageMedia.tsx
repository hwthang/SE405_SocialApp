// components/message/MessageMedia/ImageMedia.tsx
import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";

type Props = {
  uri: string;
  onPress?: () => void;
};

const MAX_WIDTH = 220;
const MAX_HEIGHT = 260;

const ImageMedia = ({ uri, onPress }: Props) => (
  <Pressable onPress={onPress}>
    <Image source={{ uri }} style={styles.image} resizeMode="cover" />
  </Pressable>
);

export default ImageMedia;

const styles = StyleSheet.create({
  image: { width: MAX_WIDTH, height: MAX_HEIGHT, borderRadius: 12 },
});
