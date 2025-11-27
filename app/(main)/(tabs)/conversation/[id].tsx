// app/(main)/(tabs)/conversation/[id].tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

import ChatHeader from "../../../../component/message/ChatHeader";
import InputBar from "../../../../component/message/InputBar";
import MessageList from "../../../../component/message/MessageList";
import PinnedMessage from "../../../../component/message/PinnedMessage";

// Mock data
const mockMessages = [
  { id: "1", text: "hello", isMe: false },
  { id: "2", text: "chào", isMe: false },
  { id: "3", text: "Bạn ở đâu", isMe: true },
  { id: "4", text: "tại trường", isMe: false },
  { id: "5", text: "Ra r", isMe: true },
  { id: "6", text: "Ra đâu, đi hắn lên viae hè ấy", isMe: false },
];

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [message, setMessage] = useState("");
  const [list, setList] = useState(mockMessages);

  const pinned = "Hẹn tối nay 7h nhé"; 

  const handleSend = () => {
    if (!message.trim()) return;

    setList((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        text: message,
        isMe: true,
      },
    ]);

    setMessage("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      {/* Header */}
      <ChatHeader
        name="Tình iu tuyệt vời"
        avatar="https://i.pinimg.com/originals/25/6a/e4/256ae40f4af0b506f7f6ffdbb9a09a1e.jpg"
        onBack={() => router.back()}
      />

      {/* Pinned Message (optional) */}
      <PinnedMessage text={pinned} />

      {/* Message List */}
      <MessageList data={list} />

      {/* Input Bar */}
      <InputBar value={message} onChange={setMessage} onSend={handleSend} />
    </View>
  );
}
