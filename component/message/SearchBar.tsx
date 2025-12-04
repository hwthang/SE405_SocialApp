// import { Ionicons } from "@expo/vector-icons";
// import React from "react";
// import { TextInput, View } from "react-native";

// const SearchBar = ({ value, onChange }: any) => {
//   return (
//     <View
//       style={{
//         backgroundColor: "white",
//         paddingVertical: 10,
//         paddingHorizontal: 15,
//         borderBottomWidth: 1,
//         borderColor: "#eee",
//       }}
//     >
//       <View
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           backgroundColor: "#f1f1f1",
//           borderRadius: 20,
//           paddingHorizontal: 12,
//           height: 40,
//         }}
//       >
//         <Ionicons name="search" size={20} color="#888" />

//         <TextInput
//           placeholder="Tìm kiếm"
//           value={value}
//           onChangeText={onChange}
//           style={{
//             flex: 1,
//             marginLeft: 10,
//             fontSize: 16,
//           }}
//         />
//       </View>
//     </View>
//   );
// };

// export default SearchBar;

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, View } from "react-native";

const SearchBar = ({ value, onChange }: any) => {
  return (
    <View
      style={{
        backgroundColor: "white",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderColor: "#eee",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#f1f1f1",
          borderRadius: 20,
          paddingHorizontal: 12,
          height: 40,
        }}
      >
        <Ionicons name="search" size={20} color="#888" />

        <TextInput
          placeholder="Tìm kiếm"
          value={value}
          onChangeText={onChange}
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 16,
          }}
        />
      </View>
    </View>
  );
};

export default SearchBar;
