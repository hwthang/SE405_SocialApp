import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  id: string;
  message?: string;
  image?: string;
  audio?: string;
  isMe?: boolean;
  avatar?: string;
  replyTo?: string;
  onDelete?: () => void;
  onReply?: (msg: string) => void;
  reaction?: string;
  onReact?: (emoji: string) => void;
  seen?: boolean;
};

const MessageBubble = ({
  message,
  image,
  audio,
  isMe,
  avatar,
  replyTo,
  onDelete,
  onReply,
  reaction,
  onReact,
  seen,
}: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const removeAnim = useRef(new Animated.Value(1)).current;

  const [showReactions, setShowReactions] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ==================== ANIMATION ====================
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const triggerDelete = () => {
    Animated.timing(removeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => onDelete?.());
  };

  // SWIPE TO REPLY
  const panX = useRef(new Animated.Value(0)).current;

  const responder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
    onPanResponderMove: (_, g) => {
      if (!isMe && g.dx > 0) panX.setValue(g.dx);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx > 80) onReply?.(message || image || audio || "");
      Animated.spring(panX, { toValue: 0, useNativeDriver: true }).start();
    },
  });

  // ==================== VOICE PLAYER ====================
  const playAudio = async () => {
    if (isPlaying) {
      await sound?.pauseAsync();
      setIsPlaying(false);
      return;
    }
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audio! });
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && !s.isPlaying) {
          setIsPlaying(false);
        }
      });
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  // ==================== UI ====================
  return (
    <Pressable onPress={() => setShowReactions(false)}>
      <Animated.View style={{ opacity: removeAnim, transform: [{ scale: removeAnim }] }}>
        <Animated.View
          {...responder.panHandlers}
          style={{
            width: "100%",
            alignItems: isMe ? "flex-end" : "flex-start",
            marginBottom: 12,
            transform: [{ translateX: panX }],
          }}
        >
          {/* Avatar */}
          {!isMe && (
            <Image
              source={{ uri: avatar }}
              style={{ width: 30, height: 30, borderRadius: 50, marginLeft: 5, marginBottom: 5 }}
            />
          )}

          <TouchableOpacity activeOpacity={0.8} onLongPress={() => setShowReactions(true)}>
            <Animated.View
              style={{
                maxWidth: "75%",
                paddingHorizontal: 12,
                paddingVertical: replyTo ? 6 : 8,
                borderRadius: 18,
                backgroundColor: isMe ? "#ff4f9a" : "#f0f0f0",
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }}
            >
              {/* Reply preview */}
              {replyTo && (
                <View
                  style={{
                    borderLeftWidth: 3,
                    borderLeftColor: isMe ? "white" : "#ff4f9a",
                    paddingLeft: 8,
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#666" }} numberOfLines={1}>
                    {replyTo}
                  </Text>
                </View>
              )}

              {/* IMAGE MESSAGE */}
              {image && (
                <Image
                  source={{ uri: image }}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 12,
                    backgroundColor: "#ddd",
                    marginBottom: message ? 8 : 0,
                  }}
                />
              )}

              {/* AUDIO MESSAGE */}
{audio && (
  <TouchableOpacity
    onPress={playAudio}
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: isMe ? "rgba(255,255,255,0.25)" : "#eaeaea",
      borderRadius: 14,
      marginVertical: 4,
    }}
  >
    {/* Icon play/pause */}
    <View
      style={{
        width: 34,
        height: 34,
        borderRadius: 34,
        backgroundColor: isMe ? "white" : "#ccc",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
      }}
    >
      <Text style={{ fontSize: 18, color: isMe ? "#ff4f9a" : "#444" }}>
        {isPlaying ? "⏸️" : "▶️"}
      </Text>
    </View>

    {/* Text + wave placeholder */}
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: isMe ? "white" : "#222",
          fontSize: 14,
          marginBottom: 3,
        }}
      >
        Voice message
      </Text>

      {/* audio bar fake */}
      <View
        style={{
          height: 4,
          width: "100%",
          backgroundColor: isMe ? "rgba(255,255,255,0.5)" : "#ccc",
          borderRadius: 10,
        }}
      />
    </View>

    {/* duration icon */}
    <Text
      style={{
        fontSize: 12,
        color: isMe ? "white" : "#444",
        marginLeft: 8,
      }}
    >
      0:10
    </Text>
  </TouchableOpacity>
)}


              {/* TEXT MESSAGE */}
              {message && (
                <Text style={{ color: isMe ? "white" : "#222", fontSize: 15 }}>{message}</Text>
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* Reaction Under */}
          {reaction && (
            <Text style={{ marginTop: 4, fontSize: 18, marginLeft: 4 }}>{reaction}</Text>
          )}

          {/* Seen */}
          {isMe && seen && (
            <Text style={{ fontSize: 11, color: "#888", marginTop: 3 }}>Đã xem</Text>
          )}

          {/* Reaction Popup */}
          {showReactions && (
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "white",
                padding: 6,
                borderRadius: 25,
                elevation: 5,
                marginTop: 6,
              }}
            >
              {["❤️", "😆", "😢", "👍", "🔥", "💔"].map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => {
                    onReact?.(e);
                    setShowReactions(false);
                  }}
                >
                  <Text style={{ fontSize: 22, marginHorizontal: 4 }}>{e}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity onPress={triggerDelete} style={{ marginLeft: 8 }}>
                <Text style={{ fontSize: 19, color: "red" }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

export default MessageBubble;
