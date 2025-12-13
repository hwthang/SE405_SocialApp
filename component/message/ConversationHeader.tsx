import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";

const ConversationHeader = ({ userAvatar }: any) => {
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
        borderBottomWidth: 1,
        borderColor: "#eee",
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>Chats</Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
        <TouchableOpacity>
          <Ionicons name="camera-outline" size={26} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="add-circle-outline" size={28} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Image
            source={{ uri: userAvatar }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 20,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConversationHeader;
