import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RotateCw, Waypoints } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

const MyQr = () => {
  const [qr, setQr] = useState<any>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [loading, setLoading] = useState(false);

  const isExpired = remainingMs <= 0;

  // ===== Fetch QR =====
  const getQr = useCallback(async () => {
    try {
      setLoading(true);

      await AsyncStorage.getItem("USER"); // giữ nếu backend cần

      const response = await fetch(
        `${Api.getInstance().baseUrl}/friends/invite-code`,
        {
          method:'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
          },
        }
      );

      const result = await response.json();
      console.log(result.data)
      setQr(result.data);
    } catch (err) {
      console.log("Get QR error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== Load lần đầu =====
  useEffect(() => {
    getQr();
  }, []);

  // ===== Countdown + auto reset =====
  useEffect(() => {
    if (!qr?.expiresAt) return;

    const expireTime = new Date(qr.expiresAt).getTime();

    const tick = () => {
      const diff = expireTime - Date.now();

      if (diff <= 0) {
        setRemainingMs(0);
        getQr(); // ⭐ auto reset khi hết hạn
      } else {
        setRemainingMs(diff);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [qr?.expiresAt, getQr]);

  // ===== Format mm:ss =====
  const countdownText = useMemo(() => {
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }, [remainingMs]);

  if (!qr) return null;

  return (
    <View style={styles.container}>
      {isExpired && (
          <View style={styles.expiredOverlay}>
            <Text style={styles.expiredText}>QR đã hết hạn</Text>
          </View>
        )}
         {/* Countdown */}
      {!isExpired && (
        <Text style={styles.countdownText}>
          Hết hạn sau {countdownText}
        </Text>
      )}
      {/* QR */}
      <View style={styles.wrapper}>
        <View style={{ opacity: isExpired ? 0.3 : 1 }}>
          <QRCode value={qr.ownerId} size={180} />
        </View>

        {/* Icon giữa */}
        <View style={styles.iconOverlay}>
          <Waypoints size={24} color="white" />
        </View>

        {/* Expired overlay */}
        
      </View>

     

      {/* Manual reset */}
      <TouchableOpacity
        onPress={getQr}
        disabled={loading}
        style={styles.resetBtn}
      >
        <RotateCw size={16} color={Colors.gray[700]} />
        <Text style={styles.resetText}>
          {loading ? "Đang tạo..." : "Tạo mã mới"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MyQr;

/* =====================
          Styles
===================== */
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.gray[400],
    height: 200,
    width: 200,
  },

  iconOverlay: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: Colors.blue[300],
    alignItems: "center",
    justifyContent: "center",
  },

  expiredOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  expiredText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 14,
  },

  countdownText: {
    marginBottom: 8,
    fontSize: 12,
    color: Colors.gray[600],
  },

  resetBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },

  resetText: {
    fontSize: 14,
    color: Colors.gray[700],
  },
});
