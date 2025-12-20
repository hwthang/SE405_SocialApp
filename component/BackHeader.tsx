import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import CustomHeader from "./custom/CustomHeader";

const BackHeader = ({onBack = () => router.replace("/(main)/(tabs)/home")}) => {
  return (
    <CustomHeader>
      <TouchableOpacity onPress={onBack}>
        <ChevronLeft color={"white"} />
      </TouchableOpacity>
    </CustomHeader>
  );
};

export default BackHeader;
