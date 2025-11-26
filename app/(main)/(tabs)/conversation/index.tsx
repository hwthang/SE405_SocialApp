// import React from 'react'
// import { Text, View } from 'react-native'

// const ConversationScreen = () => {
//   return (
//     <View>
//       <Text>ConversationScreen</Text>
//     </View>
//   )
// }

// export default ConversationScreen

// app/(main)/(tabs)/conversation/index.tsx

import { useRouter } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";
import ConversationHeader from "../../../../component/message/ConversationHeader";
import ConversationItem from "../../../../component/message/ConversationItem";

const mockData = [
  {
    id: "1",
    name: "Tình iu tuyệt vời",
    avatar:
      "https://i.pinimg.com/originals/25/6a/e4/256ae40f4af0b506f7f6ffdbb9a09a1e.jpg",
    lastMessage: "Đi hắn lên viae hè ấy",
    time: "08:31",
  },
  {
    id: "2",
    name: "Đặng Hữu Thắng",
    avatar:
      "https://i.pinimg.com/564x/4e/1e/f8/4e1ef86d080d5e86043cb6805ae0c2f5.jpg",
    lastMessage: "Ôm để mờ làm",
    time: "20:01",
  },
];

export default function ConversationScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ConversationHeader />

      <FlatList
        data={mockData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            avatar={item.avatar}
            name={item.name}
            lastMessage={item.lastMessage}
            time={item.time}
            //onPress={() => router.push(`/conversation/${item.id}`)}
          />
        )}
      />
    </View>
  );
}
