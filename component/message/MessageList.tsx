import React from "react";
import { FlatList, View } from "react-native";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages }: any) => {
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingVertical: 10,
          paddingBottom: 90,
        }}
        renderItem={({ item }) => (
          <MessageBubble message={item.text} isMe={item.isMe} />
        )}
      />
    </View>
  );
};

export default MessageList;
