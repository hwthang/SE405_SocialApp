// import { Colors } from "@/constant/Color";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { Avatars } from "@/public/img/avatar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { WaypointsIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import CustomHeader from "./custom/CustomHeader";

const MainHeader = () => {
  const [avatarUrl, setAvatarUrl] = useState<any>();
  const fetchMe = async () => {
    const response = await fetch(`${Api.getInstance().baseUrl}/users/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
      },
    });
    const result = await response.json();
    await AsyncStorage.setItem("USER", JSON.stringify(result.data));
  };

  useEffect(() => {
    fetchMe();
  }, []);
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
          <WaypointsIcon color={"white"} size={36} />
          <Text
            style={{
              fontSize: 20,
              color: "white",
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
            onPress={() => router.replace("/(main)/option")}
          >
            <Image
              source={avatarUrl?.url ? { uri: avatarUrl.url } : Avatars.cat}
              style={{ height: "100%", aspectRatio: 1, borderRadius: 1000 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </CustomHeader>
  );
};

export default MainHeader;
