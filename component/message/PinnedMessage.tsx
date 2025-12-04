// import { Ionicons } from "@expo/vector-icons";
// import React from "react";
// import { Text, View } from "react-native";

// const PinnedMessage = ({ text }: any) => {
//   return (
//     <View
//       style={{
//         backgroundColor: "#fff8d6",
//         paddingHorizontal: 15,
//         paddingVertical: 8,
//         borderBottomWidth: 1,
//         borderColor: "#eee",
//         flexDirection: "row",
//         alignItems: "center",
//         gap: 8,
//       }}
//     >
//       <Ionicons name="pin" size={18} color="#d4a300" />

//       <Text
//         numberOfLines={1}
//         style={{ flex: 1, color: "#8a6d00", fontSize: 14 }}
//       >
//         {text}
//       </Text>
//     </View>
//   );
// };

// export default PinnedMessage;

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const PinnedMessage = ({ text }: any) => {
  if (!text) return null;

  return (
    <View
      style={{
        backgroundColor: "#fff8d6",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: "#eee",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Ionicons name="pin" size={18} color="#d4a300" />

      <Text numberOfLines={1} style={{ flex: 1, color: "#8a6d00", fontSize: 14 }}>
        {text}
      </Text>
    </View>
  );
};

export default PinnedMessage;
