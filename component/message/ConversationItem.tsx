import { Avatars } from "@/public/img/avatar";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const ConversationItem = ({
  avatar,
  name,
  lastMessage,
  time,
  isUnread = false, // Đổi từ unread thành isUnread cho khớp với Screen cha
  typing = false,
  isOnline = false, // Đổi từ online thành isOnline cho khớp với Screen cha
  onPress,
}: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: "white", // Đảm bảo nền đồng nhất
      }}
    >
      {/* KHỐI AVATAR & TRẠNG THÁI ONLINE */}
      <View>
        <Image
          source={avatar ? { uri: avatar } : Avatars.cat}
          style={{ width: 55, height: 55, borderRadius: 27.5 }}
        />

        {isOnline && (
          <View
            style={{
              width: 14,
              height: 14,
              backgroundColor: "#4CAF50",
              borderRadius: 7,
              position: "absolute",
              bottom: 2,
              right: 2,
              borderWidth: 2,
              borderColor: "white",
            }}
          />
        )}
      </View>

      {/* KHỐI NỘI DUNG CHÍNH */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text 
          style={{ 
            fontSize: 16, 
            fontWeight: isUnread ? "bold" : "600",
            color: "#000" 
          }}
        >
          {name}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            fontSize: 14,
            // Tô đậm tin nhắn nếu chưa đọc, đổi sang màu đen để nổi bật
            color: isUnread ? "#000" : "#666",
            fontWeight: isUnread ? "800" : "400",
            fontStyle: typing ? "italic" : "normal",
            marginTop: 2,
          }}
        >
          {typing ? "Đang nhập..." : lastMessage}
        </Text>
      </View>

      {/* KHỐI THỜI GIAN & CHỈ BÁO CHƯA ĐỌC */}
      <View style={{ alignItems: "flex-end", minWidth: 60 }}>
        <Text 
          style={{ 
            color: isUnread ? "#ff4f9a" : "#666", 
            fontSize: 11,
            fontWeight: isUnread ? "bold" : "400"
          }}
        >
          {time}
        </Text>

        {isUnread && (
          <View
            style={{
              backgroundColor: "#ff4f9a",
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 6,
              paddingHorizontal: 4,
            }}
          >
            {/* Nếu API trả về số lượng tin nhắn chưa đọc cụ thể bạn có thể thay số 1 này */}
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
              !
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ConversationItem;