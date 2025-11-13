import CustomButton from "@/component/custom/CustomButton";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const RegisterScreen = () => {
  return (
    <View>
      <Text>RegisterScreen</Text>
      <CustomButton
        children={undefined}
        onPress={() => {
          router.replace("/(auth)/login");
        }}
      />
    </View>
  );
};

export default RegisterScreen;
