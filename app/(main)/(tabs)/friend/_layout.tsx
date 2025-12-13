import BackHeader from "@/component/BackHeader";
import MainHeader from "@/component/MainHeader";
import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ header: () => <MainHeader /> }} />
      <Stack.Screen name="map" options={{ header: () => <BackHeader /> }} />
    </Stack>
  );
};

export default _layout;

const styles = StyleSheet.create({});
