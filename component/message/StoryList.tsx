import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

const StoryList = ({ data }: any) => {
  return (
    <View
      style={{
        height: 110,
        backgroundColor: "white",
        paddingVertical: 10,
        paddingLeft: 10,
        borderBottomWidth: 1,
        borderColor: "#eee",
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {data?.map((item: any, index: number) => (
          <View
            key={index}
            style={{
              width: 70,
              marginRight: 15,
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: item.avatar }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: "#ff4f9a",
              }}
            />
            <Text style={{ fontSize: 12, marginTop: 5 }} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default StoryList;
