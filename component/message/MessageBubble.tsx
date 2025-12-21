import { Avatars } from "@/public/img/avatar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
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

  useEffect(()=>{console.log(item?.senderName)},[item.senderName])

  return (
    <View style={[styles.wrapper, !isMe && styles.row]}>
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
                  : "#e5e7eb"
                : "transparent",
            },
          ]}
        >
          {quotedMessage && (
            <View style={styles.quote}>
              <Text style={styles.quoteText} numberOfLines={1}>
                {quotedMessage.content}
              </Text>
            </View>
          )}

          {isText && (
            <Text style={{ color: isMe ? "#fff" : "#000" }}>
              {item.content}
            </Text>
          )}

          {item.mediaUrl && (
            <MessageMedia type={item.type} uri={item.mediaUrl} />
          )}

          {item.myReaction && (
            <View style={styles.reaction}>
              <Text>{REACTIONS_MAP[item.myReaction]}</Text>
            </View>
          )}
        </Animated.View>

        {isActive && (
          <View style={{ marginTop: 6 }}>
            <MessageActions
              isMe={isMe}
              hasReacted={!!item.myReaction}
              onReact={(e: string) => onReact(item.id, e)}
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
    flexDirection: "row",
  },
  row: {
    alignItems: "flex-start",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  senderName: {
    fontSize: 12,
    color: "#555",
    marginBottom: 2,
  },
  bubble: {
    borderRadius: 18,
    padding: 12,
    maxWidth: "85%",
  },
  quote: {
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
    paddingLeft: 6,
    marginBottom: 6,
  },
  quoteText: {
    fontSize: 12,
    color: "#666",
  },
  reaction: {
    position: "absolute",
    bottom: -10,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 4,
  },
});
