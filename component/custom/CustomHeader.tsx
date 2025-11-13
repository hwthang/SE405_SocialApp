import React, { ReactNode } from "react";
import { Platform, StatusBar, View } from "react-native";

type CustomHeaderProps = {
  children: ReactNode;
};

const CustomHeader = ({ children }: CustomHeaderProps) => {
  const paddingTop = Platform.OS === "android" ? StatusBar.currentHeight : 20;

  return (
    <View
      style={{
        height: 100,
        borderWidth: 1,
        borderColor: "#ddd",
        paddingTop: paddingTop,
        paddingBottom: 10,
        paddingHorizontal: 10,
        justifyContent: "center",
        marginBottom: 10,
        backgroundColor: "white",
        // Shadow cho iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 }, // chỉ xuống dưới
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      {children}
    </View>
  );
};

export default CustomHeader;