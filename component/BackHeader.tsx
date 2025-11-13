import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import CustomHeader from "./custom/CustomHeader";

const BackHeader = ({ onBack }: { onBack: () => void }) => {
  return (
    <CustomHeader>
      <TouchableOpacity onPress={onBack}>
        <ChevronLeft />
      </TouchableOpacity>
    </CustomHeader>
  );
};

export default BackHeader;
