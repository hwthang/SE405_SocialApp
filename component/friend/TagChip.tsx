import React from "react";
import { StyleSheet, Text, TextStyle, TouchableOpacity, View } from "react-native";

interface Tag {
  key: string;
  value: string;
  variant?: "status-online" | "status-offline" | "success" | "warning" | "info";
}

interface TagChipsProps {
  tags: Tag[];
  maxDisplay?: number;
  onPressTag?: (tag: Tag) => void; // <--- Thêm callback
}

const TagChips: React.FC<TagChipsProps> = ({ tags, maxDisplay, onPressTag }) => {
  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;

  return (
    <View style={styles.container}>
      {displayTags.map((tag) => (
        <TouchableOpacity
          key={tag.key}
          style={[styles.chip, variantStyle(tag.variant)]}
          onPress={() => onPressTag?.(tag)} // <--- gọi callback khi nhấn
          activeOpacity={0.7}
        >
          {tag.variant?.startsWith("status") && (
            <View style={[styles.dot, dotStyle(tag.variant)]} />
          )}
          <Text style={[styles.chipText, variantTextStyle(tag.variant)]}>
            {tag.value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TagChips;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  chipText: {
    fontSize: 12,
    color: "#333",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});

const variantStyle = (variant?: string) => {
  switch (variant) {
    case "status-online": return { backgroundColor: "#D4FCDC" };
    case "status-offline": return { backgroundColor: "#E8E8E8" };
    case "success": return { backgroundColor: "#C8F7C5" };
    case "warning": return { backgroundColor: "#FFE6C8" };
    case "info": return { backgroundColor: "#D6ECFF" };
    default: return {};
  }
};

const variantTextStyle = (variant?: string): TextStyle => {
  switch (variant) {
    case "status-online": return { color: "#28A745", fontWeight: "600" as TextStyle["fontWeight"] };
    case "status-offline": return { color: "#777" };
    case "success": return { color: "#3C8D40" };
    case "warning": return { color: "#D68A00" };
    case "info": return { color: "#1D70C9" };
    default: return {};
  }
};

const dotStyle = (variant?: string) => {
  switch (variant) {
    case "status-online": return { backgroundColor: "#28A745" };
    case "status-offline": return { backgroundColor: "#777" };
    default: return {};
  }
};
