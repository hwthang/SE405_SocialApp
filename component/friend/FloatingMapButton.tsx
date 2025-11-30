import { MapPin } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

const FloatingMapButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
      <MapPin size={24} color="#fff" />
    </TouchableOpacity>
  );
};

export default FloatingMapButton;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // shadow cho Android
    shadowColor: "#000", // shadow cho iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
