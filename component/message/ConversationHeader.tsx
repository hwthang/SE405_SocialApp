import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";

const ConversationHeader = () => {
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
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>messenger</Text>

      <View style={{ flexDirection: "row", gap: 20 }}>
        <TouchableOpacity>
          <Ionicons name="camera-outline" size={26} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="logo-facebook" size={26} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConversationHeader;
