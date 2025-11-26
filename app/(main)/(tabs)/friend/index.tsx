import TagChips from "@/component/friend/TagChip";
import { Colors } from "@/constant/Colors";
import { FriendSuggestionTags } from "@/constant/TagExample";
import { Avatars } from "@/public/img/avatar";
import { Trash, UserPlus } from "lucide-react-native";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

const FriendScreen = () => {
  return (
    <View>
      <Text>FriendScreen</Text>

      <FlatList
        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
        keyExtractor={(item) => item.toString()}
        renderItem={() => (
          <View
            style={{
              marginVertical: 10,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              gap: 10,
            }}
          >
            <Image
              source={Avatars.cat}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />

            <View style={{ flex: 1, flexDirection: "row" }}>
              {/* Info */}
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: "600", paddingTop: 20 }}
                >
                  Đặng Hữu Thắng
                </Text>
                <View style={{ flex: 1, padding: 10 }}>
                  <TagChips tags={FriendSuggestionTags} maxDisplay={5} />
                </View>
              </View>

              {/* Actions */}
              <View
                style={{
                  width: 56,
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    width: 56,
                    aspectRatio: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: Colors.blue[400],
                    borderRadius: 1000,
                  }}
                >
                  <UserPlus color={"white"} size={24} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    width: 56,
                    height: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: Colors.gray[400],
                    borderRadius: 1000,
                  }}
                >
                  <Trash color={"white"} size={16} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default FriendScreen;
