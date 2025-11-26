// app/(main)/(tabs)/conversation/[id].tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, View } from "react-native";

import ChatHeader from "../../../../component/message/ChatHeader";
import InputBar from "../../../../component/message/InputBar";
import MessageBubble from "../../../../component/message/MessageBubble";

const mockMessages = [
  { id: "1", text: "Sao e", isMe: false },
  { id: "2", text: "Ra đi", isMe: false },
  { id: "3", text: "Qua đi", isMe: true },
  { id: "4", text: "A ở trc cổng chứ đâu âm qua", isMe: false },
  { id: "5", text: "Ra r", isMe: true },
  { id: "6", text: "Ra đâu, đi hắn lên viae hè ấy", isMe: false },
];

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // tin nhắn user nhập
  const [message, setMessage] = useState("");
  const [list, setList] = useState(mockMessages);

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
      <ChatHeader
        name="Tình iu tuyệt vời"
        avatar="https://i.pinimg.com/originals/25/6a/e4/256ae40f4af0b506f7f6ffdbb9a09a1e.jpg"
        onBack={() => router.back()}
      />

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 15,
          paddingBottom: 80,
        }}
        renderItem={({ item }) => (
          <MessageBubble message={item.text} isMe={item.isMe} />
        )}
      />

      <InputBar
        value={message}
        onChange={setMessage}
        onSend={handleSend}
      />
    </View>
  );
}
