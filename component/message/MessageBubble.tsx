import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import React, { useEffect, useRef } from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";
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
  onUnreact, // <--- Nhận prop mới
  onDelete   // <--- Nhận prop mới
}: any) => {
  const isMe = item.senderId === myId;
  const isText = item.type === "TEXT";

  // 🚀 Tìm tin nhắn gốc dựa trên ID đã map từ replyToMessageId
  const quotedMessage = item.parentMessageId
    ? messages.find((m: any) => m.id === item.parentMessageId)
    : null;

  // Animation logic
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
      onPanResponderMove: (_, g) => {
        let dx = g.dx;
        // Giới hạn khoảng cách kéo
        if (Math.abs(dx) > MAX_SWIPE) dx = dx > 0 ? MAX_SWIPE : -MAX_SWIPE;
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_, g) => {
        // Nếu kéo đủ xa thì mở/đóng menu
        if (Math.abs(g.dx) >= MAX_SWIPE) {
          isActive ? onClose() : onOpen();
        }
        // Trượt bubble về vị trí cũ
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const handleDelete = async () => {
    const token = await AuthHelper.getInstance().getAccessToken();

    const res = await fetch(
      `${Api.getInstance().baseUrl}/messages/${item.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
  };

  useEffect(() => {
    console.log();
  }, []);
  return (
    <View
      style={[
        styles.wrapper,
        {
          alignSelf: isMe ? "flex-end" : "flex-start",
          // Đảm bảo tin nhắn đang mở menu phải nằm trên cùng
          zIndex: isActive ? 999 : 1,
          elevation: isActive ? 10 : 0,
        },
      ]}
    >
      <View style={styles.widthHolder}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.bubble,
            {
              transform: [{ translateX }],
              backgroundColor: isText
                ? isMe
                  ? "#3b82f6" // Màu xanh tin nhắn của mình
                  : "#e5e7eb" // Màu xám tin nhắn người khác
                : "transparent",
              padding: isText ? 12 : 0,
            },
          ]}
        >
          {/* 1. HIỂN THỊ TIN NHẮN ĐƯỢC TRẢ LỜI (QUOTE) */}
          {quotedMessage && (
            <View
              style={[
                styles.quoteContainer,
                {
                  backgroundColor: isMe
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.05)",
                  borderLeftColor: isMe ? "#fff" : "#3b82f6",
                },
              ]}
            >
              <Text
                style={[styles.quoteName, { color: isMe ? "#fff" : "#3b82f6" }]}
              >
                {quotedMessage.senderId === myId ? "Bạn" : "Người kia"}
              </Text>
              <Text
                style={[styles.quoteText, { color: isMe ? "#eee" : "#666" }]}
                numberOfLines={1}
              >
                {quotedMessage.content || "[Phương tiện]"}
              </Text>
            </View>
          )}

          {/* 2. NỘI DUNG TIN NHẮN CHÍNH */}
          {isText && (
            <Text style={{ color: isMe ? "#fff" : "#000", fontSize: 16 }}>
              {item.content}
            </Text>
          )}

          {item.mediaUrl && (
            <MessageMedia type={item.type} uri={item.mediaUrl} />
          )}

          {/* 3. HIỂN THỊ REACTION BADGE */}
          {item.myReaction && (
            <View
              style={[
                styles.reactionBadge,
                isMe ? { left: -4 } : { right: -4 },
              ]}
            >
              <Text style={{ fontSize: 13 }}>
                {REACTIONS_MAP[item.myReaction] || item.myReaction}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* 4. MENU HÀNH ĐỘNG (REACTIONS & REPLY) */}
        {isActive && (
    <View style={[styles.actionsContainer, isMe ? { right: 0 } : { left: 0 }]}>
      <MessageActions
        isMe={isMe}
        hasReacted={!!item.myReaction}
        onReact={(emoji: string) => onReact(item.id, emoji)}
        onReply={() => onReply(item)}
        onUnreact={onUnreact} // <--- Gán vào đây
        onDelete={onDelete}   // <--- Gán vào đây
      />
    </View>
  )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16, // Khoảng cách giữa các tin nhắn
    marginHorizontal: 12,
  },
  widthHolder: {
    maxWidth: "80%",
    position: "relative",
  },
  bubble: {
    borderRadius: 20,
    zIndex: 2,
    // Tránh bị cắt mất Reaction Badge
  },
  quoteContainer: {
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 6,
  },
  quoteName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  quoteText: {
    fontSize: 13,
  },
  reactionBadge: {
    position: "absolute",
    bottom: -10,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    // Đổ bóng cho badge
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionsContainer: {
    position: "absolute",
    top: "105%", // Hiển thị dưới tin nhắn
    zIndex: 1000,
    minWidth: 280,
  },
});

export default React.memo(MessageBubble);
