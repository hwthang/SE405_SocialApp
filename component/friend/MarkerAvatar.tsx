import { Colors } from "@/constant/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

type MarkerType = "friend_nearby" | "friend" | "nearby";

type Props = {
  avatar: string;
  onPress?: () => void;
  type?: MarkerType;
};

const SIZE = 36;
const BORDER_WIDTH = 3;

const MarkerAvatar = ({ avatar, onPress, type = "nearby" }: Props) => {
  // Chọn màu theo type
  let gradientColors: string[] = [
    Colors.gray[500],
    Colors.gray[200],
    Colors.gray[500],
    Colors.gray[200],
  ];

  if (type === "friend") {
    gradientColors = [
      Colors.blue[900],
      Colors.blue[700],
      Colors.purple[500], // highlight khác tông
      Colors.blue[500],
    ];
  }

  if (type === "friend_nearby") {
    gradientColors = [
      Colors.green[900],
      Colors.green[700],
      Colors.yellow[400], // highlight vàng
      Colors.green[500],
    ];
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Gradient border cố định */}
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      />

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
      </View>
    </TouchableOpacity>
  );
};

export default MarkerAvatar;

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },

  gradientBorder: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },

  avatarWrapper: {
    position: "absolute",
    top: BORDER_WIDTH,
    left: BORDER_WIDTH,
    width: SIZE - BORDER_WIDTH * 2,
    height: SIZE - BORDER_WIDTH * 2,
    borderRadius: (SIZE - BORDER_WIDTH * 2) / 2,
    overflow: "hidden",
    backgroundColor: Colors.background,
  },

  avatar: {
    width: "100%",
    height: "100%",
  },
});
