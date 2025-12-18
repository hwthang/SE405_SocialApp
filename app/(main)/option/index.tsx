import MyQr from "@/component/profile/MyQr";
import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { ChevronRight, LogOut, ScanQrCode, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const OptionScreen = () => {
  const [qr, setQr] = useState<any>();

  const getQr = async () => {
    const user = await AsyncStorage.getItem("USER");

    const response = await fetch(
      `${Api.getInstance().baseUrl}/friends/invite-code`,
      {
        headers: {
          "Conten-Type": "application/json",
          Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
        },
      }
    );

    const result = await response.json(); 

    console.log(result.data)

    setQr(result.data)
  };

  useEffect(() => {
    getQr();
  }, []);
  return (
    <View style={{ display: "flex", margin: 16 }}>
      <View
        style={{
          display: "flex",
          padding: 16,
          alignItems: "center",
          position: "relative",
        }}
      >
        <MyQr/>
        <Link
          href={"/(main)/qr"}
          style={{ position: "absolute", top: 0, right: 0 }}
        >
          <ScanQrCode size={36} strokeWidth={1.25} />
        </Link>
        <Text style={{ marginTop: 10, color: Colors.gray[500] }}>
          Quét mã QR để kết bạn với tôi
        </Text>
      </View>

      <View style={{ display: "flex", gap: 16 }}>
        <TouchableOpacity style={styles.button}>
          <View style={styles.row}>
            <View style={styles.left}>
              <User size={20} color={Colors.gray[700]} />
              <Text style={styles.text}>Hồ sơ của bạn</Text>
            </View>
            <ChevronRight size={20} color={Colors.gray[400]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={AuthHelper.getInstance().logOut}
        >
          <View style={styles.row}>
            <View style={styles.left}>
              <LogOut size={20} color={Colors.gray[700]} />
              <Text style={styles.text}>Đăng xuất</Text>
            </View>
            <ChevronRight size={20} color={Colors.gray[400]} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OptionScreen;

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: Colors.gray[400],
    padding: 16,
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  text: {
    fontSize: 16,
    color: Colors.gray[800],
  },
});
