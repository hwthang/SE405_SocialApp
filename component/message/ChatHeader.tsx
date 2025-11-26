import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";

const ChatHeader = ({ name, avatar, onBack }: any) => {
  const paddingTop = Platform.OS === "android" ? StatusBar.currentHeight : 20;

  return (
    <View
      style={{
        height: 90,
        paddingTop,
        paddingBottom: 10,
        paddingHorizontal: 15,
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="chevron-back" size={26} />
      </TouchableOpacity>

      <Image
        source={{ uri: avatar }}
        style={{ width: 45, height: 45, borderRadius: 40 }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 17, fontWeight: "bold" }}>{name}</Text>
        <Text style={{ fontSize: 13, color: "#666" }}>Đang hoạt động</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 20 }}>
        <Ionicons name="call-outline" size={24} />
        <Ionicons name="videocam-outline" size={24} />
      </View>
    </View>
  );
};

export default ChatHeader;
