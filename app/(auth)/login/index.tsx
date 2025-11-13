import CustomButton from "@/component/custom/CustomButton";
import { AuthHelper } from "@/helper/AuthHelper";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const LoginScreen = () => {
  const auth = AuthHelper.getInstance(); // lấy instance duy nhất

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>LoginScreen</Text>

      <CustomButton
        onPress={() => {
          router.replace("/(auth)/register");
        }}
      >
        <Text>Đăng ký</Text>
      </CustomButton>

      <CustomButton
        onPress={() => {
          auth.setIsAdmin(false); // đăng nhập user
          router.replace("/(main)/(tabs)/home");
        }}
      >
        <Text>Đăng nhập user</Text>
      </CustomButton>

      <CustomButton
        onPress={() => {
          auth.setIsAdmin(true); // đăng nhập admin
          router.replace("/(main)/(tabs)/account");
        }}
      >
        <Text>Đăng nhập admin</Text>
      </CustomButton>
    </View>
  );
};

export default LoginScreen;
