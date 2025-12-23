import { Colors } from "@/constant/Colors";
import { Api } from "@/helper/Api";
import { AuthHelper } from "@/helper/AuthHelper";
import { Clock, RotateCw, ShieldCheck, Waypoints } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

const MyQr = () => {
  const [qr, setQr] = useState<any>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [loading, setLoading] = useState(false);

  const isExpired = remainingMs <= 0;

  const getQr = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${Api.getInstance().baseUrl}/friends/invite-code`,
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await AuthHelper.getInstance().getAccessToken()}`,
          },
        }
      );
      const result = await response.json();
      setQr(result.data);
    } catch (err) {
      console.log("Get QR error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getQr();
  }, [getQr]);

  useEffect(() => {
    if (!qr?.expiresAt) return;
    const expireTime = new Date(qr.expiresAt).getTime();
    const tick = () => {
      const diff = expireTime - Date.now();
      setRemainingMs(diff <= 0 ? 0 : diff);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [qr?.expiresAt]);

  const countdownText = useMemo(() => {
    if (remainingMs <= 0) return "00:00";
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [remainingMs]);

  if (!qr && loading) return <ActivityIndicator color={Colors.blue[500]} style={{ marginTop: 50 }} />;

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        
        {/* Nút Refresh Mini - Nằm ngoài góc phải */}
        <TouchableOpacity
          onPress={getQr}
          disabled={!isExpired || loading}
          activeOpacity={0.6}
          style={[
            styles.floatingRefresh,
            isExpired && styles.floatingRefreshActive
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.blue[600]} />
          ) : (
            <RotateCw size={18} color={isExpired ? Colors.blue[600] : "#CBD5E1"} />
          )}
        </TouchableOpacity>

        {/* Header Label */}
        <View style={styles.labelRow}>
          <ShieldCheck size={14} color={isExpired ? "#94A3B8" : "#10B981"} />
          <Text style={[styles.labelText, isExpired && { color: "#94A3B8" }]}>
            {isExpired ? "MÃ ĐÃ HẾT HẠN" : "MÃ ĐANG HOẠT ĐỘNG"}
          </Text>
        </View>

        {/* Main QR Card */}
        <View style={styles.qrCard}>
          <View style={[styles.qrFrame, isExpired && styles.qrBlur]}>
            <QRCode 
              value={qr?.ownerId || "expired"} 
              size={170} 
              quietZone={10}
              color="#1E293B"
            />
          </View>

          {/* Logo Brand lồng giữa */}
          <View style={[styles.brandLogo, isExpired && { backgroundColor: "#94A3B8" }]}>
            <Waypoints size={20} color="white" />
          </View>

          {/* Expired Message */}
          {isExpired && !loading && (
            <View style={styles.expiredOverlay}>
              <View style={styles.warningCircle}>
                <Clock size={24} color="#EF4444" />
              </View>
              <Text style={styles.expiredHint}>Vui lòng làm mới mã</Text>
            </View>
          )}
        </View>

        {/* Footer Countdown */}
        <View style={styles.footer}>
          <Text style={[styles.timer, isExpired && { color: "#EF4444" }]}>
            {countdownText}
          </Text>
          <Text style={styles.footerSub}>Tự động thay đổi để bảo mật</Text>
        </View>

      </View>
    </View>
  );
};

export default MyQr;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom:40
  },
  container: {
    width: 260,
    alignItems: 'center',
    paddingTop: 30, // Chừa chỗ cho nút refresh nằm ngoài
  },
  floatingRefresh: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  floatingRefreshActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  labelText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 1,
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow tinh tế kiểu Apple
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  qrFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 4,
  },
  qrBlur: {
    opacity: 0.04,
  },
  brandLogo: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.blue[500],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: '#FFFFFF',
    // Đổ bóng cho logo nổi lên
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  expiredOverlay: {
    position: "absolute",
    alignItems: "center",
  },
  warningCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  expiredHint: {
    color: '#475569',
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  timer: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    fontVariant: ['tabular-nums'], // Giúp con số không bị nhảy khi nhảy giây
  },
  footerSub: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
    fontWeight: '500',
  }
});