import React from "react";
import { Text, View } from "react-native";

type Props = {
  message: string;
  isMe?: boolean;
};

const MessageBubble = ({ message, isMe }: Props) => {
  return (
    <View
      style={{
        width: "100%",
        alignItems: isMe ? "flex-end" : "flex-start",
        marginBottom: 8,
      }}
    >
      <View
        style={{
          maxWidth: "75%",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 16,
          backgroundColor: isMe ? "#ff4f9a" : "#eee",
        }}
      >
        <Text style={{ color: isMe ? "white" : "#222" }}>{message}</Text>
      </View>
    </View>
  );
};

export default MessageBubble;
