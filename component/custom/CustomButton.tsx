import React, { ReactNode } from "react";
import { TouchableOpacity } from "react-native";

const CustomButton = ({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      style={{ borderWidth: 1 }}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

export default CustomButton;
