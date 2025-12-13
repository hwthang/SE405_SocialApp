// import { Colors } from "@/constant/Color";
import { router } from "expo-router";
import { WaypointsIcon } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import CustomHeader from "./custom/CustomHeader";

const MainHeader = () => {
  return (
    <CustomHeader>
      <View
        style={{
          // borderWidth: 1,
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <View
          style={{
            // borderWidth: 1,
            display: "flex",
            height: "100%",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <WaypointsIcon color={'white'} size={36} />
          <Text
            style={{
              fontSize: 20,
              color: 'white',
              fontWeight: "900",
              letterSpacing: 4,
            }}
          >
            SOCIAL
          </Text>
        </View>
        <View
          style={{
            // borderWidth: 1,
            display: "flex",
            height: "100%",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 2,
            }}
            onPress={()=>router.replace("/(main)/profile")}
          >
            <Image
              source={{
                uri: "https://mochicat.vn/wp-content/uploads/2025/06/f7370fb06b911cf3817da25819d5ecd0.jpg",
              }}
              style={{ height: "100%", aspectRatio: 1, borderRadius: 1000 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </CustomHeader>
  );
};

export default MainHeader;
