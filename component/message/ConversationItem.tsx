import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  avatar: string;
  name: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
  onPress?: () => void;
};

const ConversationItem = ({ avatar, name, lastMessage, time, unread, onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
      }}
    >
      <Image
        source={{ uri: avatar }}
        style={{ width: 55, height: 55, borderRadius: 50 }}
      />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>{name}</Text>
        <Text style={{ color: unread ? "black" : "#666" }} numberOfLines={1}>
          {lastMessage}
        </Text>
      </View>

      <Text style={{ color: "#555", marginLeft: 10 }}>{time}</Text>
    </TouchableOpacity>
  );
};

export default ConversationItem;
