import CustomButton from "@/component/custom/CustomButton";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const ProfileScreen = () => {
  return (
    <View>
      <Text>ProfileScreen</Text>
      <CustomButton onPress={() => router.replace("/(auth)/login")}>
        <Text>Logout</Text>
      </CustomButton>
    </View>
  );
};

export default ProfileScreen;
