// import React from "react";
// import { Text, View } from "react-native";

// type Props = {
//   message: string;
//   isMe?: boolean;
// };

// const MessageBubble = ({ message, isMe }: Props) => {
//   return (
//     <View
//       style={{
//         width: "100%",
//         alignItems: isMe ? "flex-end" : "flex-start",
//         marginBottom: 8,
//       }}
//     >
//       <View
//         style={{
//           maxWidth: "75%",
//           paddingHorizontal: 12,
//           paddingVertical: 8,
//           borderRadius: 16,
//           backgroundColor: isMe ? "#ff4f9a" : "#eee",
//         }}
//       >
//         <Text style={{ color: isMe ? "white" : "#222" }}>{message}</Text>
//       </View>
//     </View>
//   );
// };

// export default MessageBubble;


// import React, { useEffect, useRef, useState } from "react";
// import {
//   Animated,
//   PanResponder,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// type Props = {
//   message: string;
//   isMe?: boolean;
//   onDelete?: () => void;
//   onReply?: (msg: string) => void;
//   reaction?: string;
//   onReact?: (emoji: string) => void;
//   seen?: boolean;
// };

// const MessageBubble = ({
//   message,
//   isMe,
//   onDelete,
//   onReply,
//   reaction,
//   onReact,
//   seen,
// }: Props) => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(0.85)).current;
//   const removeAnim = useRef(new Animated.Value(1)).current;

//   const [showReactions, setShowReactions] = useState(false);

//   //  Animation xuất hiện
//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 160,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 6,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   //  Animation xóa tin nhắn
//   const triggerDelete = () => {
//     Animated.timing(removeAnim, {
//       toValue: 0,
//       duration: 180,
//       useNativeDriver: true,
//     }).start(() => onDelete && onDelete());
//   };

//   //  Swipe để reply
//   const panX = useRef(new Animated.Value(0)).current;

//   const panResponder = PanResponder.create({
//     onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
//     onPanResponderMove: (_, g) => {
//       if (!isMe && g.dx > 0) {
//         panX.setValue(g.dx);
//       }
//     },
//     onPanResponderRelease: (_, g) => {
//       if (g.dx > 80 && onReply) onReply(message);

//       Animated.spring(panX, {
//         toValue: 0,
//         useNativeDriver: true,
//       }).start();
//     },
//   });

//   return (
//     <Animated.View
//       style={{
//         opacity: removeAnim,
//         transform: [{ scale: removeAnim }],
//       }}
//     >
//       <Animated.View
//         {...panResponder.panHandlers}
//         style={{
//           width: "100%",
//           alignItems: isMe ? "flex-end" : "flex-start",
//           marginBottom: 10,
//           transform: [{ translateX: panX }],
//         }}
//       >
//         <TouchableOpacity
//           activeOpacity={0.8}
//           onLongPress={() => setShowReactions(true)}
//         >
//           <Animated.View
//             style={{
//               maxWidth: "75%",
//               paddingHorizontal: 12,
//               paddingVertical: 8,
//               borderRadius: 16,
//               backgroundColor: isMe ? "#ff4f9a" : "#eee",
//               opacity: fadeAnim,
//               transform: [{ scale: scaleAnim }],
//             }}
//           >
//             <Text style={{ color: isMe ? "white" : "#222" }}>{message}</Text>
//           </Animated.View>
//         </TouchableOpacity>

//         {/* Emoji Reaction Bubble */}
//         {reaction && (
//           <Text style={{ marginTop: 4, fontSize: 18 }}>
//             {reaction}
//           </Text>
//         )}

//         {/* Seen status */}
//         {isMe && seen && (
//           <Text style={{ fontSize: 11, color: "#888", marginTop: 3 }}>
//             Đã xem
//           </Text>
//         )}

//         {/* Popup chọn reaction */}
//         {showReactions && (
//           <View
//             style={{
//               flexDirection: "row",
//               backgroundColor: "white",
//               padding: 6,
//               borderRadius: 20,
//               elevation: 4,
//               marginTop: 4,
//             }}
//           >
//             {["❤️", "😆", "😢", "👍", "🔥"].map((e) => (
//               <TouchableOpacity
//                 key={e}
//                 onPress={() => {
//                   onReact && onReact(e);
//                   setShowReactions(false);
//                 }}
//               >
//                 <Text style={{ fontSize: 22, marginHorizontal: 4 }}>{e}</Text>
//               </TouchableOpacity>
//             ))}
//             {/* Delete */}
//             <TouchableOpacity
//               onPress={triggerDelete}
//               style={{ marginLeft: 8 }}
//             >
//               <Text style={{ fontSize: 18, color: "red" }}>🗑️</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </Animated.View>
//     </Animated.View>
//   );
// };

// export default MessageBubble;

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  id: string;
  message: string;
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

  // Swipe Reply
  const panX = useRef(new Animated.Value(0)).current;

  const responder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
    onPanResponderMove: (_, g) => {
      if (!isMe && g.dx > 0) panX.setValue(g.dx);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx > 80) onReply?.(message);

      Animated.spring(panX, { toValue: 0, useNativeDriver: true }).start();
    },
  });

  return (
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
        {/* Avatar (chỉ người khác) */}
        {!isMe && (
          <Image
            source={{ uri: avatar }}
            style={{ width: 30, height: 30, borderRadius: 50, marginLeft: 5, marginBottom: 3 }}
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

            <Text style={{ color: isMe ? "white" : "#222" }}>{message}</Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Reaction icon dưới bubble */}
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
              <Text style={{ fontSize: 18, color: "red" }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

export default MessageBubble;
