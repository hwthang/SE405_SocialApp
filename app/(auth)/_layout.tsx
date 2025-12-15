import { Stack } from "expo-router";
import React from "react";

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="login/index" options={{headerShown:false}}/>
      <Stack.Screen name="register/index" options={{headerShown:false}}/>
    </Stack>
  );
};

export default AuthLayout;
