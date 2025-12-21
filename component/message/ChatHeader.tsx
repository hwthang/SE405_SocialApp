import { Avatars } from "@/public/img/avatar";
import { router } from "expo-router";
import { ChevronLeft, Phone, Video } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import CustomHeader from "../custom/CustomHeader";

type ChatHeaderProps = {
  title: string;
  avatar?: string;
  isOnline?: boolean;
  subtitle?: string;
  onCallPress?: () => void;
  onVideoCallPress?: () => void;
};

const ICON_COLOR = "white"; // 🎨 theme icon
const ICON_SIZE = 22;

const ChatHeader = ({
  title,
  avatar,
  isOnline = false,
  subtitle,
  onCallPress,
  onVideoCallPress,
}: ChatHeaderProps) => {
  return (
    <CustomHeader>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LEFT */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <TouchableOpacity onPress={() => router.replace('/(main)/(tabs)/conversation')}>
            <ChevronLeft color={ICON_COLOR} size={26} />
          </TouchableOpacity>

          {/* Avatar */}
          <View style={{ marginHorizontal: 10 }}>
            <View
              style={{
                height: 44,
                width: 44,
                borderWidth: 1,
                borderColor: "white",
                borderRadius: 999,
              }}
            >
              <Image
                source={avatar ? { uri: avatar } : Avatars.cat}
                style={{
                  height: "100%",
                  width: "100%",
                  borderRadius: 999,
                }}
              />
              {isOnline && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#22c55e",
                    borderWidth: 2,
                    borderColor: "#000",
                  }}
                />
              )}
            </View>
          </View>

          {/* Title */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "white",
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#d1d5db",
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {subtitle ?? (isOnline ? "Đang hoạt động" : "Ngoại tuyến")}
            </Text>
          </View>
        </View>

        {/* RIGHT ICONS */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
          }}
        >
          <TouchableOpacity onPress={onCallPress}>
            <Phone color={ICON_COLOR} size={ICON_SIZE} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onVideoCallPress}>
            <Video color={ICON_COLOR} size={ICON_SIZE} />
          </TouchableOpacity>
        </View>
      </View>
    </CustomHeader>
  );
};

export default ChatHeader;
