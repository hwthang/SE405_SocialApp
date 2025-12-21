import React, { useRef } from "react";
import {
  Animated,
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

  const quotedMessage = item.parentMessageId
    ? messages.find((m: any) => m.id === item.parentMessageId)
    : null;

  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5,
      onPanResponderMove: (_, g) => {
        let dx = g.dx;
        if (Math.abs(dx) > MAX_SWIPE) {
          dx = dx > 0 ? MAX_SWIPE : -MAX_SWIPE;
        }
        translateX.setValue(dx);
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
    <View
      style={[
        styles.wrapper,
        { alignItems: isMe ? "flex-end" : "flex-start" },
      ]}
    >
      {/* CONTAINER CHUNG */}
      <View
        style={[
          styles.container,
          { alignItems: isMe ? "flex-end" : "flex-start" },
        ]}
      >
        {/* MESSAGE */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.bubble,
            {
              transform: [{ translateX }],
              backgroundColor: isText
                ? isMe
                  ? "#3b82f6"
                  : "#e5e7eb"
                : "transparent",
              padding: isText ? 12 : 0,
            },
          ]}
        >
          {/* QUOTE */}
          {quotedMessage && (
            <View
              style={[
                styles.quoteContainer,
                {
                  backgroundColor: isMe
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.05)",
                  borderLeftColor: isMe ? "#fff" : "#3b82f6",
                },
              ]}
            >
              <Text
                style={[
                  styles.quoteName,
                  { color: isMe ? "#fff" : "#3b82f6" },
                ]}
              >
                {quotedMessage.senderId === myId ? "Bạn" : "Người kia"}
              </Text>
              <Text
                style={[
                  styles.quoteText,
                  { color: isMe ? "#eee" : "#666" },
                ]}
                numberOfLines={1}
              >
                {quotedMessage.content || "[Phương tiện]"}
              </Text>
            </View>
          )}

          {/* CONTENT */}
          {isText && (
            <Text style={{ color: isMe ? "#fff" : "#000", fontSize: 16 }}>
              {item.content}
            </Text>
          )}

          {item.mediaUrl && (
            <MessageMedia type={item.type} uri={item.mediaUrl} />
          )}

          {/* REACTION BADGE */}
          {item.myReaction && (
            <View
              style={[
                styles.reactionBadge,
                isMe ? { left: -6 } : { right: -6 },
              ]}
            >
              <Text style={{ fontSize: 13 }}>
                {REACTIONS_MAP[item.myReaction]}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ACTIONS – LUÔN Ở DƯỚI */}
        {isActive && (
          <View
            style={[
              styles.actionWrapper,
              { alignItems: isMe ? "flex-end" : "flex-start" },
            ]}
          >
            <MessageActions
              isMe={isMe}
              hasReacted={!!item.myReaction}
              onReact={(emoji: string) => onReact(item.id, emoji)}
              onReply={() => onReply(item)}
              onUnreact={onUnreact}
              onDelete={onDelete}
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
    marginVertical: 6,
    marginHorizontal: 12,
    width: "100%",
  },

  container: {
    width: "100%",
    flexDirection: "column",
  },

  bubble: {
    borderRadius: 20,
    maxWidth: "100%", // 🔥 FULL WIDTH
  },

  actionWrapper: {
    marginTop: 6,
    width: "100%",
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
    paddingHorizontal: 4,
    paddingVertical: 2,
    elevation: 3,
  },
});
