import React, { useEffect, useRef } from "react";
import { FlatList, Text, View } from "react-native";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages, onDelete, onReply, onReact, typing }: any) => {
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => {
      flatRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, [messages, typing]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingTop: 10,
          paddingBottom: 100,
        }}
        renderItem={({ item, index }) => (
          <MessageBubble
            id={item.id}
            message={item.text}
            isMe={item.isMe}
            avatar={item.avatar}
            replyTo={item.replyTo}
            onDelete={() => onDelete(item.id)}
            onReply={() => onReply(item)}
            reaction={item.reaction}
            onReact={(emoji) => onReact(item.id, emoji)}
            seen={item.isMe && index === messages.length - 1}
          />
        )}
      />

      {/* Typing indicator */}
      {typing && (
        <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
          <View
            style={{
              backgroundColor: "#eee",
              padding: 10,
              borderRadius: 20,
              width: 80,
            }}
          >
            <Text style={{ color: "#444" }}>Đang nhập...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default MessageList;
