import React, { ReactNode } from "react";
import { Text, TouchableOpacity } from "react-native";

const CustomButton = ({
  children = <Text>Button</Text>,
  onPress,
}: {
  children: ReactNode;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity style={{ borderWidth: 1, width: 90 }} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

export default CustomButton;
