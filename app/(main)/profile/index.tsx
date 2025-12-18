import CustomButton from "@/component/custom/CustomButton";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
const ProfileScreen = () => {
  return (
    <View>
     

      <CustomButton onPress={() => router.replace("/(auth)/login")}>
        <Text>Logout</Text>
      </CustomButton>
      <CustomButton onPress={() => router.replace("/(main)/qr")}>
        <Text>scan qr</Text>
      </CustomButton>
    </View>
  );
};

export default ProfileScreen;
