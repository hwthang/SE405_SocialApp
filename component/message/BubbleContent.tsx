// components/message/MessageBubble/BubbleContent.tsx
import React from "react";
import { Text } from "react-native";
import MessageMedia from "./MessageMedia";


type Props = {
  message: any;
  isMe: boolean;
};

const BubbleContent = ({ message, isMe }: Props) => {
  if (message.type === "TEXT") {
    return <Text style={{ color: isMe ? "#fff" : "#000" }}>{message.content}</Text>;
  }

  return <MessageMedia type={message.type} uri={message.mediaUrl} />;
};

export default BubbleContent;
