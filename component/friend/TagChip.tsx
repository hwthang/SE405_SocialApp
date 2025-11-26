import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Tag {
  key: string;
  value: string;
}

interface TagChipsProps {
  tags: Tag[];           // Mảng tag truyền vào
  maxDisplay?: number;   // Tùy chọn: số tag hiển thị tối đa
}

const TagChips: React.FC<TagChipsProps> = ({ tags, maxDisplay }) => {
  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;

  return (
    <View style={styles.container}>
      {displayTags.map((tag) => (
        <View key={tag.key} style={styles.chip}>
          <Text style={styles.chipText}>{tag.value}</Text>
        </View>
      ))}
    </View>
  );
};

export default TagChips;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",  // hiển thị theo hàng ngang
    flexWrap: "wrap",      // xuống dòng khi hết chỗ
    paddingVertical: 10,
    paddingHorizontal: 5,
    gap: 8,                // khoảng cách giữa chip (RN >=0.71)
  },
  chip: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,       // khoảng cách dòng
  },
  chipText: {
    fontSize: 14,
    color: "#333",
  },
});
