import BackHeader from "@/component/BackHeader";
import { Stack } from "expo-router";
import React from "react";

const MainLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="profile/index"
        options={{
          header: () => <BackHeader />,
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default MainLayout;
