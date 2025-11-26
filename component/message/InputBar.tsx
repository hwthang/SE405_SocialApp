import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

const InputBar = ({ value, onChange, onSend }: any) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderColor: "#ddd",
      }}
    >
      <TouchableOpacity>
        <Ionicons name="add-circle-outline" size={28} color="#ff4f9a" />
      </TouchableOpacity>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Aa"
        style={{
          flex: 1,
          fontSize: 16,
          paddingHorizontal: 12,
          marginHorizontal: 10,
          backgroundColor: "#f2f2f2",
          borderRadius: 20,
          height: 40,
        }}
      />

      <TouchableOpacity onPress={onSend}>
        <Ionicons name="send" size={26} color="#ff4f9a" />
      </TouchableOpacity>
    </View>
  );
};

export default InputBar;
