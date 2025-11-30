// import { Ionicons } from "@expo/vector-icons";
// import React from "react";
// import { Image, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";

// const ChatHeader = ({ name, avatar, onBack }: any) => {
//   const paddingTop = Platform.OS === "android" ? StatusBar.currentHeight : 20;

//   return (
//     <View
//       style={{
//         height: 90,
//         paddingTop,
//         paddingBottom: 10,
//         paddingHorizontal: 15,
//         backgroundColor: "white",
//         flexDirection: "row",
//         alignItems: "center",
//         gap: 15,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 4,
//       }}
//     >
//       <TouchableOpacity onPress={onBack}>
//         <Ionicons name="chevron-back" size={26} />
//       </TouchableOpacity>

//       <Image
//         source={{ uri: avatar }}
//         style={{ width: 45, height: 45, borderRadius: 40 }}
//       />

//       <View style={{ flex: 1 }}>
//         <Text style={{ fontSize: 17, fontWeight: "bold" }}>{name}</Text>
//         <Text style={{ fontSize: 13, color: "#666" }}>Đang hoạt động</Text>
//       </View>

//       <View style={{ flexDirection: "row", gap: 20 }}>
//         <Ionicons name="call-outline" size={24} />
//         <Ionicons name="videocam-outline" size={24} />
//       </View>
//     </View>
//   );
// };

// export default ChatHeader;

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";

const ChatHeader = ({ name, avatar, onBack, status = "online" }: any) => {
  const paddingTop = Platform.OS === "android" ? StatusBar.currentHeight : 20;

  const getStatusText = () => {
    if (status === "typing") return "Đang nhập...";
    if (status === "online") return "Đang hoạt động";
    return `Hoạt động ${status}`; // ex: 10 phút trước
  };

  return (
    <View
      style={{
        height: 90,
        paddingTop,
        paddingBottom: 10,
        paddingHorizontal: 15,
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        borderBottomWidth: 1,
        borderColor: "#eee",
      }}
    >
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="chevron-back" size={28} />
      </TouchableOpacity>

      <View>
        <Image
          source={{ uri: avatar }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 40,
            borderWidth: status === "online" ? 2 : 0,
            borderColor: "#4CAF50",
          }}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 17, fontWeight: "bold" }}>{name}</Text>
        <Text style={{ fontSize: 13, color: "#666" }}>{getStatusText()}</Text>
      </View>

      <TouchableOpacity>
        <Ionicons name="call-outline" size={25} />
      </TouchableOpacity>

      <TouchableOpacity>
        <Ionicons name="videocam-outline" size={25} />
      </TouchableOpacity>
    </View>
  );
};

export default ChatHeader;
