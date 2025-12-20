// import React from "react";
// import { Image, Text, TouchableOpacity, View } from "react-native";

// type Props = {
//   avatar: string;
//   name: string;
//   lastMessage: string;
//   time: string;
//   unread?: boolean;
//   onPress?: () => void;
// };

// const ConversationItem = ({ avatar, name, lastMessage, time, unread, onPress }: Props) => {
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       style={{
//         flexDirection: "row",
//         alignItems: "center",
//         paddingVertical: 12,
//         paddingHorizontal: 15,
//       }}
//     >
//       <Image
//         source={{ uri: avatar }}
//         style={{ width: 55, height: 55, borderRadius: 50 }}
//       />

//       <View style={{ flex: 1, marginLeft: 12 }}>
//         <Text style={{ fontSize: 16, fontWeight: "bold" }}>{name}</Text>
//         <Text style={{ color: unread ? "black" : "#666" }} numberOfLines={1}>
//           {lastMessage}
//         </Text>
//       </View>

//       <Text style={{ color: "#555", marginLeft: 10 }}>{time}</Text>
//     </TouchableOpacity>
//   );
// };

// export default ConversationItem;

import { Avatars } from "@/public/img/avatar";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const ConversationItem = ({
  avatar,
  name,
  lastMessage,
  time,
  unread = false,
  typing = false,
  online = false,
  onPress,
}: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
      }}
    >
      <View>
        <Image
          source={avatar ? { uri: avatar } : Avatars.cat}
          style={{ width: 55, height: 55, borderRadius: 50 }}
        />

        {online && (
          <View
            style={{
              width: 12,
              height: 12,
              backgroundColor: "#4CAF50",
              borderRadius: 10,
              position: "absolute",
              bottom: 5,
              right: 5,
              borderWidth: 2,
              borderColor: "white",
            }}
          />
        )}
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: unread ? "bold" : "600" }}>
          {name}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: unread ? "black" : "#666",
            fontStyle: typing ? "italic" : "normal",
          }}
        >
          {typing ? "Đang nhập..." : lastMessage}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: "#666", fontSize: 12 }}>{time}</Text>

        {unread && (
          <View
            style={{
              backgroundColor: "#ff4f9a",
              width: 20,
              height: 20,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 5,
            }}
          >
            <Text style={{ color: "white", fontSize: 12 }}>1</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ConversationItem;
