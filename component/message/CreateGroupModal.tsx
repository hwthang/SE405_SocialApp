import { CustomBottomModal } from "@/component/custom/CustomBottomModal";
import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type Friend = {
  friendId: string;
  name: string;
  avatar: string | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  friends: Friend[];
  loading: boolean;
};

export default function CreateGroupModal({
  visible,
  onClose,
  friends,
  loading,
}: Props) {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
useEffect(()=>{console.log(friends), console.log(2)},[])
  /* ===================== FILTER ===================== */
  const filteredFriends = useMemo(() => {
    if (!search.trim()) return friends;
    return friends.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [friends, search]);

  /* ===================== SELECT ===================== */
  const toggleFriend = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ===================== ACTION ===================== */
  const handleConfirm = async () => {
    console.log("📌 Group name:", groupName);
    console.log("👥 Selected members:", selectedIds);

    // =============================
    // 1️⃣ CREATE GROUP
    // =============================
    console.log("🚀 Step 1: create group");

    // const groupId = await createGroupApi(groupName)
    const token = await AuthHelper.getInstance().getAccessToken();
    const response = await fetch(`${Api.getInstance().baseUrl}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: "GROUP",
        title: groupName,
      }),
    });

    const result = await response.json();
    console.log(result);

    const fakeGroupId = "GROUP_ID_123"; // mock groupId
    console.log("✅ Group created:", fakeGroupId);

    // =============================
    // 2️⃣ ADD MEMBERS ONE BY ONE
    // =============================
    console.log("🚀 Step 2: add members");

    for (const memberId of selectedIds) {
      console.log(`➕ Add member ${memberId} to group ${fakeGroupId}`);

      // await addMemberApi(fakeGroupId, memberId)
      const response = await fetch(
        `${Api.getInstance().baseUrl}/conversations/${result.data.id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: memberId,
          }),
        }
      );
    }

   

    // reset
    setGroupName("");
    setSearch("");
    setSelectedIds([]);
    onClose();
  };

  /* ===================== RENDER ITEM ===================== */
  const renderItem = ({ item }: { item: Friend }) => {
    const checked = selectedIds.includes(item.friendId);

    return (
      <Pressable
        onPress={() => toggleFriend(item.friendId)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: checked ? Colors.blue[500] : "#ccc",
            marginRight: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: checked ? Colors.blue[500] : "transparent",
          }}
        >
          {checked && <Text style={{ color: "white" }}>✓</Text>}
        </View>

        <Text style={{ fontSize: 16 }}>{item.name}</Text>
      </Pressable>
    );
  };

  return (
    <CustomBottomModal visible={visible} onClose={onClose}>
      <View style={{ padding: 20, flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Tạo nhóm chat</Text>

        {/* GROUP NAME */}
        <TextInput
          placeholder="Tên nhóm"
          value={groupName}
          onChangeText={setGroupName}
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginTop: 16,
          }}
        />

        {/* SEARCH */}
        <TextInput
          placeholder="Tìm thành viên..."
          value={search}
          onChangeText={setSearch}
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginTop: 12,
          }}
        />

        {/* LIST */}
        <View style={{ flex: 1, marginTop: 12 }}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <FlatList
              data={filteredFriends}
              keyExtractor={(item) => item.friendId}
              renderItem={renderItem}
            />
          )}
        </View>

        {/* ACTION */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 12,
          }}
        >
          <Pressable onPress={onClose}>
            <Text style={{ color: "#666", marginRight: 16 }}>Hủy</Text>
          </Pressable>

          <Pressable
            disabled={!groupName || selectedIds.length === 0}
            onPress={handleConfirm}
          >
            <Text
              style={{
                color: Colors.blue[500],
                fontWeight: "600",
                opacity: !groupName || selectedIds.length === 0 ? 0.5 : 1,
              }}
            >
              Xác nhận
            </Text>
          </Pressable>
        </View>
      </View>
    </CustomBottomModal>
  );
}
