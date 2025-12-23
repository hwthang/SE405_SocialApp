import { Avatars } from "@/public/img/avatar";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View
} from "react-native";
import MessageActions, { REACTIONS_MAP } from "./MessageActions";
import MessageMedia from "./MessageMedia";

const MAX_SWIPE = 30;

const MessageBubble = ({
  item,
  messages,
  myId,
  isActive,
  onOpen,
  onClose,
  onReact,
  onReply,
  onUnreact,
  onDelete,
}: any) => {
  const isMe = item.senderId === myId;
  const isText = item.type === "TEXT";

  // Tìm tin nhắn gốc nếu đây là một câu trả lời
  const quotedMessage = item.parentMessageId
    ? messages.find((m: any) => m.id === item.parentMessageId)
    : null;

  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
      onPanResponderMove: (_, g) => {
        translateX.setValue(
          Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, g.dx))
        );
      },
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) >= MAX_SWIPE) {
          isActive ? onClose() : onOpen();
        }
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={[styles.wrapper, !isMe && styles.row]}>
      {/* Avatar của đối phương */}
      {!isMe && (
        <Image
          source={
            item.senderAvatar
              ? { uri: item.senderAvatar }
              : Avatars.cat
          }
          style={styles.avatar}
        />
      )}

      <View style={{ flex: 1 }}>
        {/* Tên người gửi nếu không phải mình */}
        {!isMe && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.bubble,
            {
              transform: [{ translateX }],
              alignSelf: isMe ? "flex-end" : "flex-start",
              backgroundColor: isText
                ? isMe
                  ? "#3b82f6"
                  : "#F2F3F5"
                : "transparent",
            },
          ]}
        >
          {/* PHẦN HIỂN THỊ REPLY (QUOTED MESSAGE) CẬP NHẬT MỚI */}
          {quotedMessage && (
            <View
              style={[
                styles.quoteContainer,
                { 
                    backgroundColor: isMe ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.06)",
                    borderLeftColor: isMe ? "#FFF" : "#3b82f6" 
                },
              ]}
            >
              <View style={styles.quoteContent}>
                <Text style={[styles.quoteUser, { color: isMe ? "#BFDBFE" : "#3b82f6" }]}>
                   {quotedMessage.senderId === myId ? "Bạn" : quotedMessage.senderName}
                </Text>
                <Text 
                    style={[styles.quoteText, { color: isMe ? "#E0E7FF" : "#4B5563" }]} 
                    numberOfLines={2}
                >
                  {quotedMessage.content}
                </Text>
              </View>
            </View>
          )}

          {/* Nội dung tin nhắn chính */}
          {isText && (
            <Text style={[styles.messageText, { color: isMe ? "#fff" : "#1C1E21" }]}>
              {item.content}
            </Text>
          )}

          {/* Hiển thị Media (Ảnh/Video) */}
          {item.mediaUrl && (
            <MessageMedia type={item.type} uri={item.mediaUrl} />
          )}

          {/* Hiển thị Reaction */}
          {item.myReaction && (
            <View style={styles.reaction}>
              <Text style={{ fontSize: 13 }}>{REACTIONS_MAP[item.myReaction]}</Text>
            </View>
          )}
        </Animated.View>

        {/* Action Bar (Thả cảm xúc, Trả lời, Xóa) */}
        {isActive && (
          <View style={{ marginTop: 6 }}>
            <MessageActions
              isMe={isMe}
              hasReacted={!!item.myReaction}
              onReact={(e: string) => onReact(item.id, e)}
              onReply={() => onReply(item)}
              onUnreact={() => onUnreact(item.id)}
              onDelete={() => onDelete(item.id)}
              onClose={onClose}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default React.memo(MessageBubble);

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
    flexDirection: "row",
    paddingHorizontal: 0,
  },
  row: {
    alignItems: "flex-end", // Avatar thẳng hàng với tin nhắn cuối
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 2,
  },
  senderName: {
    fontSize: 11,
    color: "#8E8E93",
    marginBottom: 2,
    marginLeft: 12,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "82%",
    position: "relative",
  },
  // STYLE QUOTE (REPLY) CẬP NHẬT
  quoteContainer: {
    borderLeftWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  quoteContent: {
    flexDirection: "column",
  },
  quoteUser: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  reaction: {
    position: "absolute",
    bottom: -10,
    right: -4,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    // Shadow cho reaction nổi lên
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
});